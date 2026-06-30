import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Play, Pause, RotateCcw, Copy, Check, MessageSquare, AlertTriangle, 
  HelpCircle, CheckSquare, Square, RefreshCw, BadgeInfo, ShieldCheck, Flame
} from 'lucide-react';
import { Task } from '../types/task';

interface RescueModeProps {
  task: Task | null;
  planText: string;
  loading: boolean;
  onMarkRescued: (id: string) => void;
  onGenerateRescue: (task: Task) => void;
  apiSource?: 'gemini' | 'local_fallback';
}

export default function RescueMode({
  task,
  planText,
  loading,
  onMarkRescued,
  onGenerateRescue,
  apiSource
}: RescueModeProps) {
  // Pomodoro Timer States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Micro checklists
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([
    { id: '1', text: 'Create initial document skeleton / project folder', completed: false },
    { id: '2', text: 'Write core minimum functional parts (ignore formatting)', completed: false },
    { id: '3', text: 'Remove any auxiliary or non-essential features', completed: false },
    { id: '4', text: 'Verify fundamental compilation or export checks', completed: false },
    { id: '5', text: 'Finalize submission / push to repository', completed: false }
  ]);

  // Message board templates
  const [msgType, setMsgType] = useState<'professor' | 'manager' | 'client' | 'teammate'>('professor');
  const [copied, setCopied] = useState(false);

  // Generate dynamic message content based on selected type
  const getEmergencyMessage = () => {
    const tTitle = task ? task.title : 'the pending project';
    switch (msgType) {
      case 'professor':
        return `Dear Professor, I am finalizing the final verification checks on "${tTitle}" now. The core requirements are assembled, and I am compiling the folder to submit. I will upload the package shortly. Thank you for your support.`;
      case 'manager':
        return `Hi, I am concluding the core functional elements of "${tTitle}" right now. Everything is on track, and I am performing final reviews. I will have the package ready for your desk in a short moment.`;
      case 'client':
        return `Hello, I'm performing final quality-assurance validation on the core parameters of "${tTitle}". The main deliverables are complete, and I am polishing the final assembly to share with you shortly. Thank you for your patience.`;
      case 'teammate':
        return `Hey team! I am completing my final sprint on "${tTitle}" now. The core implementation is solid, and I am compiling it to merge. I'll share the finalized PR link with you all in a few minutes.`;
    }
  };

  // Synchronous timer effects
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(prev => prev - 1);
        } else if (minutes > 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else {
          setIsRunning(false);
          if (timerRef.current) clearInterval(timerRef.current);
          alert("Focus sprint complete! Take a mandatory 5-minute offline breathing break.");
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, minutes, seconds]);

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getEmergencyMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress of interactive checklist
  const completedCount = checklist.filter(item => item.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  // Parse Markdown fields dynamically for the left-hand column
  const renderRescueData = () => {
    if (!planText) return null;

    const sections = planText.split(/(?=### |## )/g);
    return (
      <div className="space-y-5">
        {sections.map((section, idx) => {
          const lines = section.trim().split('\n');
          const heading = lines[0] || '';
          const bodies = lines.slice(1);

          const headingText = heading.replace(/###|##/g, '').trim();
          if (!headingText) return null;

          let colorTheme = 'text-rose-400 border-rose-500/20';
          if (headingText.toLowerCase().includes('schedule') || headingText.toLowerCase().includes('block')) {
            colorTheme = 'text-purple-400 border-purple-500/20';
          } else if (headingText.toLowerCase().includes('compression') || headingText.toLowerCase().includes('skip')) {
            colorTheme = 'text-amber-400 border-amber-500/20';
          }

          return (
            <div key={idx} className="bg-slate-900/40 border border-slate-850 p-5 rounded-xl space-y-3 shadow">
              <h4 className={`text-xs font-black uppercase tracking-widest pb-1 border-b border-slate-800/80 ${colorTheme}`}>
                {headingText}
              </h4>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                {bodies.map((line, lIdx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                    return (
                      <div key={lIdx} className="flex items-start pl-3 py-0.5">
                        <span className="w-1.5 h-1.5 mt-1.5 mr-2 rounded-full bg-rose-400 shrink-0"></span>
                        <span>{parseBoldContent(trimmed.replace(/^[-*]\s*/, ''))}</span>
                      </div>
                    );
                  }
                  return <p key={lIdx}>{parseBoldContent(trimmed)}</p>;
                })}
              </div>
            </div>
          );
        })}
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

  if (!task) {
    return (
      <div className="text-center py-16 bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3">
        <Zap className="w-12 h-12 text-slate-600 opacity-60" />
        <div>
          <h3 className="font-bold text-slate-300">Rescue Mode Inactive</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
            Navigate to the Tasks list and click the "Rescue" button next to any high-urgency task to formulate an emergency completion roadmap.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center space-x-1">
              <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
              <span>Emergency Sprints Active</span>
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider mt-1">Rescue Mode 2.0</h2>
          <p className="text-slate-400 text-xs mt-0.5">Defending task: <strong className="text-slate-200">"{task.title}"</strong></p>
        </div>

        <button 
          onClick={() => onMarkRescued(task.id)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition duration-150 flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Mark Task Rescued (Complete)</span>
        </button>
      </div>

      {/* API Source Badge */}
      {apiSource && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          apiSource === 'gemini' 
            ? 'bg-rose-950/20 border-rose-900/40 text-rose-400' 
            : 'bg-amber-950/20 border-amber-900/40 text-amber-400'
        }`}>
          <div className="flex items-center space-x-2">
            <BadgeInfo className="w-4 h-4 shrink-0" />
            <span>
              {apiSource === 'gemini' 
                ? '🔴 Active Rescue Interceptor: Crisis schedule optimized using real-time gemini-3.5-flash prompts.' 
                : '⚠️ Offline Fallback Mode: Rules-based local compression blocks calculated due to API network error.'}
            </span>
          </div>
          <button 
            onClick={() => onGenerateRescue(task)}
            className="text-[10px] uppercase font-black bg-slate-900 hover:bg-slate-850 border border-slate-800 px-2 py-1 rounded text-slate-300 flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regen</span>
          </button>
        </div>
      )}

      {/* TWO COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: AI Rescue Details */}
        <div className="lg:col-span-7 space-y-5">
          {loading ? (
            <div className="py-24 text-center bg-slate-900/20 border border-slate-850 rounded-2xl flex flex-col items-center justify-center space-y-4 shadow-xl">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-300 text-sm">Compiling Minimum Viable Path...</h3>
                <p className="text-slate-500 text-xs">Isolating what to skip, what to simplify, and blocking distractions.</p>
              </div>
            </div>
          ) : planText ? (
            renderRescueData()
          ) : (
            <div className="p-8 text-center bg-slate-900/30 border border-slate-850 rounded-2xl">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-xs">Could not load dynamic rescue suggestions. Try clicking Regenerate above.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Timer & Message Hub */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* POMODORO TIMER PANEL */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
              {/* Glowing countdown bar */}
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-1000"
                style={{ width: `${((minutes * 60 + seconds) / 1500) * 100}%` }}
              ></div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pomodoro Focus Sprint Timer</span>
            
            <div className="text-6xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>

            <div className="flex items-center space-x-3.5 pt-2">
              <button 
                onClick={handleToggleTimer}
                className={`font-extrabold text-xs px-4 py-2 rounded-xl transition duration-150 flex items-center space-x-1.5 ${
                  isRunning 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-950'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isRunning ? 'Pause Block' : 'Start Focus Sprint'}</span>
              </button>

              <button 
                onClick={handleResetTimer}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-750 transition"
                title="Reset to 25m"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 max-w-xs italic leading-relaxed">
              * The human mind cannot panic while deeply concentrated on a single 25-minute sprint. Work without pausing until the bell sounds.
            </p>
          </div>

          {/* INTERACTIVE COMPRESSION CHECKLIST */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
              <span className="text-xs font-black uppercase tracking-widest text-slate-200">Interactive Focus Milestones</span>
              <span className="text-xs font-bold text-indigo-400">{progressPercent}% done</span>
            </div>

            {/* Checklist progress bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="space-y-2.5 pt-1.5">
              {checklist.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`p-3 rounded-lg border transition cursor-pointer flex items-start space-x-3 ${
                    item.completed 
                      ? 'bg-emerald-950/15 border-emerald-900/40 text-slate-400' 
                      : 'bg-slate-950/30 border-slate-850 hover:border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.completed ? (
                      <div className="w-4 h-4 rounded bg-emerald-500 border border-emerald-500 flex items-center justify-center text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-slate-750 hover:border-slate-600 bg-slate-950"></div>
                    )}
                  </div>
                  <span className={`text-xs font-medium leading-relaxed ${item.completed ? 'line-through opacity-60' : ''}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* EMERGENCY COMMUNICATION CENTER */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
              <span className="text-xs font-black uppercase tracking-widest text-slate-200">Emergency Message Hub</span>
              <span className="text-[10px] text-slate-500 italic">Preempt delay tension</span>
            </div>

            {/* Selector tabs */}
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {(['professor', 'manager', 'client', 'teammate'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setMsgType(type)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition duration-100 ${
                    msgType === type 
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                      : 'bg-slate-950/30 border border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-mono relative">
                {getEmergencyMessage()}
              </div>

              <button 
                onClick={handleCopyMessage}
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs py-2 rounded-xl border border-slate-700/80 transition duration-150 flex items-center justify-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Emergency Message'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
