import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { Task } from '../types/task';

interface TaskFormProps {
  task: Task | null; // Null means Add Task, otherwise Edit Task
  onSave: (taskForm: Omit<Task, 'id' | 'riskScore' | 'urgencyLevel' | 'riskReason' | 'timeRemainingText' | 'recommendedAction' | 'rescueRequired'>) => void;
  onClose: () => void;
}

const CATEGORIES = ['Work', 'Study', 'Personal', 'Finance', 'Health', 'Business', 'Other'] as const;
const IMPORTANCE_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
const STATUSES = ['Not Started', 'In Progress', 'Blocked', 'Completed'] as const;
const ENERGY_LEVELS = ['Low', 'Medium', 'High'] as const;

export default function TaskForm({ task, onSave, onClose }: TaskFormProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Work' as typeof CATEGORIES[number],
    deadline: '',
    estimatedMinutes: 45,
    importance: 'High' as typeof IMPORTANCE_LEVELS[number],
    status: 'Not Started' as typeof STATUSES[number],
    energyRequired: 'High' as typeof ENERGY_LEVELS[number],
    notes: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        category: task.category,
        deadline: task.deadline,
        estimatedMinutes: task.estimatedMinutes,
        importance: task.importance,
        status: task.status,
        energyRequired: task.energyRequired,
        notes: task.notes || '',
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deadline) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Form Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-extrabold text-slate-100 text-sm uppercase tracking-widest">
              {task ? 'Configure Defensive Shield' : 'Activate New Task Shield'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Task Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Submit Final Pitch Deck"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Description</label>
            <textarea 
              placeholder="Outline deliverables, constraints, or goals of this milestone..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none placeholder-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Category</label>
              <select 
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Importance Level</label>
              <select 
                value={form.importance}
                onChange={(e) => setForm({ ...form, importance: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {IMPORTANCE_LEVELS.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Deadline Date & Time *</label>
              <input 
                type="datetime-local" 
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Est. Duration (Minutes)</label>
              <input 
                type="number" 
                required
                min="1"
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: Math.max(1, parseInt(e.target.value) || 30) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Energy Required</label>
              <select 
                value={form.energyRequired}
                onChange={(e) => setForm({ ...form, energyRequired: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {ENERGY_LEVELS.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</label>
              <select 
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Private Notes / Meta Tag</label>
            <input 
              type="text" 
              placeholder="e.g. Needs approval from coordinator, code hosted on GitLab"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 border-t border-slate-850 pt-4 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
            >
              {task ? 'Save Changes' : 'Activate Shield'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
