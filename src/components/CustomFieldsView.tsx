import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { CustomField } from '../types/lifeforge';
import { getTodayDateStr } from '../utils/initialState';
import { Sliders, Plus, Trash2, Check, Sparkles } from 'lucide-react';

export const CustomFieldsView: React.FC = () => {
  const { state, addCustomField, deleteCustomField, logCustomFieldValue } = useLifeForge();
  const today = getTodayDateStr();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('30');
  const [unit, setUnit] = useState('mins');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [description, setDescription] = useState('');

  const quickCustomSuggestions = [
    { name: 'Reading Books', target: 30, unit: 'mins' },
    { name: 'Meditation & Breathwork', target: 15, unit: 'mins' },
    { name: 'Coding Practice (LeetCode/Projects)', target: 60, unit: 'mins' },
    { name: 'Evening Skincare Routine', target: 1, unit: 'routine' },
    { name: 'Guitar / Music Practice', target: 25, unit: 'mins' },
    { name: 'Daily Prayer / Mindfulness', target: 15, unit: 'mins' },
  ];

  const handleOpenAdd = () => {
    setName('Reading');
    setTarget('30');
    setUnit('mins');
    setFrequency('daily');
    setDescription('Read non-fiction / technical literature');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomField({
      name,
      target: Number(target) || 1,
      unit,
      frequency,
      description,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Flexible Habit Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Custom Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Custom Habits & Fields
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track reading, meditation, skincare, coding, prayer, or any personal goal. AI can create new fields dynamically upon request.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Field</span>
        </button>
      </div>

      {/* Grid of custom fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.customFields.map((field) => {
          const todayLogs = state.customFieldLogs.filter(
            (l) => l.fieldId === field.id && l.date === today
          );
          const totalValueToday = todayLogs.reduce((a, b) => a + b.value, 0);
          const percent = Math.min(100, Math.round((totalValueToday / field.target) * 100));

          return (
            <div
              key={field.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">{field.name}</h3>
                  <button
                    onClick={() => deleteCustomField(field.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded"
                    title="Delete field"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {field.description && (
                  <p className="text-xs text-slate-400 mb-3">{field.description}</p>
                )}

                <div className="flex items-baseline justify-between mb-1.5 font-mono">
                  <span className="text-xl font-bold text-white">
                    {totalValueToday} <span className="text-xs text-slate-400 font-sans">{field.unit}</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Goal: {field.target} {field.unit} ({field.frequency})
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Quick Increment Controls */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400 font-medium">Log Today:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => logCustomFieldValue(field.id, Math.ceil(field.target / 3))}
                    className="px-2.5 py-1 text-xs bg-slate-950 hover:bg-indigo-950 border border-slate-800 hover:border-indigo-700/60 text-indigo-300 rounded-lg"
                  >
                    +{Math.ceil(field.target / 3)} {field.unit}
                  </button>
                  <button
                    onClick={() => logCustomFieldValue(field.id, field.target)}
                    className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Goal Met ({field.target})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-2 font-display">Create Custom Habit / Metric</h3>
            <p className="text-xs text-slate-400 mb-4">
              Expand LifeForge tracking beyond defaults to fit your exact lifestyle.
            </p>

            {/* Quick Suggestions */}
            <div className="mb-4">
              <span className="text-[11px] text-slate-400 block mb-1.5">Popular Ideas:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickCustomSuggestions.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setName(item.name);
                      setTarget(String(item.target));
                      setUnit(item.unit);
                    }}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Field Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Reading, Meditation, Skincare, Coding"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. mins, pages, reps"
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Daily morning reading 30 mins"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
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
                  Create Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
