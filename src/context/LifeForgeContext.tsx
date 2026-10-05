import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  LifeForgeState,
  ProposedAction,
  TaskItem,
  StudyRecord,
  ExerciseRecord,
  NutritionMeal,
  Commitment,
  AttendanceStatus,
  CustomField,
  UserProfile,
  UserGoals,
} from '../types/lifeforge';
import { createInitialDemoState, getTodayDateStr } from '../utils/initialState';
import confetti from 'canvas-confetti';

interface LifeForgeContextType {
  state: LifeForgeState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  pendingAction: ProposedAction | null;
  setPendingAction: (action: ProposedAction | null) => void;
  executeAction: (action: ProposedAction) => void;
  rejectAction: (action: ProposedAction) => void;
  // CRUD Helpers
  addTask: (task: Omit<TaskItem, 'id' | 'completed'>) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addStudyRecord: (record: Omit<StudyRecord, 'id'>) => void;
  updateStudyRecord: (id: string, updates: Partial<StudyRecord>) => void;
  deleteStudyRecord: (id: string) => void;

  addExerciseRecord: (record: Omit<ExerciseRecord, 'id'>) => void;
  updateExerciseRecord: (id: string, updates: Partial<ExerciseRecord>) => void;
  deleteExerciseRecord: (id: string) => void;

  addNutritionMeal: (meal: Omit<NutritionMeal, 'id'>) => void;
  updateNutritionMeal: (id: string, updates: Partial<NutritionMeal>) => void;
  deleteNutritionMeal: (id: string) => void;

  addWater: (amountMl: number) => void;
  addSleepRecord: (hours: number, sleepTime: string, wakeTime: string, quality?: any) => void;
  addSocialMediaLog: (minutes: number, platform?: string, notes?: string) => void;

  addCommitment: (commitment: Omit<Commitment, 'id'>) => void;
  updateCommitment: (id: string, updates: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  recordAttendance: (commitmentId: string, status: AttendanceStatus, notes?: string) => void;

  addCustomField: (field: Omit<CustomField, 'id'>) => void;
  logCustomFieldValue: (fieldId: string, value: number, notes?: string) => void;
  deleteCustomField: (fieldId: string) => void;

  updateGoals: (goals: Partial<UserGoals>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // AI chat
  isSendingChat: boolean;
  sendChatMessage: (
    text: string,
    voiceRequested?: boolean,
    playAudio?: boolean
  ) => Promise<{
    success: boolean;
    replyText?: string;
    proposedAction?: ProposedAction;
    audioBase64?: string;
    dynamicQuestions?: string[];
  } | undefined>;
  resetToDemoData: () => void;
  userAuthStatus: 'guest' | 'authenticated' | 'landing';
  setUserAuthStatus: (status: 'guest' | 'authenticated' | 'landing') => void;
  loginUser: (email: string, name?: string) => void;
  registerUser: (name: string, email: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'lifeforge_state_v1';
const AUTH_KEY = 'lifeforge_auth_status';

const LifeForgeContext = createContext<LifeForgeContextType | null>(null);

export const LifeForgeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LifeForgeState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed reading stored state', e);
    }
    return createInitialDemoState();
  });

