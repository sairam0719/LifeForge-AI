import React, { useState, useRef, useEffect } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldAlert,
  Check,
  X,
  Languages,
  Clock,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { ProposedAction } from '../types/lifeforge';
import { VoiceAssistantModal } from './VoiceAssistantModal';

export const AiAssistant: React.FC<{ isDrawer?: boolean; onClose?: () => void }> = ({
  isDrawer = false,
  onClose,
}) => {
  const {
    state,
    sendChatMessage,
    isSendingChat,
    executeAction,
    rejectAction,
    pendingAction,
  } = useLifeForge();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);
  const [speechLanguage, setSpeechLanguage] = useState<'te-IN' | 'en-US'>('en-US');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatHistory, isSendingChat]);

  // Both microphone entry points share the same recording/action flow.
  const toggleListening = () => setShowVoiceModal(true);

  const handleSend = (textToSend?: string) => {
    const message = textToSend || input;
    if (!message.trim() || isSendingChat) return;
    sendChatMessage(message, voicePlaybackEnabled);
    setInput('');
  };

  const quickPrompts = [
    { label: 'DBMS 5 Hours Study', prompt: 'I studied DBMS for 5 hours today.' },
    { label: 'Telugu Study Log', prompt: 'నేను ఈరోజు DBMS రెండు గంటలు చదివాను.' },
    { label: 'Workout Log', prompt: 'I ran 3 km and did bench press 3 sets of 10.' },
    { label: 'Water 500ml', prompt: 'I drank 500 ml water.' },
    { label: 'Change Study Target (Requires Confirm)', prompt: 'Change my study target from 3 hours to 4 hours.' },
    { label: 'Suggest Schedule', prompt: 'Suggest my schedule around my college commitment (8:45 AM to 3:30 PM).' },
  ];

  return (
    <div
      className={`flex flex-col bg-slate-950 text-slate-100 ${
        isDrawer
          ? 'h-full border-l border-slate-800/80 shadow-2xl'
          : 'h-[calc(100vh-2rem)] rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>LifeForge AI Brain</span>
              <span className="text-[10px] text-emerald-400 font-normal">Active & Synced</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Central controller · Safe Action Layer · Single Source of Truth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setSpeechLanguage((prev) => (prev === 'en-US' ? 'te-IN' : 'en-US'))}
            title={`Speech Recognition Language: ${speechLanguage === 'te-IN' ? 'Telugu' : 'English'}`}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg border border-slate-700/50 transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>{speechLanguage === 'te-IN' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Dedicated Voice Bot Mode button */}
          <button
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            title="Open Interactive Voice Bot"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Bot</span>
          </button>

          {/* Voice Output toggle */}
          <button
            onClick={() => setVoicePlaybackEnabled(!voicePlaybackEnabled)}
            title={voicePlaybackEnabled ? 'Browser Speech Enabled' : 'Voice Speech Muted'}
            className={`p-1.5 rounded-lg border transition-colors ${
              voicePlaybackEnabled
                ? 'bg-indigo-950/70 text-indigo-300 border-indigo-700/60'
                : 'bg-slate-800/80 text-slate-500 border-slate-700/50'
            }`}
          >
            {voicePlaybackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {isDrawer && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pending Confirmation Modal / Banner if sensitive action needs confirmation */}
      {pendingAction && (
        <div className="m-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 flex flex-col gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                Confirmation Required
              </span>
              <h4 className="text-xs font-bold text-white mt-0.5">{pendingAction.title}</h4>
              <p className="text-xs text-slate-300 mt-1">{pendingAction.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-800/40">
            <button
              onClick={() => rejectAction(pendingAction)}
              className="px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => executeAction(pendingAction)}
              className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Commit to Database</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.chatHistory.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="text-[10px] text-slate-500 mb-1 px-1">
                {isUser ? 'You' : 'LifeForge Brain'} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Proposed Action Card attached to message */}
                {msg.proposedAction && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 text-[11px]">
                    <div className="flex items-center justify-between text-indigo-300 font-semibold mb-1">
                      <span>Proposed Action: {msg.proposedAction.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {msg.proposedAction.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mb-2">{msg.proposedAction.description}</p>

                    {msg.proposedAction.status === 'pending' && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => executeAction(msg.proposedAction!)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md text-[10px] transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => rejectAction(msg.proposedAction!)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Follow-Up Questions from the AI */}
              {msg.dynamicQuestions && msg.dynamicQuestions.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5 pl-2 max-w-[85%]">
                  <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-medium">
                    <HelpCircle className="w-3 h-3" />
                    <span>Dynamic Follow-up:</span>
                  </div>
                  {msg.dynamicQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-left text-xs bg-slate-900/90 hover:bg-indigo-950/60 hover:text-indigo-200 border border-slate-800 hover:border-indigo-700/60 text-slate-300 rounded-xl px-3 py-2 transition-all cursor-pointer shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isSendingChat && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 pl-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>LifeForge Brain is reasoning & formulating actions...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-3 py-2 border-t border-slate-900 bg-slate-950/80 overflow-x-auto flex items-center gap-1.5 shrink-0 no-scrollbar">
        <span className="text-[10px] text-slate-500 shrink-0 mr-1">Quick:</span>
        {quickPrompts.map((item, i) => (
          <button
            key={i}
            onClick={() => handleSend(item.prompt)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-slate-700 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : `Speak in ${speechLanguage === 'te-IN' ? 'Telugu' : 'English'}`}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? `Listening (${speechLanguage === 'te-IN' ? 'Telugu' : 'English'})... speak now`
                : 'Talk to LifeForge (e.g. "I studied DBMS for 5 hours" or Telugu)...'
            }
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isSendingChat}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Interactive Voice Bot Modal */}
      <VoiceAssistantModal isOpen={showVoiceModal} onClose={() => setShowVoiceModal(false)} />
    </div>
  );
};
