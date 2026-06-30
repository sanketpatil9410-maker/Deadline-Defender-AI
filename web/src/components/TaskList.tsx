import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, Plus, ShieldCheck, ShieldAlert, SortAsc, 
  Filter, Calendar, Clock, RefreshCw
} from 'lucide-react';
import { Task } from '../types/task';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onRescue: (task: Task) => void;
  onBreakdown: (task: Task) => void;
  onTriggerLate: (task: Task) => void;
  onAddTaskClick: () => void;
}

type FilterCategory = 'All' | 'Work' | 'Study' | 'Personal' | 'Finance' | 'Health' | 'Business' | 'Other';
type FilterStatus = 'All' | 'Active' | 'Completed' | 'Blocked' | 'In Progress';
type SortField = 'deadline' | 'riskScore' | 'importance' | 'title';

export default function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onRescue,
  onBreakdown,
  onTriggerLate,
  onAddTaskClick
}: TaskListProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FilterCategory>('All');
  const [status, setStatus] = useState<FilterStatus>('Active');
  const [sortBy, setSortBy] = useState<SortField>('riskScore');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search match
    const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
      task.description?.toLowerCase().includes(search.toLowerCase());

    // Category match
    const matchCat = category === 'All' || task.category === category;

    // Status match
    let matchStatus = true;
    if (status === 'Active') matchStatus = task.status !== 'Completed';
    else if (status === 'Completed') matchStatus = task.status === 'Completed';
    else if (status === 'Blocked') matchStatus = task.status === 'Blocked';
    else if (status === 'In Progress') matchStatus = task.status === 'In Progress';

    return matchSearch && matchCat && matchStatus;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'riskScore') {
      // Re-calculate risk score on the fly for comparison
      const scoreA = a.status === 'Completed' ? 0 : 50; // simple fallback weight
      const scoreB = b.status === 'Completed' ? 0 : 50;
      return (b.riskScore || scoreB) - (a.riskScore || scoreA);
    }
    if (sortBy === 'importance') {
      const weight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return weight[b.importance] - weight[a.importance];
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar with Action Button */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Task Defense Field</h2>
          <p className="text-slate-400 text-xs mt-0.5">Control, analyze, and execute pending deliverables before timelines dissolve.</p>
        </div>

        <button 
          onClick={onAddTaskClick}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-indigo-950"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy New Task Shield</span>
        </button>
      </div>

      {/* Control Filters Area */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 md:p-5 space-y-4 shadow-md">
        
        {/* Search & Basic filters row */}
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search active task parameters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="Active">Active Shields</option>
              <option value="All">All Items</option>
              <option value="Completed">Completed Only</option>
              <option value="Blocked">Blocked Shields</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-slate-500 shrink-0" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="riskScore">Threat Score (High &rarr; Low)</option>
              <option value="deadline">Proximity (Closest &rarr; Far)</option>
              <option value="importance">Importance (Critical &rarr; Low)</option>
              <option value="title">Alphabetical (A &rarr; Z)</option>
            </select>
          </div>

        </div>

        {/* Categories scroll filter row */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0 mr-1">Category:</span>
          {['All', 'Work', 'Study', 'Personal', 'Finance', 'Health', 'Business', 'Other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-150 shrink-0 ${
                category === cat 
                  ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400' 
                  : 'bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of task cards */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-600 opacity-60" />
          <div>
            <h3 className="font-bold text-slate-300">No Target Shields Match Filters</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
              Refine your searches, select 'All' categories, or check the 'All Items' list status.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map(task => (
            <TaskCard 
              key={task.id}
              task={task}
              allTasks={tasks}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onRescue={onRescue}
              onBreakdown={onBreakdown}
              onTriggerLate={onTriggerLate}
            />
          ))}
        </div>
      )}

    </div>
  );
}
