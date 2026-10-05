import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { ExerciseRecord } from '../types/lifeforge';
import { getTodayDateStr } from '../utils/initialState';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Activity,
  Flame,
  CheckCircle,
} from 'lucide-react';

export const ExerciseView: React.FC = () => {
  const { state, addExerciseRecord, updateExerciseRecord, deleteExerciseRecord } = useLifeForge();
  const today = getTodayDateStr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExerciseRecord | null>(null);

  // Form
  const [activity, setActivity] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [details, setDetails] = useState('');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'high'>('moderate');
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState('');

  const quickActivities = [
    'Bench Press & Chest',
    'Outdoor Running',
    'Back & Biceps Gym',
    'Yoga & Stretching',
    'Push-ups & Core',
    'Swimming',
    'Cricket / Football',
    'Cycling',
  ];

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setActivity('Bench Press & Chest');
    setDurationMinutes('45');
    setDetails('3 sets of 10 @ 60kg, Incline DB 3x12');
    setIntensity('high');
    setDate(today);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: ExerciseRecord) => {
    setEditingRecord(rec);
    setActivity(rec.activity);
    setDurationMinutes(String(rec.durationMinutes));
    setDetails(rec.details);
    setIntensity(rec.intensity);
    setDate(rec.date);
    setNotes(rec.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    if (editingRecord) {
      updateExerciseRecord(editingRecord.id, {
        activity,
        durationMinutes: Number(durationMinutes) || 30,
        details,
        intensity,
        date,
        notes,
      });
    } else {
      addExerciseRecord({
        activity,
        durationMinutes: Number(durationMinutes) || 30,
        details,
        intensity,
        date,
        notes,
      });
    }
    setIsModalOpen(false);
  };

  const todayWorkouts = state.exerciseRecords.filter((e) => e.date === today);
  const totalMinutesToday = todayWorkouts.reduce((a, b) => a + b.durationMinutes, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Physical Vitality & Strength</span>
            <span aria-hidden="true">·</span>
            <span>Arbitrary Workouts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Exercise & Fitness
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Today: {totalMinutesToday} mins · Goal: {state.profile.goals.exerciseDaysPerWeek} days/week · Total Sessions: {state.exerciseRecords.length}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Workout</span>
        </button>
      </div>

      {/* Workout list */}
      <div className="space-y-3">
        {state.exerciseRecords.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No workout records yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Log a workout manually or tell AI: <em className="text-slate-400">"I ran 3 km and did bench press 3 sets of 10"</em>
            </p>
          </div>
        ) : (
          state.exerciseRecords.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 shrink-0 mt-0.5">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{item.activity}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        item.intensity === 'high'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : item.intensity === 'moderate'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      }`}
                    >
                      {item.intensity} intensity
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1">{item.details}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
                    <span>{item.date === today ? 'Today' : item.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.durationMinutes} minutes</span>
                    {item.notes && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="italic text-slate-400 truncate max-w-xs">{item.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => deleteExerciseRecord(item.id)}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
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
              {editingRecord ? 'Edit Workout Record' : 'Log Workout Session'}
            </h3>

            {/* Quick Chips */}
            <div className="mb-4">
              <span className="text-[11px] text-slate-400 block mb-1.5">Quick Activities:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickActivities.map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setActivity(act)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300"
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Activity Name</label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g. Bench Press, Running, Yoga, Swimming"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Details (Sets, Reps, Distance)</label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="e.g. 3 sets of 10 @ 60kg or 3.2 km run"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Intensity</label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did you feel? Any personal bests?"
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
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
                  {editingRecord ? 'Save Changes' : 'Record Workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
