import React, { useState, useEffect } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  Mic,
  Camera,
  CheckCircle2,
  Calendar,
  Activity,
  Flame,
  Languages,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setUserAuthStatus, loginUser, registerUser, resetToDemoData } = useLifeForge();
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'register'>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGuestStart = () => {
    resetToDemoData();
    setUserAuthStatus('guest');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    loginUser(email);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setErrorMsg('');
    registerUser(name, email);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
              LF
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-display">LifeForge AI</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">Personal Life Management & Accountability</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGuestStart}
              className="px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/50 rounded-lg transition-all"
            >
              Guest Start (Interactive Demo)
            </button>
            <button
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md shadow-indigo-600/25"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 mb-6 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Brain as the Single Source of Truth</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 font-display text-balance">
            One AI Central Brain for Your Entire Daily Life.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tasks, Study, Workouts, Nutrition, Water, Sleep, Social Media, and Commitments are not separate apps. Talk or speak naturally in English, Telugu, or mixed speech — LifeForge understands, proposes safe actions, and powers all views from one unified database.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleGuestStart}
              className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Launch Guest Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className="px-6 py-3 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              Create Free Account
            </button>
          </div>

          {/* Micro badges without pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Safe Action Layer Confirmation</span>
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-sky-400" />
              <span>Telugu & English Voice Assistant</span>
            </div>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Food Photo Vision AI</span>
            </div>
          </div>
        </div>

        {/* The Core Architecture Diagram Showcase */}
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl mb-16 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">System Architecture</span>
            <h2 className="text-xl font-bold text-white mt-1">Two-Way Unified Flow</h2>
            <p className="text-xs text-slate-400 mt-1">AI Assistant ⇄ Safe Action Layer ⇄ Unified Database ⇄ Realtime Structured Views</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
                <Mic className="w-4 h-4" />
                <span>1. Natural Input</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Type or speak in English or Telugu: <em className="text-slate-300">"I studied DBMS for 5 hours today"</em> or <em className="text-slate-300">"నేను ఈరోజు DBMS రెండు గంటలు చదివాను"</em>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-violet-400 font-semibold mb-2">
                <Cpu className="w-4 h-4" />
                <span>2. AI Central Brain</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Extracts subject, topic, and duration. Formulates dynamic questions (e.g., <em>"How confident do you feel about the DBMS topic?"</em>) rather than fixed forms.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Safe Action Layer</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Executes record_study(). For target changes or deletions, requests confirmation: <span className="text-emerald-300">[Confirm] [Cancel]</span> before committing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-2 text-sky-400 font-semibold mb-2">
                <Database className="w-4 h-4" />
                <span>4. Unified Database</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Updates Study Page, Dashboard, Progress, and Reports instantly. If you edit to 4 hours manually on the page, the AI subsequently sees 4 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Evidence-Based Motivation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No fake praise. Backend calculates real facts (Day-vs-Day and Week-vs-Week deltas). If study dropped, LifeForge gives honest advice. If it increased, it celebrates exact hours.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-violet-950 border border-violet-800/60 flex items-center justify-center text-violet-400 mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Commitments & Schedule Planning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supports School, College, Internship, Job, or Training. LifeForge never schedules workout or study during college hours (e.g. 8:45 AM – 3:30 PM), planning intelligently around free time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Custom Fields & Food Photo AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create arbitrary habits (Meditation, Reading, Skincare, Coding). Inspect food plates with Local AI Vision for estimated calories and macros with clear portion warnings.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>LifeForge AI · Personal Life Management, Accountability & Progress Assistant</p>
      </footer>

      {/* Auth Modal */}
      {authMode !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setAuthMode('none')}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1 font-display">
              {authMode === 'login' ? 'Welcome Back to LifeForge' : 'Create Your LifeForge Account'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {authMode === 'login'
                ? 'Sign in to access your personal dashboard and history.'
                : 'Start organizing your tasks, study, health, and habits.'}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  Sign In
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('himavanth@example.com');
                      setPassword('password123');
                    }}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Use Sample Demo Credentials
                  </button>
                </div>
                <div className="text-center text-xs text-slate-400 pt-2">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                    }}
                    className="text-indigo-400 hover:underline font-medium"
                  >
                    Register here
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Himavanth Sairam"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="himavanth@example.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  Create Account
                </button>
                <div className="text-center text-xs text-slate-400 pt-2">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg('');
                    }}
                    className="text-indigo-400 hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
