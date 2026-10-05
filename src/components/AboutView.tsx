import React from 'react';
import {
  Info,
  Cpu,
  Database,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  GitCommit,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Architecture & Philosophy</span>
          <span aria-hidden="true">·</span>
          <span>System Constitution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
          About LifeForge AI
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          The engineering principles, AI architecture, and safe accountability model behind LifeForge.
        </p>
      </div>

      {/* 1. What is LifeForge AI */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5 text-indigo-400 text-sm font-bold">
          <Cpu className="w-5 h-5" />
          <span>1. The Central Brain Concept</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Traditional productivity and health platforms are fragmented: a user needs separate tools for study pomodoros, task management, water reminders, gym loggers, calorie counters, and habit trackers. None of them understand the student's or professional's actual day.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          In LifeForge AI, <strong>the AI Assistant is the central brain</strong>. The individual pages (Tasks, Study, Nutrition, Exercise, Sleep, Water, Social Media, Commitments, Progress) are not separate apps — they are structured views reading and writing to the <strong>exact same backend database</strong>.
        </p>
      </div>

      {/* 2. The Most Important Database Rule */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5 text-sky-400 text-sm font-bold">
          <Database className="w-5 h-5" />
          <span>2. Single Source of Truth Rule</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          When a user tells the AI: <em className="text-slate-200">"I studied DBMS for 5 hours today"</em>, the AI parses the category, subject, and duration, verifies it through the Safe Action Layer, and writes it directly to the database. The Study page, Dashboard, Progress, and Reports immediately reflect that record.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          Crucially, this is a two-way pipeline: If the user subsequently edits 5 hours to 4 hours manually on the Study page, the AI Assistant instantly sees 4 hours in subsequent conversations because both interact with the exact same record.
        </p>
      </div>

      {/* 3. Dynamic Questioning & Honest Accountability */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5 text-violet-400 text-sm font-bold">
          <Sparkles className="w-5 h-5" />
          <span>3. Dynamic Contextual Questions (No Rigid Surveys)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          LifeForge does not impose a static questionnaire. Instead, the AI analyzes missing data, goals, time of day, and fixed commitments to generate 1 to 2 targeted questions.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          For example: If you log DBMS for 2 hours, the AI asks: <em className="text-slate-200">"How confident do you feel about the DBMS topic you studied today? (Please answer honestly.)"</em> If performance falls, LifeForge provides honest, constructive recovery steps instead of misleading fake praise.
        </p>
      </div>

      {/* 4. Safe Action Layer & Confirmation */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-400 text-sm font-bold">
          <ShieldCheck className="w-5 h-5" />
          <span>4. Safe Action Layer</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The language model is never given raw or unchecked database execution authority. Actions pass through typed tools: <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">record_study()</code>, <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">create_task()</code>, <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">update_schedule()</code>.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          Sensitive modifications (e.g. changing daily study targets, editing or deleting commitments, bulk deletions) explicitly trigger a human-in-the-loop confirmation modal with clear Current vs New parameter diffs before committing.
        </p>
      </div>

      {/* 5. Food Photo AI Limitations */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-400 text-sm font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>5. Nutrition & Vision AI Limitations</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Food photo inspection relies on visual computer vision models. Every estimate is explicitly accompanied by the mandatory disclaimer:
        </p>
        <blockquote className="p-3 bg-amber-950/30 border-l-2 border-amber-500 rounded-r-lg text-xs text-amber-200 italic">
          "AI-based estimate. Actual nutritional values may vary depending on portion size, ingredients and preparation."
        </blockquote>
        <p className="text-xs text-slate-300 leading-relaxed">
          LifeForge asks clarifying portion questions when photographs are ambiguous rather than fabricating false exactness.
        </p>
      </div>

      {/* 6. Privacy & Guest Sessions */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2.5 text-slate-300 text-sm font-bold">
          <Lock className="w-5 h-5" />
          <span>6. Privacy & Guest Demonstration Mode</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The "Guest Start" on the landing page initializes a completely isolated sandbox session preloaded with realistic student commitments (college schedule, DBMS assignments, water tracking, and sleep metrics). No guest data leaks into registered accounts.
        </p>
      </div>
    </div>
  );
};
