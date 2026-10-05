import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { Commitment, CommitmentType, AttendanceStatus } from '../types/lifeforge';
import { getTodayDateStr } from '../utils/initialState';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';

export const CommitmentsView: React.FC = () => {
  const {
    state,
    addCommitment,
    updateCommitment,
    deleteCommitment,
    recordAttendance,
  } = useLifeForge();

  const today = getTodayDateStr();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<CommitmentType>('College');
  const [startTime, setStartTime] = useState('08:45');
  const [endTime, setEndTime] = useState('15:30');
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);

  // AI Schedule Planner
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [suggestedSchedule, setSuggestedSchedule] = useState<any[] | null>(null);

  const commitmentTypes: CommitmentType[] = [
    'School',
    'College',
    'Internship',
    'Job',
    'Course',
    'Training',
    'Other',
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleOpenAdd = () => {
    setEditingCommitment(null);
    setName('Aditya Engineering College');
    setType('College');
    setStartTime('08:45');
    setEndTime('15:30');
    setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comm: Commitment) => {
    setEditingCommitment(comm);
    setName(comm.name);
    setType(comm.type);
    setStartTime(comm.startTime);
    setEndTime(comm.endTime);
    setSelectedDays(comm.days);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCommitment) {
      updateCommitment(editingCommitment.id, {
        name,
        type,
        startTime,
        endTime,
        days: selectedDays,
      });
    } else {
      addCommitment({
        name,
        type,
        startTime,
        endTime,
        days: selectedDays,
        status: 'active',
      });
    }
    setIsModalOpen(false);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const generateSmartSchedule = async () => {
    setIsGeneratingSchedule(true);
    try {
      const res = await fetch('/api/schedule/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitments: state.commitments,
          goals: state.profile.goals,
          pendingTasks: state.tasks.filter((t) => !t.completed),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestedSchedule(data.scheduleBlocks || []);
      }
    } catch (e) {
      console.error('Schedule optimizer error', e);
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Primary Anchor Commitments</span>
            <span aria-hidden="true">·</span>
            <span>Non-Negotiable Schedules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Commitments & Attendance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            School, College, Internship, or Job. LifeForge protects your commitment hours and plans study/workouts around them.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={generateSmartSchedule}
            disabled={isGeneratingSchedule}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingSchedule ? 'Calculating...' : 'Plan Schedule Around Commitments'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* Suggested Smart Schedule Box (if generated) */}
      {suggestedSchedule && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">AI Optimized Day Schedule</h3>
            </div>
            <button
              onClick={() => setSuggestedSchedule(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-indigo-200">
            Fixed commitment hours are strictly respected. Study and workout blocks are placed before and after your scheduled commitment.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2">
            {suggestedSchedule.map((block, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between"
              >
                <span className="text-[11px] font-mono font-bold text-indigo-400">{block.time}</span>
                <span className="text-xs font-medium text-slate-200 mt-1">{block.activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commitment List & Attendance */}
      <div className="space-y-4">
        {state.commitments.map((comm) => {
          const attendanceToday = state.attendanceRecords.find(
            (a) => a.commitmentId === comm.id && a.date === today
          );

          return (
            <div
              key={comm.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-400 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{comm.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium">
                        {comm.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="font-mono">{comm.startTime} – {comm.endTime}</span>
                      <span aria-hidden="true">·</span>
                      <span>{comm.days.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(comm)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                    title="Edit Commitment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCommitment(comm.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg"
                    title="Delete Commitment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Attendance Buttons for Today */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Mark Today's Attendance:</span>
                  {(['Attended', 'Leave', 'Holiday', 'Late'] as AttendanceStatus[]).map((status) => {
                    const isSelected = attendanceToday?.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => recordAttendance(comm.id, status)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                          isSelected
                            ? status === 'Attended'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : status === 'Leave'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : status === 'Late'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-500">
                  Total Attended Days logged: {state.attendanceRecords.filter((a) => a.commitmentId === comm.id && a.status === 'Attended').length}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-display">
              {editingCommitment ? 'Edit Commitment' : 'Add Fixed Commitment'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Commitment Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Engineering College or Fintech Internship"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {commitmentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Scheduled Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {daysOfWeek.map((day) => {
                    const active = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          active
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
                >
                  Save Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
