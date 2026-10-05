import React, { useState } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { TaskItem, PriorityLevel } from '../types/lifeforge';
import { getTodayDateStr } from '../utils/initialState';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  Circle,
  Tag,
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { state, addTask, updateTask, toggleTask, deleteTask } = useLifeForge();
  const today = getTodayDateStr();

  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskItem['category']>('Study');
  const [dueDate, setDueDate] = useState(today);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [isRecurring, setIsRecurring] = useState(false);

  const categories: TaskItem['category'][] = [
    'Study',
    'Exercise',
    'Commitment',
    'Personal',
    'Health',
    'Custom',
  ];

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setCategory('Study');
    setDueDate(today);
    setDueTime('');
    setPriority('medium');
    setIsRecurring(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setDueDate(task.dueDate);
    setDueTime(task.dueTime || '');
    setPriority(task.priority);
    setIsRecurring(task.isRecurring);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        category,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        isRecurring,
      });
    } else {
      addTask({
        title,
        category,
        dueDate,
        dueTime: dueTime || undefined,
        priority,
        isRecurring,
        recurringType: isRecurring ? 'daily' : undefined,
      });
    }
    setIsModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = state.tasks.filter((t) => {
    if (filter === 'today' && t.dueDate !== today) return false;
    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    return true;
  });

  const completedCount = state.tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Actionable Agenda</span>
            <span aria-hidden="true">·</span>
            <span>Single Source of Truth</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Tasks & Accountability
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {completedCount} of {state.tasks.length} tasks completed · Changes sync directly with the AI Brain
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filter Tabs & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
          {(['all', 'today', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">No tasks found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Add a new task manually or ask the AI: <em className="text-slate-400">"Add task Finish DBMS Assignment at 5 PM"</em>
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                  )}
                </button>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{task.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{task.dueDate === today ? 'Today' : task.dueDate}</span>
                    </span>
                    {task.dueTime && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.dueTime}</span>
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span
                      className={`text-[11px] font-medium ${
                        task.priority === 'high'
                          ? 'text-rose-400'
                          : task.priority === 'medium'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-3">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Edit Task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Add / Edit Modal */}
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
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finish DBMS Assignment"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time (Optional)</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="recurringCheck" className="text-xs text-slate-300 cursor-pointer">
                  Recurring daily task
                </label>
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
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
