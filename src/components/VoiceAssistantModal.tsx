import React, { useState, useEffect, useRef } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  CheckCircle2,
  Languages,
  Send,
  RotateCcw,
  Activity,
  ArrowRight,
  Database,
  Check,
} from 'lucide-react';
import { ProposedAction } from '../types/lifeforge';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { sendChatMessage, isSendingChat, state } = useLifeForge();

  const [voiceStatus, setVoiceStatus] = useState<
    'idle' | 'listening' | 'processing' | 'speaking' | 'completed'
  >('idle');
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [lastResponse, setLastResponse] = useState<string>('');
  const [lastAction, setLastAction] = useState<ProposedAction | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-US' | 'te-IN'>('en-US');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [usingMediaRecorder, setUsingMediaRecorder] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingSessionRef = useRef(0);
  const processingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Helper for SpeechSynthesis voice fallback
  const speakWithBrowser = (text: string) => {
    if (isAudioMuted || !('speechSynthesis' in window)) {
      setVoiceStatus('completed');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      if (/[\u0C00-\u0C7F]/.test(text)) {
        utterance.lang = 'te-IN';
      } else {
        utterance.lang = 'en-US';
      }
      utterance.onend = () => {
        setVoiceStatus('completed');
      };
      utterance.onerror = () => {
        setVoiceStatus('completed');
      };
      const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(utterance.lang.split('-')[0]));
      if (voice) utterance.voice = voice;
      else if (utterance.lang === 'te-IN') {
        setErrorMessage('Reply is shown below. This browser has no Telugu voice installed; Telugu audio is unavailable.');
        setVoiceStatus('completed');
        return;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      setVoiceStatus('completed');
    }
  };

  // Process voice text input through LifeForge Brain and execute database action
  const handleProcessVoiceInput = async (spokenText: string) => {
    const textToProcess = (spokenText || transcript || typedInput).trim();
    if (!textToProcess) {
      setVoiceStatus('idle');
      return;
    }

    if (processingRef.current) return;
    processingRef.current = true;
    setTranscript(textToProcess);
    setVoiceStatus('processing');
    setErrorMessage('');

    try {
      const result = await sendChatMessage(textToProcess, !isAudioMuted, false);

      if (!result || !result.success) {
        throw new Error(result?.replyText || 'Failed to communicate with LifeForge AI Brain');
      }

      setLastResponse(result.replyText || 'Updated your records successfully.');
      if (result.proposedAction) {
        setLastAction(result.proposedAction);
      } else {
        setLastAction(null);
      }

      setTypedInput('');

      // Handle Voice Audio Playback
      if (!isAudioMuted) {
        setVoiceStatus('speaking');
        if (result.audioBase64) {
          try {
            if (audioElementRef.current) {
              audioElementRef.current.pause();
            }
            const audio = new Audio(`data:audio/wav;base64,${result.audioBase64}`);
            audioElementRef.current = audio;
            audio.onended = () => {
              setVoiceStatus('completed');
            };
            audio.onerror = () => {
              speakWithBrowser(result.replyText || '');
            };
            audio.play().catch(() => {
              speakWithBrowser(result.replyText || '');
            });
          } catch (e) {
            speakWithBrowser(result.replyText || '');
          }
        } else {
          speakWithBrowser(result.replyText || '');
        }
      } else {
        setVoiceStatus('completed');
      }
    } catch (err: any) {
      console.error('Voice process error:', err);
      setErrorMessage(err.message || 'Error communicating with AI Brain');
      setVoiceStatus('idle');
    } finally {
      processingRef.current = false;
    }
  };

  // Stop recording / speech recognition and send
  const stopListeningAndSend = (textOverride?: string) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      return;
    }

    const textToSend = textOverride || transcript || typedInput;
    if (textToSend.trim()) {
      handleProcessVoiceInput(textToSend);
    } else {
      setVoiceStatus('idle');
    }
  };

  // Record locally, then use multilingual server transcription. Browser speech
  // services are often unavailable in embedded previews despite mic permission.
  const fallbackMediaRecorder = async () => {
    const session = ++recordingSessionRef.current;
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Open the app on HTTPS or localhost in a full browser tab. Microphone access is unavailable here.');
      }
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('Audio recording is unavailable in this browser. Use a browser with MediaRecorder support.');
      }
      setUsingMediaRecorder(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (session !== recordingSessionRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
        .find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => {
        recordingSessionRef.current++;
        stream.getTracks().forEach(track => track.stop());
        setErrorMessage('Audio recording failed. Please try again.');
        setVoiceStatus('idle');
      };
      recorder.onstop = async () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (session !== recordingSessionRef.current) return;
        const blob = new Blob(chunks, { type: recorder.mimeType });
        if (!blob.size) {
          setErrorMessage('No audio captured. Please try again.');
          setVoiceStatus('idle');
          return;
        }
        setVoiceStatus('processing');
        try {
          const audioBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Unable to read recording.'));
            reader.readAsDataURL(blob);
          });
          const res = await fetch('/api/voice/transcribe', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64, mimeType: recorder.mimeType.split(';')[0] }),
            signal: AbortSignal.timeout(180000),
          });
          const data = await res.json();
          if (session !== recordingSessionRef.current) return;
          if (!res.ok) throw new Error(data.error || 'Transcription failed.');
          if (!data.transcript?.trim()) throw new Error('No speech recognized. Please speak clearly and try again.');
          await handleProcessVoiceInput(data.transcript);
        } catch (err: any) {
          if (session !== recordingSessionRef.current) return;
          setErrorMessage(err.message || 'Transcription unavailable. Please retry.');
          setVoiceStatus('idle');
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      silenceTimerRef.current = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 55000);
      setVoiceStatus('listening');
    } catch (err: any) {
      if (session !== recordingSessionRef.current) return;
      streamRef.current?.getTracks().forEach(track => track.stop());
      const messages: Record<string, string> = {
        NotAllowedError: 'Microphone permission is blocked. Allow microphone access in browser site settings. If using an embedded preview, open the app in a full browser tab.',
        NotFoundError: 'No microphone found. Connect a microphone and check your operating system audio input.',
        NotReadableError: 'Microphone is busy or unavailable. Close other recording apps and check your operating system microphone privacy settings.',
      };
      setErrorMessage(messages[err.name] || err.message || 'Unable to start recording.');
      setVoiceStatus('idle');
    }
  };

  const startListening = () => {
    if (processingRef.current || isSendingChat || voiceStatus === 'processing' || voiceStatus === 'listening') return;
    setErrorMessage('');
    setTranscript('');
    setLastAction(null);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    audioElementRef.current?.pause();
    setVoiceStatus('processing');
    void fallbackMediaRecorder();
  };

  const handleCancel = () => {
    recordingSessionRef.current++;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setVoiceStatus('idle');
    onClose();
  };

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      recordingSessionRef.current++;
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative flex flex-col items-center text-center overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          title="Close Voice Bot"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Controls: Language & Mute */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => {
              const next = selectedLanguage === 'en-US' ? 'te-IN' : 'en-US';
              setSelectedLanguage(next);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-full text-xs text-indigo-300 transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Auto: Telugu / English / mixed</span>
          </button>

          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
              isAudioMuted
                ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isAudioMuted ? 'Voice bot output muted' : 'Voice bot output sound active'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center Animated Orb / Mic Button */}
        <div className="relative my-3 flex items-center justify-center">
          {/* Animated concentric pulse rings when listening or speaking */}
          {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
            <>
              <div className="absolute w-40 h-40 rounded-full bg-indigo-500/20 animate-ping pointer-events-none" />
              <div className="absolute w-32 h-32 rounded-full bg-indigo-600/30 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Center Mic Button */}
          <button
            onClick={() => {
              if (voiceStatus === 'listening') {
                stopListeningAndSend();
              } else {
                startListening();
              }
            }}
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${
              voiceStatus === 'listening'
                ? 'bg-gradient-to-tr from-rose-600 to-indigo-600 text-white shadow-rose-600/50 ring-4 ring-rose-500/40'
                : voiceStatus === 'speaking'
                ? 'bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white shadow-indigo-600/40 ring-4 ring-emerald-500/40 animate-pulse'
                : voiceStatus === 'processing'
                ? 'bg-slate-800 text-indigo-400 animate-spin'
                : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-600/30 hover:shadow-indigo-500/50'
            }`}
            disabled={voiceStatus === 'processing' || isSendingChat}
            title={voiceStatus === 'listening' ? 'Click when done speaking' : 'Click to start speaking'}
          >
            {voiceStatus === 'listening' ? (
              <Mic className="w-9 h-9 animate-pulse" />
            ) : voiceStatus === 'speaking' ? (
              <Volume2 className="w-9 h-9" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mt-3 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            {voiceStatus === 'listening'
              ? usingMediaRecorder
                ? 'Recording — tap Done Speaking to submit'
                : 'Listening to your speech...'
              : voiceStatus === 'processing'
              ? 'Processing your command...'
              : voiceStatus === 'speaking'
              ? 'LifeForge Voice Responding...'
              : voiceStatus === 'completed'
              ? 'Response ready'
              : 'Tap microphone to speak command'}
          </span>
        </div>

        {/* Live Audio Equalizer Bars when speaking or listening */}
        {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
          <div className="flex items-center gap-1 my-2 h-4">
            <span className="w-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.1s] h-3" />
            <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s] h-4" />
            <span className="w-1 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.3s] h-2" />
            <span className="w-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s] h-4" />
            <span className="w-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s] h-3" />
          </div>
        )}

        {/* Live Spoken Transcript Display */}
        {transcript && (
          <div className="w-full my-2.5 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left">
            <span className="text-[10px] text-slate-500 block mb-0.5">Spoken command:</span>
            <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              "{transcript}"
            </p>
          </div>
        )}

        {/* AI Response Display with Action Confirmation Card */}
        {lastResponse && (
          <div className="w-full my-2 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-left space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>LifeForge Assistant · Local AI voice</span>
              </span>
              {lastAction?.status === 'executed' && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{lastAction.title || 'Database Updated'}</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
              {lastResponse}
            </p>
            {lastAction?.status === 'executed' && (
              <div className="pt-2 border-t border-indigo-900/50 flex items-center justify-between text-[11px] text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>{lastAction.description}</span>
                </span>
                <span className="text-emerald-400 font-semibold text-[10px]">Updated across app</span>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="text-xs text-rose-300 my-2 px-3 py-1.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-left">
            {errorMessage}
          </div>
        )}

        {/* Voice & Text Action Controls */}
        <div className="w-full pt-3 mt-1 border-t border-slate-800/80 flex flex-col gap-3">
          {voiceStatus === 'listening' ? (
            <button
              onClick={() => stopListeningAndSend()}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Done Speaking (Submit Command)</span>
            </button>
          ) : (
            <button
              onClick={startListening}
              disabled={voiceStatus === 'processing' || isSendingChat}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{lastResponse ? 'Speak Another Command' : 'Tap to Start Speaking'}</span>
            </button>
          )}

          {/* Quick Voice or Text Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedInput.trim()) {
                handleProcessVoiceInput(typedInput);
              }
            }}
            className="flex items-center gap-2 w-full"
          >
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Or type voice command (e.g. I drank 1.5 liters of water)..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!typedInput.trim() || isSendingChat}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Send
            </button>
          </form>

          {/* Fast One-Click Voice Chips to test all application areas */}
          <div className="text-left pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Quick Voice Commands:</span>
              <span className="text-[10px] text-slate-500">Tap to test instant updates</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '💧 Drank 1.5L Water', cmd: 'I drank 1.5 liters of water' },
                { label: '💧 Add 500ml Water', cmd: 'I drank another 500 ml' },
                { label: '📚 5h DBMS Study', cmd: 'I studied DBMS for 5 hours today' },
                { label: '📚 తెలుగు స్టడీ లాగ్', cmd: 'నేను ఈరోజు DBMS రెండు గంటలు చదివాను' },
                { label: '✅ Finish DBMS Task', cmd: 'I finished my DBMS assignment' },
                { label: '🏃 Ran 3 km Workout', cmd: 'I ran 3 km and did bench press 3 sets of 10' },
                { label: '🌙 Slept 8 Hours', cmd: 'I slept 8 hours' },
                { label: '🥗 Ate Idli Breakfast', cmd: 'I ate idli and sambar for breakfast' },
                { label: '🏫 Attended College', cmd: 'I attended college today' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleProcessVoiceInput(item.cmd);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/30 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
