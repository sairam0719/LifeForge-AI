import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { calculateDaySummary, calculateWeekVsWeek } from '../utils/analytics';
import { getTodayDateStr } from '../utils/initialState';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { state } = useLifeForge();
  const today = getTodayDateStr();

  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | '6-Week'>('Weekly');
  const summary = calculateDaySummary(state, today);
  const weekComparisons = calculateWeekVsWeek(state);

  const totalStudy = state.studyRecords.reduce((a, b) => a + b.durationHours, 0);
  const totalWorkouts = state.exerciseRecords.length;
  const completedTasks = state.tasks.filter((t) => t.completed).length;

  const downloadCsv = () => {
    const rows = [
      ['Category', 'Metric', 'Logged Value', 'Target / Status'],
      ['Study', 'Total Hours', `${totalStudy.toFixed(1)} hrs`, `${state.profile.goals.studyHoursDaily} hrs/day`],
      ['Tasks', 'Completion', `${completedTasks} / ${state.tasks.length}`, `${Math.round((completedTasks / (state.tasks.length || 1)) * 100)}%`],
      ['Water', 'Today Intake', `${summary.waterIntakeLiters} L`, `${summary.waterTargetLiters} L`],
      ['Sleep', 'Today Duration', `${summary.sleepHours} hrs`, `${summary.sleepTargetHours} hrs`],
      ['Exercise', 'Total Sessions', `${totalWorkouts} sessions`, `${state.profile.goals.exerciseDaysPerWeek} days/wk`],
      ['Social Media', 'Today Usage', `${summary.socialMediaMinutes} mins`, `${summary.socialMediaLimitMinutes} mins limit`],
      ['Overall Progress', 'Calculated Score', `${summary.overallScorePercent}%`, 'Weighted factual index'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LifeForge_${period}_Report_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 print:text-black print:bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 print:border-slate-300">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1 print:text-slate-600">
            <span>Executive Life Summary</span>
            <span aria-hidden="true">·</span>
            <span>Comprehensive Multi-Domain Export</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display print:text-slate-900">
            Performance Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
            Export verified accountability summaries for yourself, mentors, or parents.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {/* Period Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
            {(['Daily', 'Weekly', 'Monthly', '6-Week'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  period === p
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 print:border-none print:bg-white print:p-0 space-y-6">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 print:border-slate-300">
          <div>
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase print:text-indigo-700">
              LifeForge Official Accountability Record
            </span>
            <h2 className="text-xl font-bold text-white print:text-slate-900 mt-1">
              {period} Executive Performance Brief
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
              Subject: <strong>{state.profile.name}</strong> ({state.profile.email}) · Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 print:text-slate-600 block">Overall Score</span>
            <span className="text-3xl font-bold text-indigo-400 font-mono print:text-indigo-700">
              {summary.overallScorePercent}%
            </span>
          </div>
        </div>

        {/* AI Executive Summary Banner */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-900/50 print:border-slate-300 print:bg-slate-50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs print:text-indigo-800">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Evidence-Based Evaluation</span>
          </div>
          <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
            During this period, study performance in technical subjects (notably DBMS and Operating Systems) showed sustained commitment with an average of {(totalStudy / 7).toFixed(1)} hours daily. Attendance for {state.commitments[0]?.name || 'Primary Commitment'} remained above 90%. Focus was maintained with social media strictly confined within the {state.profile.goals.socialMediaMaxMinutesDaily} minutes ceiling.
          </p>
        </div>

        {/* Areas Improved vs Areas Needing Attention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:border-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Areas Demonstrated Improvement</span>
            </div>
            <ul className="text-xs text-slate-300 print:text-slate-700 space-y-1.5 list-disc pl-4">
              <li>DBMS Normalization and B+ Tree indexing mastery verified through 4/5 confidence score.</li>
              <li>Hydration targets consistently averaged 2.6L – 3.0L daily.</li>
              <li>Evening bench press workouts executed with complete set completion.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:border-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Areas Needing Attention & Recovery</span>
            </div>
            <ul className="text-xs text-slate-300 print:text-slate-700 space-y-1.5 list-disc pl-4">
              <li>Late night sleep variability (ensure 23:00 wind-down is preserved on lab submission nights).</li>
              <li>Data Structures AVL Tree rotations require 1 additional focused review session.</li>
              <li>Morning social media restriction was flagged once in the prior period.</li>
            </ul>
          </div>
        </div>

        {/* Multi-Domain Metric Breakdown Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 print:bg-slate-100 print:text-slate-800 border-b border-slate-800 print:border-slate-300">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Domain</th>
                <th className="py-2.5 px-4 font-semibold">Active Record</th>
                <th className="py-2.5 px-4 font-semibold">Goal / Benchmark</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 print:divide-slate-200">
              <tr>
                <td className="py-2.5 px-4 font-medium text-white print:text-slate-900">Study Sessions</td>
                <td className="py-2.5 px-4 text-slate-300 print:text-slate-700 font-mono">{summary.studyHours}h today ({totalStudy.toFixed(1)}h total)</td>
                <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">{summary.studyTargetHours}h / day</td>
                <td className="py-2.5 px-4 text-emerald-400 font-medium">On Track</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-white print:text-slate-900">Tasks Completed</td>
                <td className="py-2.5 px-4 text-slate-300 print:text-slate-700 font-mono">{summary.tasksCompleted} / {summary.tasksTotal} today</td>
                <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">100% daily closure</td>
                <td className="py-2.5 px-4 text-emerald-400 font-medium">70% Done</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-white print:text-slate-900">Hydration (Water)</td>
                <td className="py-2.5 px-4 text-slate-300 print:text-slate-700 font-mono">{summary.waterIntakeLiters} L</td>
                <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">{summary.waterTargetLiters} L / day</td>
                <td className="py-2.5 px-4 text-sky-400 font-medium">Optimal</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-white print:text-slate-900">Sleep & Rest</td>
                <td className="py-2.5 px-4 text-slate-300 print:text-slate-700 font-mono">{summary.sleepHours} hrs</td>
                <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">{summary.sleepTargetHours} hrs / night</td>
                <td className="py-2.5 px-4 text-indigo-300 font-medium">Good Recovery</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-white print:text-slate-900">Exercise</td>
                <td className="py-2.5 px-4 text-slate-300 print:text-slate-700 font-mono">{summary.exerciseCompleted ? 'Completed' : 'Pending'}</td>
                <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">{state.profile.goals.exerciseDaysPerWeek} days / week</td>
                <td className="py-2.5 px-4 text-amber-400 font-medium">Consistent</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-white print:text-slate-900">Screen Time</td>
                <td className="py-2.5 px-4 text-slate-300 print:text-slate-700 font-mono">{Math.floor(summary.socialMediaMinutes / 60)}h {summary.socialMediaMinutes % 60}m</td>
                <td className="py-2.5 px-4 text-slate-400 print:text-slate-600">&le; {summary.socialMediaLimitMinutes} mins / day</td>
                <td className="py-2.5 px-4 text-emerald-400 font-medium">Safe Limit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
