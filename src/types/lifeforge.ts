export type CommitmentType = 'School' | 'College' | 'Internship' | 'Job' | 'Course' | 'Training' | 'Other';
export type AttendanceStatus = 'Attended' | 'Leave' | 'Holiday' | 'Late';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface UserGoals {
  studyHoursDaily: number;
  waterLitersDaily: number;
  sleepHoursDaily: number;
  socialMediaMaxMinutesDaily: number;
  exerciseDaysPerWeek: number;
  calorieTargetDaily: number;
  proteinTargetDaily: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  goals: UserGoals;
  foodPreferences: string;
  preferredLanguage: 'auto' | 'en' | 'te' | 'te-en';
  motivationStyle: 'honest-evidence' | 'gentle' | 'direct';
  joinedDate: string;
}

export interface TaskItem {
  id: string;
  title: string;
  category: 'Study' | 'Exercise' | 'Commitment' | 'Personal' | 'Health' | 'Custom';
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: PriorityLevel;
  isRecurring: boolean;
  recurringType?: 'daily' | 'weekly';
  completed: boolean;
  completedAt?: string;
}

export interface StudyRecord {
  id: string;
  subject: string;
  topic: string;
  durationHours: number;
  date: string; // YYYY-MM-DD
  understandingScore: number; // 1 to 5
  examConfidence: 'low' | 'medium' | 'high';
  improvementFromLast?: string;
  notes?: string;
}

export interface ExerciseRecord {
  id: string;
  activity: string; // e.g. "Running", "Bench Press", "Yoga", "Cycling", "Push-ups"
  durationMinutes: number;
  details: string; // e.g. "3 km", "3 sets of 10 reps @ 60kg", "Sun Salutations"
  intensity: 'light' | 'moderate' | 'high';
  date: string;
  notes?: string;
}

export interface NutritionMeal {
  id: string;
  mealType: MealType;
  foods: string[];
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  time: string;
  date: string;
  aiEstimated: boolean;
  portionNotes?: string;
  photoUrl?: string;
}

export interface WaterLog {
  id: string;
  amountMl: number;
  time: string;
  date: string;
}

export interface SleepRecord {
  id: string;
  sleepTime: string; // "23:00"
  wakeTime: string; // "07:30"
  durationHours: number;
  targetHours: number;
  quality: 'poor' | 'fair' | 'good' | 'great';
  date: string;
  notes?: string;
}

export interface SocialMediaLog {
  id: string;
  durationMinutes: number;
  platform?: string;
  morningRestrictedViolated: boolean;
  nightRestrictedViolated: boolean;
  date: string;
  notes?: string;
}

export interface Commitment {
  id: string;
  name: string;
  type: CommitmentType;
  startTime: string; // "08:45"
  endTime: string; // "15:30"
  days: string[]; // ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
}

export interface AttendanceRecord {
  id: string;
  commitmentId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface CustomField {
  id: string;
  name: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly';
  description?: string;
}

export interface CustomFieldLog {
  id: string;
  fieldId: string;
  value: number;
  date: string;
  notes?: string;
}

export interface ProposedAction {
  id: string;
  actionType:
    | 'record_study'
    | 'update_study'
    | 'delete_study'
    | 'create_task'
    | 'update_task'
    | 'complete_task'
    | 'delete_task'
    | 'record_workout'
    | 'update_workout'
    | 'delete_workout'
    | 'record_meal'
    | 'record_water'
    | 'record_sleep'
    | 'record_social_media'
    | 'update_goals'
    | 'update_commitment'
    | 'record_attendance'
    | 'create_custom_field'
    | 'record_custom_log';
  title: string;
  description: string;
  requiresConfirmation: boolean;
  payload: any;
  status: 'pending' | 'confirmed' | 'rejected' | 'executed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  proposedAction?: ProposedAction;
  dynamicQuestions?: string[];
  audioBase64?: string;
}

export interface LifeForgeState {
  profile: UserProfile;
  tasks: TaskItem[];
  studyRecords: StudyRecord[];
  exerciseRecords: ExerciseRecord[];
  nutritionMeals: NutritionMeal[];
  waterLogs: WaterLog[];
  sleepRecords: SleepRecord[];
  socialMediaLogs: SocialMediaLog[];
  commitments: Commitment[];
  attendanceRecords: AttendanceRecord[];
  customFields: CustomField[];
  customFieldLogs: CustomFieldLog[];
  chatHistory: ChatMessage[];
}

export interface DailySummary {
  date: string;
  studyHours: number;
  studyTargetHours: number;
  tasksCompleted: number;
  tasksTotal: number;
  waterIntakeLiters: number;
  waterTargetLiters: number;
  sleepHours: number;
  sleepTargetHours: number;
  exerciseCompleted: boolean;
  exerciseMinutes: number;
  socialMediaMinutes: number;
  socialMediaLimitMinutes: number;
  caloriesConsumed: number;
  caloriesTarget: number;
  overallScorePercent: number;
}