  const [userAuthStatus, setUserAuthStatus] = useState<'guest' | 'authenticated' | 'landing'>(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_KEY);
      if (savedAuth === 'guest' || savedAuth === 'authenticated' || savedAuth === 'landing') {
        return savedAuth;
      }
    } catch (e) {}
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<ProposedAction | null>(null);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed saving state to local storage', e);
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_KEY, userAuthStatus);
    } catch (e) {}
  }, [userAuthStatus]);

  // SAFE ACTION LAYER - Execute confirmed action against the single source of truth
  const executeAction = (action: ProposedAction) => {
    const today = getTodayDateStr();

    setState((prev) => {
      if (prev.chatHistory.some(msg => msg.proposedAction?.id === action.id && msg.proposedAction.status === 'executed')) return prev;
      let next = { ...prev };
      const payload = action.payload || {};

      switch (action.actionType) {
        case 'record_study': {
          const subject = payload.subject || 'General Study';
          const duration = Number(payload.durationHours || payload.duration || 1);
          const recordDate = payload.date || today;

          // Check if there is already a record for this subject today
          const existingIndex = next.studyRecords.findIndex(
            (s) => s.subject.toLowerCase() === subject.toLowerCase() && s.date === recordDate
          );

          if (existingIndex !== -1 && payload.mode !== 'append') {
            // Update existing record duration and details
            const existing = next.studyRecords[existingIndex];
            const updated: StudyRecord = {
              ...existing,
              durationHours: payload.mode === 'add' ? existing.durationHours + duration : duration,
              topic: payload.topic || existing.topic,
              understandingScore: payload.understandingScore || existing.understandingScore,
              examConfidence: payload.examConfidence || existing.examConfidence,
              notes: payload.notes || existing.notes,
            };
            const copy = [...next.studyRecords];
            copy[existingIndex] = updated;
            next.studyRecords = copy;
          } else {
            const newStudy: StudyRecord = {
              id: `s-${Date.now()}`,
              subject,
              topic: payload.topic || 'Revision & Problem Solving',
              durationHours: duration,
              date: recordDate,
              understandingScore: payload.understandingScore || 4,
              examConfidence: payload.examConfidence || 'high',
              notes: payload.notes || '',
              improvementFromLast: payload.improvementFromLast || '',
            };
            next.studyRecords = [newStudy, ...next.studyRecords];
          }
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
          break;
        }

        case 'update_study': {
          if (payload.id) {
            next.studyRecords = next.studyRecords.map((s) =>
              s.id === payload.id ? { ...s, ...payload } : s
            );
          }
          break;
        }

        case 'delete_study': {
          if (payload.id) {
            next.studyRecords = next.studyRecords.filter((s) => s.id !== payload.id);
          }
          break;
        }

        case 'create_task': {
          const newTask: TaskItem = {
            id: `t-${Date.now()}`,
            title: payload.title || 'New Task',
            category: payload.category || 'Study',
            dueDate: payload.dueDate || today,
            dueTime: payload.dueTime || undefined,
            priority: payload.priority || 'medium',
            isRecurring: !!payload.isRecurring,
            recurringType: payload.recurringType || undefined,
            completed: false,
          };
          next.tasks = [newTask, ...next.tasks];
          break;
        }

        case 'complete_task': {
          const query = (payload.taskTitle || payload.title || payload.id || '').toLowerCase().trim();
          next.tasks = next.tasks.map((t) => {
            const matchesId = payload.id && t.id === payload.id;
            const matchesTitle = !payload.id && query && t.title.toLowerCase().includes(query);
            if (matchesId || matchesTitle) {
              return { ...t, completed: true, completedAt: new Date().toISOString() };
            }
            return t;
          });
          confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
          break;
        }

        case 'delete_task': {
          if (payload.id) {
            next.tasks = next.tasks.filter((t) => t.id !== payload.id);
          }
          break;
        }

        case 'record_workout': {
          const newWorkout: ExerciseRecord = {
            id: `e-${Date.now()}`,
            activity: payload.activity || 'Workout',
            durationMinutes: Number(payload.durationMinutes || 30),
            details: payload.details || 'Completed workout session',
            intensity: payload.intensity || 'moderate',
            date: payload.date || today,
            notes: payload.notes || '',
          };
          next.exerciseRecords = [newWorkout, ...next.exerciseRecords];
          confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
          break;
        }

        case 'record_meal': {
          const newMeal: NutritionMeal = {
            id: `n-${Date.now()}`,
            mealType: payload.mealType || 'Lunch',
            foods: Array.isArray(payload.foods)
              ? payload.foods
              : [payload.food || payload.foods || 'Balanced Meal'],
            calories: Number(payload.calories ?? 450),
            protein: Number(payload.protein ?? 20),
            carbs: Number(payload.carbs ?? 50),
            fat: Number(payload.fat ?? 15),
            time: payload.time || new Date().toTimeString().slice(0, 5),
            date: payload.date || today,
            aiEstimated: !!payload.aiEstimated,
            portionNotes: payload.portionNotes || '',
          };
          next.nutritionMeals = [newMeal, ...next.nutritionMeals];
          break;
        }

        case 'record_water': {
          let amount = 0;
          if (payload.amountMl) {
            amount = Number(payload.amountMl);
          } else if (payload.amountLiters) {
            amount = Math.round(Number(payload.amountLiters) * 1000);
          } else if (payload.amount) {
            const num = Number(payload.amount);
            amount = num <= 15 ? Math.round(num * 1000) : num;
          } else {
            amount = 250;
          }

          if (payload.mode === 'set') {
            const newWater = {
              id: `w-${Date.now()}`,
              amountMl: amount,
              time: new Date().toTimeString().slice(0, 5),
              date: today,
            };
            next.waterLogs = [newWater, ...next.waterLogs.filter((w) => w.date !== today)];
          } else {
            const newWater = {
              id: `w-${Date.now()}`,
              amountMl: amount,
              time: new Date().toTimeString().slice(0, 5),
              date: today,
            };
            next.waterLogs = [newWater, ...next.waterLogs];
          }
          confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
          break;
        }

        case 'record_sleep': {
          const hours = Number(payload.durationHours || payload.hours || 7.5);
          const newSleep = {
            id: `sl-${Date.now()}`,
            sleepTime: payload.sleepTime || '23:00',
            wakeTime: payload.wakeTime || '07:00',
            durationHours: hours,
            targetHours: prev.profile.goals.sleepHoursDaily,
            quality: payload.quality || 'good',
            date: payload.date || today,
            notes: payload.notes || '',
          };
          // remove existing for same date
          next.sleepRecords = [newSleep, ...next.sleepRecords.filter((s) => s.date !== (payload.date || today))];
          break;
        }

        case 'record_social_media': {
          const mins = Number(payload.durationMinutes || payload.minutes || 30);
          const newSocial = {
            id: `sm-${Date.now()}`,
            durationMinutes: mins,
            platform: payload.platform || 'General',
            morningRestrictedViolated: !!payload.morningRestrictedViolated,
            nightRestrictedViolated: !!payload.nightRestrictedViolated,
            date: payload.date || today,
            notes: payload.notes || '',
          };
          next.socialMediaLogs = [newSocial, ...next.socialMediaLogs];
          break;
        }

        case 'update_goals': {
          next.profile = {
            ...next.profile,
            goals: {
              ...next.profile.goals,
              ...payload,
            },
          };
          break;
        }

        case 'update_commitment': {
          if (payload.id) {
            next.commitments = next.commitments.map((c) =>
              c.id === payload.id ? { ...c, ...payload } : c
            );
          } else {
            next.commitments = [
              ...next.commitments,
              {
                id: `c-${Date.now()}`,
                name: payload.name || 'New Commitment',
                type: payload.type || 'College',
                startTime: payload.startTime || '09:00',
                endTime: payload.endTime || '17:00',
                days: payload.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                status: 'active',
              },
            ];
          }
          break;
        }

        case 'record_attendance': {
          const status = (payload.status || 'Attended') as AttendanceStatus;
          const commName = (payload.commitmentName || payload.name || '').toLowerCase();
          const targetComm = next.commitments.find((c) =>
            commName ? c.name.toLowerCase().includes(commName) : true
          ) || next.commitments[0];

          if (targetComm) {
            const newAtt = {
              id: `att-${Date.now()}`,
              commitmentId: targetComm.id,
              date: payload.date || today,
              status,
              notes: payload.notes || `Logged via AI Assistant`,
            };
            next.attendanceRecords = [
              newAtt,
              ...next.attendanceRecords.filter(
                (a) => !(a.commitmentId === targetComm.id && a.date === (payload.date || today))
              ),
            ];
          }
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
          break;
        }

        case 'create_custom_field': {
          const newField: CustomField = {
            id: `cf-${Date.now()}`,
            name: payload.name || 'Custom Habit',
            target: Number(payload.target || 30),
            unit: payload.unit || 'mins',
            frequency: payload.frequency || 'daily',
            description: payload.description || '',
          };
          next.customFields = [...next.customFields, newField];
          break;
        }

        case 'record_custom_log': {
          const newLog = {
            id: `cfl-${Date.now()}`,
            fieldId: payload.fieldId,
            value: Number(payload.value || 1),
            date: payload.date || today,
            notes: payload.notes || '',
          };
          next.customFieldLogs = [newLog, ...next.customFieldLogs];
          break;
        }
      }

      // Mark action executed in chat messages
      next.chatHistory = next.chatHistory.map((msg) => {
        if (msg.proposedAction?.id === action.id) {
          return {
            ...msg,
            proposedAction: {
              ...msg.proposedAction,
              status: 'executed',
            },
          };
        }
        return msg;
      });

      return next;
    });

    setPendingAction(null);
  };

  const rejectAction = (action: ProposedAction) => {
    setState((prev) => ({
      ...prev,
      chatHistory: prev.chatHistory.map((msg) => {
        if (msg.proposedAction?.id === action.id) {
          return {
            ...msg,
            proposedAction: {
              ...msg.proposedAction,
              status: 'rejected',
            },
          };
        }
        return msg;
      }),
    }));
    setPendingAction(null);
  };

  // Direct manual CRUD operations that also modify the same single database
  const addTask = (task: Omit<TaskItem, 'id' | 'completed'>) => {
    const newTask: TaskItem = {
      ...task,
      id: `t-${Date.now()}`,
      completed: false,
    };
    setState((prev) => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const toggleTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      }),
    }));
  };

  const deleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const addStudyRecord = (record: Omit<StudyRecord, 'id'>) => {
    const newRecord: StudyRecord = {
      ...record,
      id: `s-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      studyRecords: [newRecord, ...prev.studyRecords],
    }));
    confetti({ particleCount: 30, spread: 50 });
  };

  const updateStudyRecord = (id: string, updates: Partial<StudyRecord>) => {
    setState((prev) => ({
      ...prev,
      studyRecords: prev.studyRecords.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteStudyRecord = (id: string) => {
    setState((prev) => ({
      ...prev,
      studyRecords: prev.studyRecords.filter((s) => s.id !== id),
    }));
  };

  const addExerciseRecord = (record: Omit<ExerciseRecord, 'id'>) => {
    const newRecord: ExerciseRecord = {
      ...record,
      id: `e-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      exerciseRecords: [newRecord, ...prev.exerciseRecords],
    }));
  };

  const updateExerciseRecord = (id: string, updates: Partial<ExerciseRecord>) => {
    setState((prev) => ({
      ...prev,
      exerciseRecords: prev.exerciseRecords.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteExerciseRecord = (id: string) => {
    setState((prev) => ({
      ...prev,
      exerciseRecords: prev.exerciseRecords.filter((e) => e.id !== id),
    }));
  };

  const addNutritionMeal = (meal: Omit<NutritionMeal, 'id'>) => {
    const newMeal: NutritionMeal = {
      ...meal,
      id: `n-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      nutritionMeals: [newMeal, ...prev.nutritionMeals],
    }));
  };

  const updateNutritionMeal = (id: string, updates: Partial<NutritionMeal>) => {
    setState((prev) => ({
      ...prev,
      nutritionMeals: prev.nutritionMeals.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  };

  const deleteNutritionMeal = (id: string) => {
    setState((prev) => ({
      ...prev,
      nutritionMeals: prev.nutritionMeals.filter((m) => m.id !== id),
    }));
  };

  const addWater = (amountMl: number) => {
    const today = getTodayDateStr();
    const newWater = {
      id: `w-${Date.now()}`,
      amountMl,
      time: new Date().toTimeString().slice(0, 5),
      date: today,
    };
    setState((prev) => ({
      ...prev,
      waterLogs: [newWater, ...prev.waterLogs],
    }));
  };

  const addSleepRecord = (hours: number, sleepTime: string, wakeTime: string, quality: any = 'good') => {
    const today = getTodayDateStr();
    const newSleep = {
      id: `sl-${Date.now()}`,
      sleepTime,
      wakeTime,
      durationHours: hours,
      targetHours: state.profile.goals.sleepHoursDaily,
      quality,
      date: today,
    };
    setState((prev) => ({
      ...prev,
      sleepRecords: [newSleep, ...prev.sleepRecords.filter((s) => s.date !== today)],
    }));
  };

  const addSocialMediaLog = (minutes: number, platform = 'General', notes?: string) => {
    const today = getTodayDateStr();
    const newLog = {
      id: `sm-${Date.now()}`,
      durationMinutes: minutes,
      platform,
      morningRestrictedViolated: false,
      nightRestrictedViolated: false,
      date: today,
      notes,
    };
    setState((prev) => ({
      ...prev,
      socialMediaLogs: [newLog, ...prev.socialMediaLogs],
    }));
  };

  const addCommitment = (commitment: Omit<Commitment, 'id'>) => {
    const newCommitment: Commitment = {
      ...commitment,
      id: `c-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      commitments: [...prev.commitments, newCommitment],
    }));
  };

  const updateCommitment = (id: string, updates: Partial<Commitment>) => {
    setState((prev) => ({
      ...prev,
      commitments: prev.commitments.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const deleteCommitment = (id: string) => {
    setState((prev) => ({
      ...prev,
      commitments: prev.commitments.filter((c) => c.id !== id),
      attendanceRecords: prev.attendanceRecords.filter((a) => a.commitmentId !== id),
    }));
  };

  const recordAttendance = (commitmentId: string, status: AttendanceStatus, notes?: string) => {
    const today = getTodayDateStr();
    const newAttendance = {
      id: `att-${Date.now()}`,
      commitmentId,
      date: today,
      status,
      notes,
    };
    setState((prev) => ({
      ...prev,
      attendanceRecords: [newAttendance, ...prev.attendanceRecords.filter((a) => !(a.commitmentId === commitmentId && a.date === today))],
    }));
  };

  const addCustomField = (field: Omit<CustomField, 'id'>) => {
    const newField: CustomField = {
      ...field,
      id: `cf-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));
  };

  const logCustomFieldValue = (fieldId: string, value: number, notes?: string) => {
    const today = getTodayDateStr();
    const newLog = {
      id: `cfl-${Date.now()}`,
      fieldId,
      value,
      date: today,
      notes,
    };
    setState((prev) => ({
      ...prev,
      customFieldLogs: [newLog, ...prev.customFieldLogs],
    }));
  };

  const deleteCustomField = (fieldId: string) => {
    setState((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== fieldId),
      customFieldLogs: prev.customFieldLogs.filter((l) => l.fieldId !== fieldId),
    }));
  };

  const updateGoals = (goals: Partial<UserGoals>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        goals: {
          ...prev.profile.goals,
          ...goals,
        },
      },
    }));
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profile,
      },
    }));
  };

  // SEND CHAT MESSAGE TO LIFEFORGE BRAIN
  const sendingRef = useRef(false);

  const sendChatMessage = async (text: string, voiceRequested: boolean = false, playAudio: boolean = true) => {
    if (!text.trim() || sendingRef.current) return;
    sendingRef.current = true;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: text,
      timestamp: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMsg],
    }));

    setIsSendingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          clientDate: getTodayDateStr(),
          state,
          generateAudio: voiceRequested,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to communicate with LifeForge AI server');

      let proposedActionItem: ProposedAction | undefined = undefined;
      if (data.proposedAction) {
        proposedActionItem = {
          id: `act-${Date.now()}`,
          actionType: data.proposedAction.actionType,
          title: data.proposedAction.title,
          description: data.proposedAction.description,
          requiresConfirmation: data.proposedAction.requiresConfirmation,
          payload: data.proposedAction.payload,
          status: 'pending',
        };

        if (data.proposedAction.requiresConfirmation) {
          setPendingAction(proposedActionItem);
        } else {
          // Auto-execute safe non-destructive logging
          executeAction(proposedActionItem);
          proposedActionItem.status = 'executed';
        }
      }

      const assistantMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: data.replyText,
        timestamp: new Date().toISOString(),
        dynamicQuestions: data.dynamicQuestions || [],
        proposedAction: proposedActionItem,
        audioBase64: data.audioBase64,
      };

      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, assistantMsg],
      }));

      // Play audio if returned or voice requested
      if (playAudio && (voiceRequested || data.audioBase64)) {
        let played = false;
        if (data.audioBase64) {
          try {
            const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
            audio.play()
              .then(() => { played = true; })
              .catch((playErr) => {
                console.warn('Audio play blocked/failed, using speech synthesis fallback:', playErr);
                if ('speechSynthesis' in window && data.replyText) {
                  window.speechSynthesis.cancel();
                  const u = new SpeechSynthesisUtterance(data.replyText);
                  if (/[\u0C00-\u0C7F]/.test(data.replyText)) u.lang = 'te-IN';
                  window.speechSynthesis.speak(u);
                }
              });
          } catch (audioErr) {
            console.warn('Audio initialization error:', audioErr);
          }
        }
        if (!played && !data.audioBase64 && 'speechSynthesis' in window && data.replyText) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(data.replyText);
          if (/[\u0C00-\u0C7F]/.test(data.replyText)) u.lang = 'te-IN';
          window.speechSynthesis.speak(u);
        }
      }
      return {
        success: true,
        replyText: data.replyText,
        proposedAction: proposedActionItem,
        audioBase64: data.audioBase64,
        dynamicQuestions: data.dynamicQuestions,
      };
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant' as const,
        content: `Sorry, I encountered an issue: ${err.message}. Please verify the server connection.`,
        timestamp: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, errorMsg],
      }));
      return {
        success: false,
        replyText: `Sorry, I encountered an issue: ${err.message}. Please verify the server connection.`,
      };
    } finally {
      sendingRef.current = false;
      setIsSendingChat(false);
    }
  };

  const resetToDemoData = () => {
    const demo = createInitialDemoState();
    setState(demo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    setUserAuthStatus('guest');
  };

  const loginUser = (email: string, name?: string) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        email,
        name: name || email.split('@')[0],
        isGuest: false,
      },
    }));
    setUserAuthStatus('authenticated');
  };

  const registerUser = (name: string, email: string) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name,
        email,
        isGuest: false,
      },
    }));
    setUserAuthStatus('authenticated');
  };

  const logout = () => {
    setUserAuthStatus('landing');
  };

  return (
    <LifeForgeContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        pendingAction,
        setPendingAction,
        executeAction,
        rejectAction,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        addStudyRecord,
        updateStudyRecord,
        deleteStudyRecord,
        addExerciseRecord,
        updateExerciseRecord,
        deleteExerciseRecord,
        addNutritionMeal,
        updateNutritionMeal,
        deleteNutritionMeal,
        addWater,
        addSleepRecord,
        addSocialMediaLog,
        addCommitment,
        updateCommitment,
        deleteCommitment,
        recordAttendance,
        addCustomField,
        logCustomFieldValue,
        deleteCustomField,
        updateGoals,
        updateProfile,
        isSendingChat,
        sendChatMessage,
        resetToDemoData,
        userAuthStatus,
        setUserAuthStatus,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {children}
    </LifeForgeContext.Provider>
  );
};

export const useLifeForge = () => {
  const context = useContext(LifeForgeContext);
  if (!context) {
    throw new Error('useLifeForge must be used within a LifeForgeProvider');
  }
  return context;
};
