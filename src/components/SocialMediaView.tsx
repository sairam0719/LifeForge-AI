import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { getTodayDateStr } from '../utils/initialState';
import { Smartphone, Plus, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

export const SocialMediaView: React.FC = () => {
  const { state, addSocialMediaLog } = useLifeForge();
  const today = getTodayDateStr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minutes, setMinutes] = useState('45');
  const [platform, setPlatform] = useState('YouTube & Instagram');
  const [notes, setNotes] = useState('');

  const todayLogs = state.socialMediaLogs.filter((s) => s.date === today);
  const totalMinsToday = todayLogs.reduce((a, b) => a + b.durationMinutes, 0);
  const limitMins = state.profile.goals.socialMediaMaxMinutesDaily || 120;
  const isWithinLimit = totalMinsToday <= limitMins;

  const hours = Math.floor(totalMinsToday / 60);
  const remainingMins = totalMinsToday % 60;
  const limitHours = Math.floor(limitMins / 60);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(minutes);
    if (val > 0) {
      addSocialMediaLog(val, platform, notes);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Dopamine Architecture & Attention Guard</span>
            <span aria-hidden="true">·</span>
            <span>Distraction Accountability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Social Media Usage
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Daily Limit: &le; {limitHours}h ({limitMins} mins) · Today: {hours}h {remainingMins}m
          </p>
        </div>

        <button
          onClick={() => {
            setMinutes('30');
            setPlatform('Instagram / YouTube');
            setNotes('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Screen Time</span>
        </button>
      </div>

      {/* Today's Status Banner */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
          isWithinLimit
            ? 'bg-slate-900/60 border-slate-800'
            : 'bg-rose-950/20 border-rose-800/50'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3.5 rounded-2xl border shrink-0 ${
              isWithinLimit
                ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/80 border-rose-800/60 text-rose-400'
            }`}
          >
            <Smartphone className="w-6 h-6" />
          </div>

          <div>
            <span className="text-xs text-slate-400">Today's Consumption Status</span>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-3xl font-bold text-white font-mono">
                {hours}h {remainingMins}m
              </span>
              <span className="text-xs text-slate-400">/ max {limitHours}h 00m</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {isWithinLimit ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Within daily safe limit ({limitMins - totalMinsToday}m buffer remaining)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Exceeded daily limit by {totalMinsToday - limitMins} minutes</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Protection Policies */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Morning restriction (Before 9 AM): <strong>Honored</strong></span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Night wind-down (30 mins before sleep): <strong>Active</strong></span>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">Usage History</h3>
        <div className="space-y-2">
          {state.socialMediaLogs.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
            >
              <div>
                <span className="text-sm font-semibold text-white">
                  {item.platform || 'Social Media'}
                </span>
                <div className="text-xs text-slate-400 mt-0.5">
                  {item.date === today ? 'Today' : item.date}
                  {item.notes && <span> · {item.notes}</span>}
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-white font-mono">
                  {Math.floor(item.durationMinutes / 60)}h {item.durationMinutes % 60}m
                </span>
                <span
                  className={`text-[10px] block ${
                    item.durationMinutes <= limitMins ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.durationMinutes <= limitMins ? 'Target Met' : 'Above Target'}
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

            <h3 className="text-lg font-bold text-white mb-4 font-display">Log Screen Time</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  App / Platform
                </label>
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="e.g. YouTube, Instagram Reels, Twitter/X"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notes (Context)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Tech talks and project research"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
