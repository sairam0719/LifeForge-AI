import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { StudyRecord } from '../types/lifeforge';
import { getTodayDateStr } from '../utils/initialState';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Award,
  Sparkles,
  BarChart2,
  CheckCircle,
} from 'lucide-react';

export const StudyView: React.FC = () => {
  const {
    state,
    addStudyRecord,
    updateStudyRecord,
    deleteStudyRecord,
    setIsAiDrawerOpen,
    sendChatMessage,
  } = useLifeForge();

  const today = getTodayDateStr();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudyRecord | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [durationHours, setDurationHours] = useState('2.0');
  const [date, setDate] = useState(today);
  const [understandingScore, setUnderstandingScore] = useState(4);
  const [examConfidence, setExamConfidence] = useState<'low' | 'medium' | 'high'>('high');
  const [improvementFromLast, setImprovementFromLast] = useState('');
  const [notes, setNotes] = useState('');

  const todayRecords = state.studyRecords.filter((s) => s.date === today);
  const pastRecords = state.studyRecords.filter((s) => s.date !== today);

  const totalTodayHours = todayRecords.reduce((a, b) => a + b.durationHours, 0);
  const totalAllTimeHours = state.studyRecords.reduce((a, b) => a + b.durationHours, 0);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setSubject('DBMS');
    setTopic('Relational Algebra & Normalization');
    setDurationHours('2.5');
    setDate(today);
    setUnderstandingScore(4);
    setExamConfidence('high');
    setImprovementFromLast('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: StudyRecord) => {
    setEditingRecord(rec);
    setSubject(rec.subject);
    setTopic(rec.topic);
    setDurationHours(String(rec.durationHours));
    setDate(rec.date);
    setUnderstandingScore(rec.understandingScore || 4);
    setExamConfidence(rec.examConfidence || 'high');
    setImprovementFromLast(rec.improvementFromLast || '');
    setNotes(rec.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) return;

    const parsedDuration = Number(durationHours) || 1;

    if (editingRecord) {
      updateStudyRecord(editingRecord.id, {
        subject,
        topic,
        durationHours: parsedDuration,
        date,
        understandingScore,
        examConfidence,
        improvementFromLast,
        notes,
      });
    } else {
      addStudyRecord({
        subject,
        topic,
        durationHours: parsedDuration,
        date,
        understandingScore,
        examConfidence,
        improvementFromLast,
        notes,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Academic & Skill Mastery</span>
            <span aria-hidden="true">·</span>
            <span>Shared Database Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Study Tracking & Retention
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Today: {totalTodayHours.toFixed(1)} hrs · Target: {state.profile.goals.studyHoursDaily} hrs/day · Total Logged: {totalAllTimeHours.toFixed(1)} hrs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setIsAiDrawerOpen(true);
              sendChatMessage('I studied DBMS for 5 hours today.');
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 rounded-xl text-xs font-medium transition-all"
            title="Tell AI you studied DBMS"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test "Studied DBMS 5h" via AI</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Study Session</span>
          </button>
        </div>
      </div>

      {/* TODAY'S STUDY SECTION (Matching prompt section 3) */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Today's Study</h2>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300">
            {totalTodayHours} Hours Total
          </span>
        </div>

        {todayRecords.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800/60">
            <p className="text-xs text-slate-400">No study sessions logged for today yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click "Record Study Session" or speak to the AI Assistant to log instantly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todayRecords.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-base font-bold text-white tracking-tight">{item.subject}</h3>
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                      {item.durationHours} Hours
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-300 mb-2">Topic: {item.topic}</p>

                  <div className="text-[11px] text-slate-400 space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      <span>Understanding:</span>
                      <span className="text-amber-300 font-mono">{'★'.repeat(item.understandingScore || 4)}</span>
                      <span className="text-slate-500">({item.understandingScore}/5)</span>
                    </div>

                    <div>
                      <span>Exam Confidence: </span>
                      <span
                        className={`font-semibold capitalize ${
                          item.examConfidence === 'high'
                            ? 'text-emerald-400'
                            : item.examConfidence === 'medium'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {item.examConfidence}
                      </span>
                    </div>

                    {item.improvementFromLast && (
                      <div className="text-slate-400 italic">
                        "{item.improvementFromLast}"
                      </div>
                    )}

                    {item.notes && <div className="text-slate-500">{item.notes}</div>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs text-slate-500">
                  <span>Date: Today</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-2.5 py-1 text-xs font-medium text-indigo-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteStudyRecord(item.id)}
                      className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HISTORICAL STUDY SESSIONS */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <h2 className="text-sm font-bold text-white mb-4">Previous Study Sessions</h2>
        <div className="space-y-2">
          {pastRecords.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{item.subject}</span>
                  <span className="text-xs text-slate-400">· {item.topic}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {item.date} · Understanding: {item.understandingScore}/5 · Confidence: {item.examConfidence}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-indigo-300">
                  {item.durationHours} hrs
                </span>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteStudyRecord(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Study Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-display">
              {editingRecord ? 'Edit Study Session' : 'Record Study Session'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. DBMS, Operating Systems, Computer Networks"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Process Scheduling or Normalization"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="18"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Understanding (1-5)</label>
                  <select
                    value={understandingScore}
                    onChange={(e) => setUnderstandingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Fair</option>
                    <option value={2}>2 - Weak</option>
                    <option value={1}>1 - Needs Revision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Exam Confidence</label>
                  <select
                    value={examConfidence}
                    onChange={(e) => setExamConfidence(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Improvement From Last Session</label>
                <input
                  type="text"
                  value={improvementFromLast}
                  onChange={(e) => setImprovementFromLast(e.target.value)}
                  placeholder="e.g. Mastered BCNF decomposition without looking at reference."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Session Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key concepts or tricky points..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
                >
                  {editingRecord ? 'Save Changes' : 'Record Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
