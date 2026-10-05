import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { getTodayDateStr } from '../utils/initialState';
import { Droplets, Plus, Clock, RotateCcw, Sparkles } from 'lucide-react';

export const WaterView: React.FC = () => {
  const { state, addWater } = useLifeForge();
  const today = getTodayDateStr();

  const [customAmount, setCustomAmount] = useState('300');

  const todayLogs = state.waterLogs.filter((w) => w.date === today);
  const totalMl = todayLogs.reduce((a, b) => a + b.amountMl, 0);
  const totalLiters = Number((totalMl / 1000).toFixed(2));
  const targetLiters = state.profile.goals.waterLitersDaily || 3.0;
  const targetMl = targetLiters * 1000;
  const remainingMl = Math.max(0, targetMl - totalMl);
  const percent = Math.min(100, Math.round((totalMl / targetMl) * 100));

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(customAmount);
    if (val > 0) {
      addWater(val);
      setCustomAmount('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Cellular Hydration & Cognitive Focus</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Water Intake
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Today: {totalLiters}L of {targetLiters}L target · {remainingMl > 0 ? `${remainingMl}ml remaining` : 'Target achieved!'}
          </p>
        </div>
      </div>

      {/* Main Hydration Dashboard Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Gauge Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="relative w-44 h-44 rounded-full flex items-center justify-center border-8 border-slate-800 mb-4 bg-slate-950">
            {/* Progress fill visual */}
            <div
              className="absolute inset-0 rounded-full border-8 border-sky-400 transition-all duration-700"
              style={{
                clipPath: `inset(${100 - percent}% 0 0 0)`,
              }}
            />
            <div className="z-10 flex flex-col items-center">
              <Droplets className="w-8 h-8 text-sky-400 mb-1" />
              <span className="text-3xl font-bold text-white font-mono">{percent}%</span>
              <span className="text-xs text-slate-400">{totalLiters} / {targetLiters} L</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium">
            {percent >= 100
              ? 'Hydration goal achieved for today! Great discipline.'
              : `${remainingMl} ml left to reach optimal daily intake.`}
          </p>
        </div>

        {/* Quick Log Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Quick Log</h3>
            <p className="text-xs text-slate-400 mb-4">
              Tap a preset or enter a custom amount. The AI Brain and Dashboard reflect this immediately.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => addWater(250)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:bg-sky-950/30 text-slate-200 transition-all flex flex-col items-center cursor-pointer"
              >
                <span className="text-lg font-bold font-mono text-sky-400">+250 ml</span>
                <span className="text-[10px] text-slate-500">Standard Glass</span>
              </button>

              <button
                onClick={() => addWater(500)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:bg-sky-950/30 text-slate-200 transition-all flex flex-col items-center cursor-pointer"
              >
                <span className="text-lg font-bold font-mono text-sky-400">+500 ml</span>
                <span className="text-[10px] text-slate-500">Water Bottle</span>
              </button>

              <button
                onClick={() => addWater(750)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:bg-sky-950/30 text-slate-200 transition-all flex flex-col items-center cursor-pointer"
              >
                <span className="text-lg font-bold font-mono text-sky-400">+750 ml</span>
                <span className="text-[10px] text-slate-500">Large Flask</span>
              </button>

              <button
                onClick={() => addWater(1000)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:bg-sky-950/30 text-slate-200 transition-all flex flex-col items-center cursor-pointer"
              >
                <span className="text-lg font-bold font-mono text-sky-400">+1000 ml</span>
                <span className="text-[10px] text-slate-500">1.0 Liter</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleCustomAdd} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="number"
              min="50"
              max="3000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom ml (e.g. 350)"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Add
            </button>
          </form>
        </div>

        {/* AI Hydration Tip */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Evidence-Based Hydration</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Cognitive & Muscle Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drinking water in steady intervals throughout your college hours (8:45 AM – 3:30 PM) prevents afternoon cognitive fatigue. Aim for 500ml before your evening workout.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 mt-4">
            <span>Natural language trigger: </span>
            <span className="text-indigo-300 italic">"I drank 500 ml water"</span>
          </div>
        </div>
      </div>

      {/* Today's History */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-3">Today's Hydration Logs</h3>
        {todayLogs.length === 0 ? (
          <p className="text-xs text-slate-500">No logs recorded today yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-bold text-sky-400 font-mono">+{log.amountMl} ml</span>
                  <span className="text-[10px] text-slate-500 block">{log.time}</span>
                </div>
                <Droplets className="w-4 h-4 text-sky-500/50" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
