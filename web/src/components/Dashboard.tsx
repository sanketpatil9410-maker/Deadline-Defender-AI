import React, { useState } from 'react';
import { 
  ShieldAlert, CheckCircle2, Flame, RefreshCw, Zap, Coffee, Plus, 
  Trash2, ShieldCheck, Sparkles, Clock, AlertTriangle, ArrowRight, Play, Check
} from 'lucide-react';
import { Task, Habit } from '../types/task';
import { calculateRiskDetails } from '../utils/riskEngine';
import { formatDuration } from '../utils/formatters';

interface DashboardProps {
  tasks: Task[];
  streakCount: number;
  focusGoal: string;
  reflection: string;
  onSaveFocusGoal: (val: string) => void;
  onSaveReflection: (val: string) => void;
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (title: string) => void;
  onDeleteHabit?: (id: string) => void;
  onTriggerRescue: (task: Task) => void;
  onTriggerDemo: () => void;
  onNavigateToTasks: () => void;
}

export default function Dashboard({
  tasks,
  streakCount,
  focusGoal,
  reflection,
  onSaveFocusGoal,
  onSaveReflection,
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onTriggerRescue,
  onTriggerDemo,
  onNavigateToTasks
}: DashboardProps) {
  const [newHabit, setNewHabit] = useState('');
  const [goalEditing, setGoalEditing] = useState(false);
  const [tempGoal, setTempGoal] = useState(focusGoal);
  const [refEditing, setRefEditing] = useState(false);
  const [tempRef, setTempRef] = useState(reflection);

  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  
  // Calculate total workload minutes remaining
  const workloadMinutes = activeTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  // Calculate highest risk task
  let highestRiskTask: Task | null = null;
  let highestRiskScore = -1;
  let highestRiskDetails: any = null;

  activeTasks.forEach(task => {
    const details = calculateRiskDetails(task, tasks);
    if (details.riskScore > highestRiskScore) {
      highestRiskScore = details.riskScore;
      highestRiskTask = task;
      highestRiskDetails = details;
    }
  });

  // Tasks due today counts
  const now = new Date();
  const tasksDueToday = activeTasks.filter(t => {
    const dDate = new Date(t.deadline);
    return (
      dDate.getDate() === now.getDate() &&
      dDate.getMonth() === now.getMonth() &&
      dDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedTasks.length / totalCount) * 100) : 0;

  // Workload pressure meter calculations (0-100)
  // Scale by 180 mins of task load
  const pressureScore = Math.min(100, Math.round((workloadMinutes / 240) * 100));
  
  // Dynamic AI Confidence score based on completed items & streaks
  const confidenceScore = Math.min(100, Math.max(40, 50 + streakCount * 5 + (completionPercentage * 0.4)));

  const handleHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    onAddHabit(newHabit.trim());
    setNewHabit('');
  };

  const handleGoalSave = () => {
    onSaveFocusGoal(tempGoal);
    setGoalEditing(false);
  };

  const handleRefSave = () => {
    onSaveReflection(tempRef);
    setRefEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* GRADIENT HERO BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-2xl p-6 md:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10 scale-150 pointer-events-none">
          <ShieldAlert className="w-96 h-96 text-indigo-400" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous AI Rescue Agent Enabled</span>
          </span>
          
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            Deadline Defender <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">AI</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Stop missing deadlines. Start taking action. Deadline Defender AI uses Gemini to detect risk, prioritize action, create survival plans, and replan when life gets chaotic.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button 
              onClick={onTriggerDemo}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition duration-200 flex items-center space-x-2 shadow-lg shadow-indigo-950"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Load 1-Click Judge Demo</span>
            </button>
            <button 
              onClick={onNavigateToTasks}
              className="bg-slate-800/80 hover:bg-slate-700 hover:text-white text-slate-300 font-semibold px-5 py-2.5 rounded-xl text-xs border border-slate-700/80 transition duration-200"
            >
              Configure Task Shields
            </button>
          </div>
        </div>
      </div>

      {/* METRIC GRIDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xl">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Tasks</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{activeTasks.length}</span>
            <span className="text-xs text-slate-500">of {totalCount} total</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xl">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Due Today</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-rose-400">{tasksDueToday}</span>
            <span className="text-xs text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-bold">Alert</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-xl">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Workload Pressure</span>
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className={`text-3xl font-black ${pressureScore > 75 ? 'text-rose-400' : pressureScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pressureScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{formatDuration(workloadMinutes)}</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${pressureScore > 75 ? 'bg-rose-500' : pressureScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${pressureScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 flex items-center space-x-3.5 shadow-xl">
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-indigo-500" strokeDasharray={`${completionPercentage}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-xs font-black text-white">{completionPercentage}%</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold block uppercase tracking-wider">Completion</span>
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">{completedTasks.length} Completed</span>
          </div>
        </div>
      </div>

      {/* HIGHEST RISK INTERCEPTOR & NEXT BEST ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Highest Risk Task Block */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
              <h2 className="font-extrabold text-sm text-slate-100 uppercase tracking-widest">Active High-Risk Intercept</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Live Scoring Calibration
            </span>
          </div>

          {highestRiskTask ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <div className="space-y-2 max-w-md">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black tracking-widest bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded uppercase">
                      {highestRiskDetails.urgencyLevel} RISK ({highestRiskScore}/100)
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>{highestRiskDetails.timeRemainingText}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white leading-tight">{highestRiskTask.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{highestRiskTask.description}</p>
                </div>

                <button 
                  onClick={() => onTriggerRescue(highestRiskTask!)}
                  className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition duration-150 flex items-center space-x-1.5 self-start md:self-auto shrink-0 shadow-lg shadow-rose-950/40"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Activate Rescue Mode 2.0</span>
                </button>
              </div>

              <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-400">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Next Best AI Action Recommended</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{highestRiskDetails.recommendedAction}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center space-y-2">
              <ShieldCheck className="w-12 h-12 text-emerald-500 opacity-80" />
              <h3 className="font-bold text-slate-300 text-sm">Perfect Defensive Stance</h3>
              <p className="text-xs text-slate-500 max-w-xs">No active, high-risk targets identified. Insert tasks or trigger Judge Demo Mode to preview system capabilities.</p>
            </div>
          )}
        </div>

        {/* Warning card: What happens if I do nothing? */}
        <div className="bg-gradient-to-br from-rose-950/15 via-slate-900/60 to-rose-950/20 border border-rose-900/30 rounded-xl p-5 md:p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-200">What happens if I do nothing?</h3>
            </div>
            
            {highestRiskTask ? (
              <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <p>
                  If you fail to act on <strong className="text-slate-200">"{highestRiskTask.title}"</strong>, the deadline will elapse in <span className="text-rose-400 font-bold">{highestRiskDetails.timeRemainingText}</span>.
                </p>
                <p>
                  This triggers high stress, procrastination guilt, and reputation damage. You will have to rush a compromised output or request a late extension.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                You have zero pending critical deadlines. Your progress is on track and pressure levels are nominal.
              </p>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-4 mt-4 flex items-center justify-between relative z-10">
            <div className="space-y-0.5">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">System Status</span>
              <span className="text-xs font-bold text-emerald-400 block">Defender Secure</span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="text-[10px] uppercase font-bold text-slate-400">AI Confidence:</span>
              <span className="font-bold text-indigo-400">{confidenceScore}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* FOCUS LOCK & REFLECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Focus Lock */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Zap className="w-4 h-4 text-indigo-400" />
              <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-200">Today's Focus Lock</h4>
            </div>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-black uppercase tracking-wider">
              Goal Anchor
            </span>
          </div>

          {goalEditing ? (
            <div className="space-y-2">
              <textarea 
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setGoalEditing(false)}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleGoalSave}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-500 transition"
                >
                  Save Focus
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => { setTempGoal(focusGoal); setGoalEditing(true); }}
              className="group cursor-pointer min-h-[96px] bg-slate-950/40 border border-slate-850 hover:border-slate-800 p-3.5 rounded-xl transition flex flex-col justify-between"
            >
              <p className="text-xs text-slate-300 leading-relaxed italic">"{focusGoal}"</p>
              <span className="text-[10px] text-slate-500 font-semibold self-end group-hover:text-indigo-400 transition">
                Click to edit today's focus lock...
              </span>
            </div>
          )}
        </div>

        {/* Reflections */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <div className="flex items-center space-x-2 text-rose-400">
              <Coffee className="w-4 h-4 text-rose-400" />
              <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-200">Defensive Reflection</h4>
            </div>
            <span className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-black uppercase tracking-wider">
              Self-Review
            </span>
          </div>

          {refEditing ? (
            <div className="space-y-2">
              <textarea 
                value={tempRef}
                onChange={(e) => setTempRef(e.target.value)}
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setRefEditing(false)}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRefSave}
                  className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-500 transition"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => { setTempRef(reflection); setRefEditing(true); }}
              className="group cursor-pointer min-h-[96px] bg-slate-950/40 border border-slate-850 hover:border-slate-800 p-3.5 rounded-xl transition flex flex-col justify-between"
            >
              <p className="text-xs text-slate-300 leading-relaxed italic">"{reflection}"</p>
              <span className="text-[10px] text-slate-500 font-semibold self-end group-hover:text-rose-400 transition">
                Click to update reflections...
              </span>
            </div>
          )}
        </div>

      </div>

      {/* MICRO HABITS DEFENDER PANEL */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h4 className="font-extrabold text-xs uppercase tracking-widest text-slate-200">Micro-Habit Firewalls</h4>
          </div>
          
          <form onSubmit={handleHabitSubmit} className="flex space-x-2">
            <input 
              type="text" 
              required
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Deploy minor habit rule..." 
              className="bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:border-emerald-500 text-slate-200 placeholder-slate-500"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {habits.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No habit rules active. Add a quick behavior lock to start building streaks.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {habits.map(habit => (
              <div 
                key={habit.id}
                className={`p-3 rounded-xl border transition flex items-center justify-between group ${
                  habit.isCompleted 
                    ? 'bg-emerald-950/20 border-emerald-900/50 text-slate-400' 
                    : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 text-slate-200'
                }`}
              >
                <div 
                  onClick={() => onToggleHabit(habit.id)}
                  className="flex items-center space-x-2.5 cursor-pointer flex-1 select-none"
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                    habit.isCompleted ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 group-hover:border-slate-600'
                  }`}>
                    {habit.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className={`text-xs font-medium ${habit.isCompleted ? 'line-through opacity-60' : ''}`}>
                    {habit.title}
                  </span>
                </div>
                
                {onDeleteHabit && (
                  <button 
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
