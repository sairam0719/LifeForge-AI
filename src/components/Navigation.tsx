import React from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  BookOpen,
  Dumbbell,
  Utensils,
  Droplets,
  Moon,
  Smartphone,
  Briefcase,
  Sliders,
  TrendingUp,
  FileText,
  User,
  Info,
  Mic,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAiDrawerOpen,
    setIsVoiceModalOpen,
    state,
    logout,
    userAuthStatus,
  } = useLifeForge();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI Central Brain', icon: Bot, highlight: true },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'exercise', label: 'Exercise', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'water', label: 'Water', icon: Droplets },
    { id: 'sleep', label: 'Sleep', icon: Moon },
    { id: 'social-media', label: 'Social Media', icon: Smartphone },
    { id: 'commitments', label: 'Commitments', icon: Briefcase },
    { id: 'custom-fields', label: 'Custom Habits', icon: Sliders },
    { id: 'progress', label: 'Progress & Trends', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
              LF
            </div>
            <div>
              <span className="font-bold text-white tracking-tight font-display text-sm">LifeForge AI</span>
              <p className="text-[10px] text-slate-400">Accountability Assistant</p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="p-3 space-y-2">
          {/* Voice Bot Button */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-rose-600 via-indigo-600 to-violet-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer transform hover:scale-[1.02]"
            title="Speak to AI Voice Bot directly"
          >
            <Mic className="w-4 h-4 text-white animate-pulse" />
            <span>Speak to AI Voice Bot</span>
          </button>

          {/* AI Brain Drawer Button */}
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open Chat Drawer</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="px-2 py-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold border-l-2 border-indigo-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                } ${item.highlight && !isActive ? 'text-indigo-400 hover:text-indigo-300' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {item.highlight && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Switcher */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="truncate">
            <p className="text-xs font-medium text-white truncate">{state.profile.name}</p>
            <p className="text-[10px] text-slate-500 truncate">
              {userAuthStatus === 'guest' ? 'Guest Demo Session' : state.profile.email}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out / Return to Landing"
            className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[10px] text-slate-500 px-1 pt-1 flex items-center justify-between border-t border-slate-900">
          <span>Telugu & English NLP</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="AI Brain Connected" />
        </div>
      </div>
    </aside>
  );
};
