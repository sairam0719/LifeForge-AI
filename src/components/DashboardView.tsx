import React, { useState, useEffect } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { calculateDaySummary, calculateDayVsDay } from '../utils/analytics';
import { getTodayDateStr } from '../utils/initialState';
import {
  CheckSquare,
  BookOpen,
  Droplets,
  Moon,
  Dumbbell,
  Utensils,
  Smartphone,
  TrendingUp,
  Plus,
  Sparkles,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Mic,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    state,
    setActiveTab,
    setIsAiDrawerOpen,
    setIsVoiceModalOpen,
    addWater,
    toggleTask,
  } = useLifeForge();
  const today = getTodayDateStr();
  const summary = calculateDaySummary(state, today);
  const comparisons = calculateDayVsDay(state);

  const [aiInsight, setAiInsight] = useState<string>('Analyzing your daily consistency against your goals...');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);

  // Load evidence-based motivation
  useEffect(() => {
    let mounted = true;
    async function fetchMotivation() {
      setLoadingInsight(true);
      try {
        const res = await fetch('/api/ai/motivation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comparisons,
            userName: state.profile.name,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.feedback) {
            setAiInsight(data.feedback);
          }
        }
      } catch (e) {
        if (mounted) {
          setAiInsight(
            'Keep up your consistency. Your DBMS study and morning hydration are well-paced for today.'
          );
        }
      } finally {
        if (mounted) setLoadingInsight(false);
      }
    }
    fetchMotivation();
    return () => {
      mounted = false;
    };
  }, [summary.studyHours, summary.tasksCompleted, summary.waterIntakeLiters]);

  // Today's active commitment
  const activeCommitment = state.commitments[0];
  const attendanceToday = state.attendanceRecords.find(
    (a) => a.commitmentId === activeCommitment?.id && a.date === today
  );

  const todayTasks = state.tasks.filter((t) => t.dueDate === today);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Today's Overview</span>
            <span aria-hidden="true">·</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            LifeForge Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 via-indigo-600 to-violet-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 transition-all cursor-pointer transform hover:scale-[1.02]"
            title="Speak to AI Voice Bot directly"
          >
            <Mic className="w-4 h-4 text-white animate-pulse" />
            <span>Speak to Voice Bot</span>
          </button>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Chat</span>
          </button>
        </div>
      </div>

      {/* Commitment Status Banner */}
      {activeCommitment && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400 shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white flex items-center gap-2">
                <span>{activeCommitment.name}</span>
                <span className="text-[10px] text-slate-400">({activeCommitment.type})</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Scheduled: {activeCommitment.startTime} – {activeCommitment.endTime} · Free evening study blocks preserved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Today:</span>
            <span className="px-2.5 py-1 rounded-md text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 font-medium text-[11px]">
              {attendanceToday ? attendanceToday.status : 'Attended'}
            </span>
            <button
              onClick={() => setActiveTab('commitments')}
              className="text-indigo-400 hover:underline text-[11px] ml-2"
            >
              View Schedule →
            </button>
          </div>
        </div>
      )}

      {/* Evidence-Based AI Insight of the Day */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-violet-950/40 border border-indigo-800/40 flex items-start gap-3 shadow-sm">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs">
          <div className="font-semibold text-indigo-300 flex items-center gap-2 mb-1">
            <span>Evidence-Based AI Accountability Assessment</span>
            {loadingInsight && <span className="text-[10px] text-slate-500">(updating...)</span>}
          </div>
          <p className="text-slate-300 leading-relaxed">{aiInsight}</p>
        </div>
      </div>

      {/* Primary KPI Grid (Structured views linked to single database) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Progress Card */}
        <div
          onClick={() => setActiveTab('progress')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-600/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
              {summary.overallScorePercent}%
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Weighted Math</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${summary.overallScorePercent}%` }}
            />
          </div>
        </div>

        {/* Study Card */}
        <div
          onClick={() => setActiveTab('study')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-600/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Today's Study</span>
            <BookOpen className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
              {summary.studyHours}h
            </span>
            <span className="text-[11px] text-slate-400">/ {summary.studyTargetHours}h goal</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (summary.studyHours / summary.studyTargetHours) * 100)}%` }}
            />
          </div>
        </div>

        {/* Water Card */}
        <div
          onClick={() => setActiveTab('water')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-600/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Water Intake</span>
            <Droplets className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
              {summary.waterIntakeLiters}L
            </span>
            <span className="text-[11px] text-slate-400">/ {summary.waterTargetLiters}L</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-1">
            <div className="w-2/3 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-sky-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (summary.waterIntakeLiters / summary.waterTargetLiters) * 100)}%` }}
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addWater(250);
              }}
              className="px-2 py-0.5 text-[10px] bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800/60 rounded"
              title="Quick Add 250ml"
            >
              +250ml
            </button>
          </div>
        </div>

        {/* Tasks Card */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-indigo-600/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Today's Tasks</span>
            <CheckSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
              {summary.tasksCompleted} / {summary.tasksTotal}
            </span>
            <span className="text-[11px] text-slate-400">Done</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${summary.tasksTotal > 0 ? (summary.tasksCompleted / summary.tasksTotal) * 100 : 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Row: Sleep, Exercise, Nutrition, Social Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sleep */}
        <div
          onClick={() => setActiveTab('sleep')}
          className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sleep</span>
            </span>
            <span className="text-[11px] text-slate-400">Target {summary.sleepTargetHours}h</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            {summary.sleepHours > 0 ? `${summary.sleepHours} hrs` : 'Not recorded'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.sleepHours >= 7 ? 'Optimal restorative sleep' : 'Below target'}
          </p>
        </div>

        {/* Exercise */}
        <div
          onClick={() => setActiveTab('exercise')}
          className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
              <span>Exercise</span>
            </span>
            <span className="text-[11px] text-slate-400">{state.profile.goals.exerciseDaysPerWeek}d/wk goal</span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {summary.exerciseCompleted ? 'Completed' : 'Pending'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.exerciseCompleted
              ? `${summary.exerciseMinutes} mins recorded today`
              : 'Tap to log workout or tell AI'}
          </p>
        </div>

        {/* Nutrition */}
        <div
          onClick={() => setActiveTab('nutrition')}
          className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-rose-400" />
              <span>Nutrition</span>
            </span>
            <span className="text-[11px] text-slate-400">Target {summary.caloriesTarget} kcal</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            {summary.caloriesConsumed} kcal
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.caloriesConsumed > 0 ? 'Meals logged today' : 'No meals logged yet'}
          </p>
        </div>

        {/* Social Media */}
        <div
          onClick={() => setActiveTab('social-media')}
          className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span>Social Media</span>
            </span>
            <span className="text-[11px] text-slate-400">Max {summary.socialMediaLimitMinutes}m</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            {Math.floor(summary.socialMediaMinutes / 60)}h {summary.socialMediaMinutes % 60}m
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.socialMediaMinutes <= summary.socialMediaLimitMinutes
              ? 'Within safe limit'
              : 'Exceeded daily limit'}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Quick Today's Tasks & Today's Study Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Checklist */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Today's Key Tasks</h3>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {todayTasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  t.completed
                    ? 'bg-slate-950/40 border-slate-800/50 text-slate-500 line-through'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      t.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                    }`}
                  >
                    {t.completed && <span className="text-[10px]">✓</span>}
                  </div>
                  <span className="text-xs font-medium truncate">{t.title}</span>
                </div>
                <div className="text-[11px] text-slate-500 shrink-0 ml-2">
                  {t.dueTime || t.category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Study Log */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Recent Study Sessions</h3>
            </div>
            <button
              onClick={() => setActiveTab('study')}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All Study</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {state.studyRecords.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>{s.subject}</span>
                    <span className="text-[11px] text-slate-400 font-normal truncate max-w-[200px]">· {s.topic}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {s.date === today ? 'Today' : s.date} · Confidence: {s.examConfidence}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-indigo-300 font-mono tabular-nums">
                    {s.durationHours} hrs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
