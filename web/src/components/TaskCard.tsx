import React from 'react';
import { 
  Calendar, Clock, Edit2, Trash2, Zap, AlertTriangle, Check, CheckCircle2, 
  HelpCircle, ChevronDown, ListTodo, ShieldAlert
} from 'lucide-react';
import { Task } from '../types/task';
import { calculateRiskDetails } from '../utils/riskEngine';
import { formatDateTime, formatDuration } from '../utils/formatters';

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onRescue: (task: Task) => void;
  onBreakdown: (task: Task) => void;
  onTriggerLate: (task: Task) => void;
}

export default function TaskCard({
  task,
  allTasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onRescue,
  onBreakdown,
  onTriggerLate
}: TaskCardProps) {
  const isDone = task.status === 'Completed';
  const risk = calculateRiskDetails(task, allTasks);

  // Status style helper
  const getStatusBadgeStyle = () => {
    switch (task.status) {
      case 'Completed': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'Blocked': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'In Progress': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  // Importance style helper
  const getImportanceBadgeStyle = () => {
    switch (task.importance) {
      case 'Critical': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      case 'High': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'Medium': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      default: return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  // Risk style helper
  const getRiskBadgeStyle = () => {
    if (isDone) return 'bg-slate-800 border-slate-700 text-slate-400';
    switch (risk.urgencyLevel) {
      case 'Overdue': return 'bg-rose-600/20 border-rose-500/30 text-rose-400 font-bold';
      case 'Critical': return 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold';
      case 'Urgent': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'Watch': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      default: return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col md:flex-row relative transition duration-200 group ${
      isDone ? 'opacity-55 bg-slate-950/40' : 'hover:border-slate-700/60 shadow-md'
    }`}>
      
      {/* Risk Color Stripe Accent */}
      <div className={`w-full md:w-1.5 h-1.5 md:h-auto shrink-0 transition ${
        isDone ? 'bg-slate-700' : 
        risk.urgencyLevel === 'Overdue' || risk.urgencyLevel === 'Critical' ? 'bg-rose-500' :
        risk.urgencyLevel === 'Urgent' ? 'bg-amber-500' :
        risk.urgencyLevel === 'Watch' ? 'bg-indigo-500' : 'bg-emerald-500'
      }`}></div>

      <div className="p-4 md:p-5 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="space-y-2 flex-1 min-w-0">
          
          {/* Badge Rows */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-black tracking-wider bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 uppercase">
              {task.category}
            </span>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${getImportanceBadgeStyle()}`}>
              {task.importance} Importance
            </span>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${getStatusBadgeStyle()}`}>
              {task.status}
            </span>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${getRiskBadgeStyle()}`}>
              {isDone ? 'Stable' : `${risk.urgencyLevel} Risk (${risk.riskScore}/100)`}
            </span>
          </div>

          {/* Title Row */}
          <div className="flex items-start space-x-2">
            <button 
              onClick={() => onToggleComplete(task.id)}
              className={`w-5 h-5 rounded border mt-0.5 shrink-0 flex items-center justify-center transition ${
                isDone 
                  ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
              }`}
            >
              {isDone && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
            <h3 className={`text-sm md:text-base font-bold text-white leading-tight break-words ${isDone ? 'line-through opacity-50' : ''}`}>
              {task.title}
            </h3>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-400 leading-relaxed pl-7 break-words line-clamp-2 md:line-clamp-none">
              {task.description}
            </p>
          )}

          {/* Secondary Details */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pl-7 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Deadline: {formatDateTime(task.deadline)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Est: {formatDuration(task.estimatedMinutes)}</span>
            </span>
            {task.notes && (
              <span className="italic text-slate-500 line-clamp-1">Note: {task.notes}</span>
            )}
            {!isDone && (
              <span className={`font-semibold ${
                risk.urgencyLevel === 'Overdue' || risk.urgencyLevel === 'Critical' ? 'text-rose-400' : 'text-slate-400'
              }`}>
                Time Left: {risk.timeRemainingText}
              </span>
            )}
          </div>

          {/* Next Best Action recommendation on card hover or detail */}
          {!isDone && (
            <div className="bg-slate-950/30 border border-slate-850/50 rounded-lg p-2.5 pl-7 mt-1 text-[11px] text-slate-300 leading-relaxed">
              <span className="font-bold text-indigo-400 uppercase tracking-wide text-[9px] block mb-0.5">Recommended Next Step:</span>
              {risk.recommendedAction}
            </div>
          )}

        </div>

        {/* Action Panel Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 md:self-auto pl-7 md:pl-0 shrink-0">
          {!isDone && (
            <>
              <button 
                onClick={() => onRescue(task)}
                className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition duration-150 flex items-center space-x-1 shadow-md shadow-rose-950/40"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Rescue</span>
              </button>

              <button 
                onClick={() => onBreakdown(task)}
                className="bg-indigo-950/40 hover:bg-indigo-900/40 hover:text-indigo-200 text-indigo-300 font-bold px-3 py-1.5 rounded-lg text-xs border border-indigo-900/30 transition flex items-center space-x-1"
              >
                <ListTodo className="w-3.5 h-3.5" />
                <span>Breakdown</span>
              </button>

              <button 
                onClick={() => onTriggerLate(task)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-700/80 transition flex items-center space-x-1"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Running Late</span>
              </button>
            </>
          )}

          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onEdit(task)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
              title="Configure Parameters"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button 
              onClick={() => onDelete(task.id)}
              className="p-2 bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition"
              title="Retire Shield"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
