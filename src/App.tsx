import React, { useState } from 'react';
import { LifeForgeProvider, useLifeForge } from './context/LifeForgeContext';
import { LandingPage } from './components/LandingPage';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { AiAssistant } from './components/AiAssistant';
import { TasksView } from './components/TasksView';
import { StudyView } from './components/StudyView';
import { ExerciseView } from './components/ExerciseView';
import { NutritionView } from './components/NutritionView';
import { WaterView } from './components/WaterView';
import { SleepView } from './components/SleepView';
import { SocialMediaView } from './components/SocialMediaView';
import { CommitmentsView } from './components/CommitmentsView';
import { CustomFieldsView } from './components/CustomFieldsView';
import { ProgressView } from './components/ProgressView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { AboutView } from './components/AboutView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { Bot, Sparkles, Mic, Menu, X, MessageSquare } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    userAuthStatus,
    activeTab,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    isVoiceModalOpen,
    setIsVoiceModalOpen,
  } = useLifeForge();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (userAuthStatus === 'landing') {
    return <LandingPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'ai-assistant':
        return <AiAssistant />;
      case 'tasks':
        return <TasksView />;
      case 'study':
        return <StudyView />;
      case 'exercise':
        return <ExerciseView />;
      case 'nutrition':
        return <NutritionView />;
      case 'water':
        return <WaterView />;
      case 'sleep':
        return <SleepView />;
      case 'social-media':
        return <SocialMediaView />;
      case 'commitments':
        return <CommitmentsView />;
      case 'custom-fields':
        return <CustomFieldsView />;
      case 'progress':
        return <ProgressView />;
      case 'reports':
        return <ReportsView />;
      case 'profile':
        return <ProfileView />;
      case 'about':
        return <AboutView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden lg:block">
        <Navigation />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72">
            <Navigation />
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Header */}
        <div className="lg:hidden h-14 border-b border-slate-800/80 bg-slate-950/90 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-white font-display">LifeForge AI</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md shadow-rose-600/30"
              title="Speak to Voice Bot"
            >
              <Mic className="w-4 h-4 animate-pulse" />
            </button>

            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200"
              title="Open Chat"
            >
              <Bot className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveView()}
        </div>
      </div>

      {/* Persistent Floating Buttons (Voice Bot + Chat Drawer) */}
      {!isAiDrawerOpen && !isVoiceModalOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          {/* Main Voice Bot Floating Button */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-rose-600 via-indigo-600 to-violet-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/40 font-bold text-xs transition-all transform hover:-translate-y-1 cursor-pointer border border-white/20 group"
            title="Speak to AI Voice Bot"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-bold leading-none">Speak to Voice Bot</span>
              <span className="text-[10px] text-indigo-100 font-normal">Instant Voice Commands</span>
            </div>
          </button>

          {/* Quick Chat Drawer Icon Button */}
          {activeTab !== 'ai-assistant' && (
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="p-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
              title="Open AI Chat Drawer"
            >
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </button>
          )}
        </div>
      )}

      {/* Floating Right AI Drawer (Talk to AI while viewing any screen) */}
      {isAiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] max-w-full shadow-2xl animate-in slide-in-from-right duration-200">
          <AiAssistant isDrawer={true} onClose={() => setIsAiDrawerOpen(false)} />
        </div>
      )}

      {/* Interactive AI Voice Bot Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LifeForgeProvider>
      <AppContent />
    </LifeForgeProvider>
  );
}
