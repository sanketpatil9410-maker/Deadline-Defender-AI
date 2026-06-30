import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, RefreshCw, Sparkles, Check, BadgeInfo, Clock, ShieldCheck, 
  HelpCircle, Sparkle, Ban, Send, EyeOff, ClipboardCheck
} from 'lucide-react';
import { Task } from '../types/task';

interface DelayRecoveryProps {
  tasks: Task[];
  recoveryText: string;
  loading: boolean;
  onGenerateRecovery: (
    task: Task, 
    minsRemaining: number, 
    progress: number, 
    isMandatory: boolean
  ) => void;
  apiSource?: 'gemini' | 'local_fallback';
  initialTaskId?: string;
}

export default function DelayRecovery({
  tasks,
  recoveryText,
  loading,
  onGenerateRecovery,
  apiSource,
  initialTaskId
}: DelayRecoveryProps) {
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');

  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || '');
  const [minsRemaining, setMinsRemaining] = useState(30);
  const [progress, setProgress] = useState(40);
  const [isMandatory, setIsMandatory] = useState(true);

  useEffect(() => {
    if (initialTaskId) {
      setSelectedTaskId(initialTaskId);
    }
  }, [initialTaskId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task = pendingTasks.find(t => t.id === selectedTaskId);
    if (!task) return;
    onGenerateRecovery(task, minsRemaining, progress, isMandatory);
  };

  // Extract a mock or structured success probability from response text
  const getSuccessProbability = () => {
    if (!recoveryText) return 50;
    // Check if text has numbers with percentage inside recoveryText
    const match = recoveryText.match(/(\d{1,2})%/);
    if (match) {
      return Math.max(10, Math.min(99, parseInt(match[1])));
    }
    // Static fallback calculations based on inputs
    let base = 90 - (minsRemaining < 30 ? 30 : 0) - (isMandatory ? 15 : 0) + (progress * 0.4);
    return Math.round(Math.max(15, Math.min(95, base)));
  };

  const successProb = getSuccessProbability();

  const renderRecoveryBlocks = () => {
    if (!recoveryText) return null;

    const sections = recoveryText.split(/(?=### |## )/g);
    return (
      <div className="space-y-5">
        {/* Dynamic header card showing success probability */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Delay Recovery Analysis Complete</h4>
            <p className="text-xs text-slate-400">The sub-agent compiled compression schedules based on your available window.</p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-850 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Success Probability</span>
              <span className={`text-base font-black ${
                successProb > 70 ? 'text-emerald-400' : successProb > 40 ? 'text-amber-400' : 'text-rose-400'
              }`}>{successProb}% Accuracy</span>
            </div>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={successProb > 70 ? 'text-emerald-500' : successProb > 40 ? 'text-amber-500' : 'text-rose-500'} strokeDasharray={`${successProb}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>

        {/* Structured cards based on blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sections.map((section, idx) => {
            const lines = section.trim().split('\n');
            const heading = lines[0] || '';
            const bodies = lines.slice(1);

            const headingText = heading.replace(/###|##/g, '').trim();
            if (!headingText) return null;

            let accentStyle = 'text-amber-400 border-amber-500/20';
            let bgStyle = 'bg-amber-950/10';
            if (headingText.toLowerCase().includes('postpone') || headingText.toLowerCase().includes('reschedule')) {
              accentStyle = 'text-indigo-400 border-indigo-500/20';
              bgStyle = 'bg-indigo-950/10';
            } else if (headingText.toLowerCase().includes('reboot') || headingText.toLowerCase().includes('protocol') || headingText.toLowerCase().includes('step')) {
              accentStyle = 'text-emerald-400 border-emerald-500/20';
              bgStyle = 'bg-emerald-950/10';
            }

            return (
              <div key={idx} className={`border border-slate-800 rounded-xl p-5 ${bgStyle} shadow shadow-slate-950 flex flex-col justify-between`}>
                <div className="space-y-3.5">
                  <h4 className={`text-xs font-black uppercase tracking-widest pb-1 border-b border-slate-850 ${accentStyle}`}>
                    {headingText}
                  </h4>
                  <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                    {bodies.map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return null;

                      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                        return (
                          <div key={lIdx} className="flex items-start pl-3 py-0.5">
                            <span className="w-1.5 h-1.5 mt-1.5 mr-2 rounded-full bg-slate-400 shrink-0"></span>
                            <span>{parseBoldContent(trimmed.replace(/^[-*]\s*/, ''))}</span>
                          </div>
                        );
                      }
                      return <p key={lIdx}>{parseBoldContent(trimmed)}</p>;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const parseBoldContent = (str: string) => {
    const parts = str.split('**');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-extrabold text-slate-100">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-wider">"I'm Running Late" Recovery</h2>
        <p className="text-slate-400 text-xs mt-0.5">The delay recovery sub-agent compresses scope, postpones side parameters, and recalculates success routes.</p>
      </div>

      {/* Connection Indicator */}
      {apiSource && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          apiSource === 'gemini' 
            ? 'bg-amber-950/20 border-amber-900/40 text-amber-400' 
            : 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300'
        }`}>
          <div className="flex items-center space-x-2">
            <BadgeInfo className="w-4 h-4 shrink-0" />
            <span>
              {apiSource === 'gemini' 
                ? '🔴 Recovery Agent Engaged: Sub-process compiling scope-cuts server-side with gemini-3.5-flash.' 
                : '⚠️ Offline Fallback Active: Formulating mathematical scope-cuts based on local fallback parameters.'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            {apiSource === 'gemini' ? 'AI Cloud' : 'Local Backup'}
          </span>
        </div>
      )}

      {/* INPUT FORM PANEL */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Task selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Delayed Task *</label>
              <select
                required
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose delayed task shield --</option>
                {pendingTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title} (due soon)</option>
                ))}
              </select>
            </div>

            {/* Acceptability option */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Deadline Flexibility *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsMandatory(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    isMandatory 
                      ? 'bg-amber-600/10 border-amber-500/40 text-amber-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Fixed (Mandatory)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMandatory(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    !isMandatory 
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Flexible (Adjustable)</span>
                </button>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Minutes left */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Time Remaining *</label>
                <span className="text-xs text-amber-400 font-bold">{minsRemaining} minutes</span>
              </div>
              <input 
                type="range" 
                min="5"
                max="240"
                step="5"
                value={minsRemaining}
                onChange={(e) => setMinsRemaining(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer border border-slate-800"
              />
            </div>

            {/* Current progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Current Progress *</label>
                <span className="text-xs text-amber-400 font-bold">{progress}% completed</span>
              </div>
              <input 
                type="range" 
                min="0"
                max="95"
                step="5"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg appearance-none cursor-pointer border border-slate-800"
              />
            </div>

          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2 border-t border-slate-850">
            <button 
              type="submit"
              disabled={loading || !selectedTaskId}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-850 disabled:text-slate-600 disabled:border-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition duration-150 flex items-center space-x-1.5 shadow-lg shadow-amber-950/40 animate-pulse"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Initialize Recovery Plan</span>
            </button>
          </div>

        </form>
      </div>

      {/* RECOVERY SUGGESTIONS BLOCK */}
      {loading ? (
        <div className="py-20 text-center bg-slate-900/20 border border-slate-800/60 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-xl animate-pulse">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-300 text-sm">Deploying Delay Recovery Sub-Agent...</h3>
            <p className="text-slate-500 text-xs">Computing minimum acceptable outputs and re-indexing the schedule.</p>
          </div>
        </div>
      ) : recoveryText ? (
        renderRecoveryBlocks()
      ) : (
        <div className="py-16 text-center bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-slate-600 opacity-60" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-300 text-sm">Recovery Model Safe</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Select an approaching task, configure the sliders, and click "Initialize" to trigger contingency planning.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
