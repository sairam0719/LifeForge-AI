import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { getTodayDateStr } from '../utils/initialState';
import { Moon, Plus, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

export const SleepView: React.FC = () => {
  const { state, addSleepRecord } = useLifeForge();
  const today = getTodayDateStr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sleepTime, setSleepTime] = useState('23:15');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [durationHours, setDurationHours] = useState('7.75');
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'great'>('good');

  const todaySleep = state.sleepRecords.find((s) => s.date === today);
  const targetHours = state.profile.goals.sleepHoursDaily || 8.0;

  const handleOpenAdd = () => {
    setSleepTime('23:00');
    setWakeTime('07:00');
    setDurationHours('8.0');
    setQuality('good');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = Number(durationHours) || 8.0;
    addSleepRecord(hours, sleepTime, wakeTime, quality);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Circadian Rhythm & Neuroplastic Recovery</span>
            <span aria-hidden="true">·</span>
            <span>Sleep Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Sleep & Recovery
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Target: {targetHours} hrs/night · Consistency protects memory consolidation and study recall
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Last Night's Sleep</span>
        </button>
      </div>

      {/* Today's Sleep Highlight */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 shrink-0">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Last Night / Today's Sleep</div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-white font-mono">
                {todaySleep ? `${todaySleep.durationHours} hrs` : 'Not logged'}
              </span>
              <span className="text-xs text-slate-400">Target: {targetHours} hrs</span>
            </div>

            {todaySleep && (
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span>Bedtime: <strong className="text-slate-200">{todaySleep.sleepTime}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Wakeup: <strong className="text-slate-200">{todaySleep.wakeTime}</strong></span>
                <span aria-hidden="true">·</span>
                <span className="capitalize text-emerald-400 font-semibold">{todaySleep.quality} Quality</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 max-w-sm">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Brain Correlation</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Your 7h 45m sleep correlated with strong DBMS focus yesterday. Notice how limiting late-night screen time helped maintain your morning college schedule.
          </p>
        </div>
      </div>

      {/* Sleep History */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">Sleep History</h3>
        <div className="space-y-2">
          {state.sleepRecords.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
            >
              <div>
                <span className="text-sm font-semibold text-white">{item.date === today ? 'Today' : item.date}</span>
                <div className="text-xs text-slate-400 mt-0.5">
                  {item.sleepTime} → {item.wakeTime} · Quality: {item.quality}
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-indigo-300 font-mono">
                  {item.durationHours} hrs
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {item.durationHours >= targetHours ? 'Met target' : `${(targetHours - item.durationHours).toFixed(1)}h short`}
                </span>
              </div>
            </div>
          ))}
        </div>
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

            <h3 className="text-lg font-bold text-white mb-4 font-display">Record Sleep</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Sleep Time</label>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Wake Time</label>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    max="16"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="great">Great (Restorative)</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor (Interrupted)</option>
                  </select>
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
                  Save Sleep Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
