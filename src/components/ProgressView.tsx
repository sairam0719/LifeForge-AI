import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { calculateDayVsDay, calculateWeekVsWeek } from '../utils/analytics';
import { getPastDateStr } from '../utils/initialState';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart3,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { state } = useLifeForge();
  const dayComparisons = calculateDayVsDay(state);
  const weekComparisons = calculateWeekVsWeek(state);

  const [activeRange, setActiveRange] = useState<'day' | 'week' | 'month'>('day');

  // Generate 7-day trend data for study hours
  const past7Days = Array.from({ length: 7 }, (_, i) => getPastDateStr(6 - i));
  const studyTrendData = past7Days.map((d) => {
    const total = state.studyRecords
      .filter((s) => s.date === d)
      .reduce((a, b) => a + b.durationHours, 0);
    const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'narrow' });
    return { date: d, dayName, value: Number(total.toFixed(1)) };
  });

  const maxStudyVal = Math.max(4, ...studyTrendData.map((d) => d.value));

  // Generate 7-day trend for water
  const waterTrendData = past7Days.map((d) => {
    const total = state.waterLogs
      .filter((w) => w.date === d)
      .reduce((a, b) => a + b.amountMl, 0);
    const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'narrow' });
    return { date: d, dayName, value: Number((total / 1000).toFixed(1)) };
  });

  // Generate 7-day trend for sleep
  const sleepTrendData = past7Days.map((d) => {
    const record = state.sleepRecords.find((s) => s.date === d);
    const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'narrow' });
    return { date: d, dayName, value: record ? record.durationHours : 0 };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Factual Analytics & Accountability</span>
            <span aria-hidden="true">·</span>
            <span>Mathematical Grounding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Progress & Performance Trends
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Calculated directly from the unified database. AI provides evidence-based feedback without fake praise.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveRange('day')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeRange === 'day' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Day vs Day
          </button>
          <button
            onClick={() => setActiveRange('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeRange === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Week vs Week
          </button>
        </div>
      </div>

      {/* Comparisons Section */}
      {activeRange === 'day' ? (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Day vs Day Comparison</h2>
              <p className="text-xs text-slate-400">Yesterday compared to Today</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono">Backend Exact Math</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {dayComparisons.map((c, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">{c.metric}</span>
                  {c.neutral ? (
                    <span className="text-slate-500 text-xs flex items-center gap-0.5">
                      <Minus className="w-3.5 h-3.5" /> Steady
                    </span>
                  ) : c.improved ? (
                    <span className="text-emerald-400 text-xs flex items-center gap-0.5 font-medium">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Improved
                    </span>
                  ) : (
                    <span className="text-rose-400 text-xs flex items-center gap-0.5 font-medium">
                      <ArrowDownRight className="w-3.5 h-3.5" /> Lower
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between font-mono my-2">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 block font-sans">Yesterday</span>
                    <span className="text-base text-slate-400">{c.yesterday}</span>
                  </div>
                  <span className="text-slate-600 font-sans text-xs">→</span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-sans">Today</span>
                    <span className="text-lg font-bold text-white">{c.today}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 text-right">
                  <span
                    className={`text-xs font-semibold ${
                      c.improved ? 'text-emerald-400' : c.neutral ? 'text-slate-400' : 'text-rose-400'
                    }`}
                  >
                    {c.deltaText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Week vs Week Comparison</h2>
              <p className="text-xs text-slate-400">Previous 7 Days vs Current 7 Days</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono">Backend Exact Math</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {weekComparisons.map((c, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">{c.metric}</span>
                  {c.improved ? (
                    <span className="text-emerald-400 text-xs flex items-center gap-0.5 font-medium">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-rose-400 text-xs flex items-center gap-0.5 font-medium">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between font-mono my-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Last Week</span>
                    <span className="text-sm text-slate-400">{c.prevWeek}</span>
                  </div>
                  <span className="text-slate-600 font-sans text-xs">→</span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-sans">This Week</span>
                    <span className="text-base font-bold text-white">{c.thisWeek}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 text-right">
                  <span
                    className={`text-xs font-semibold ${
                      c.improved ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {c.deltaText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Charts Grid (Using clean SVG visualizations grounded in database records) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Hours Trend Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Study Hours Trend</h3>
              <p className="text-[11px] text-slate-400">Past 7 days daily study volume</p>
            </div>
            <span className="text-xs text-violet-400 font-mono font-bold">
              {studyTrendData.reduce((a, b) => a + b.value, 0).toFixed(1)}h Total
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
            {studyTrendData.map((d, i) => {
              const heightPercent = Math.max(8, (d.value / maxStudyVal) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] text-slate-400 font-mono">{d.value > 0 ? `${d.value}h` : ''}</span>
                  <div className="w-full bg-slate-950 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{d.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Water Intake Consistency */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Water Intake Trend</h3>
              <p className="text-[11px] text-slate-400">Litres consumed vs 3.0L goal</p>
            </div>
            <span className="text-xs text-sky-400 font-mono font-bold">
              Goal: {state.profile.goals.waterLitersDaily}L
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
            {waterTrendData.map((d, i) => {
              const heightPercent = Math.min(100, Math.max(8, (d.value / 3.5) * 100));
              const goalMet = d.value >= (state.profile.goals.waterLitersDaily || 3.0);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] text-slate-400 font-mono">{d.value > 0 ? `${d.value}L` : ''}</span>
                  <div className="w-full bg-slate-950 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        goalMet ? 'bg-sky-400' : 'bg-sky-600/70'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{d.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sleep Duration Trend */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Sleep Duration</h3>
              <p className="text-[11px] text-slate-400">Hours slept vs 8.0h target</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono font-bold">
              Target: {state.profile.goals.sleepHoursDaily}h
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
            {sleepTrendData.map((d, i) => {
              const heightPercent = Math.min(100, Math.max(8, (d.value / 10) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] text-slate-400 font-mono">{d.value > 0 ? `${d.value}h` : ''}</span>
                  <div className="w-full bg-slate-950 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-700 to-indigo-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{d.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
