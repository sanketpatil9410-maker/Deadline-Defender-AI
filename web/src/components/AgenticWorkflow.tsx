import React, { useState } from 'react';
import { 
  Eye, Cpu, ArrowRightLeft, Scroll, ShieldAlert, AlertTriangle, 
  CheckCircle2, Sparkles, ChevronRight, Play, Server, Clock, Flame
} from 'lucide-react';

const STAGES = [
  {
    id: 'observe',
    num: '1',
    title: 'Observe',
    icon: Eye,
    color: 'text-indigo-400 border-indigo-500/20 bg-indigo-950/10',
    desc: 'Scans the task environment: parses deadlines, checks current system timestamp, tracks completion ratios, and hydrates local storage cache.',
    meta: 'Telemetry Feed Active'
  },
  {
    id: 'analyze',
    num: '2',
    title: 'Analyze',
    icon: Cpu,
    color: 'text-rose-400 border-rose-500/20 bg-rose-950/10',
    desc: 'Runs local risk scoring logic: weights estimated durations against remaining hours, factors in energy requirements, and identifies highest-threat item.',
    meta: 'Risk Engine Scoring'
  },
  {
    id: 'prioritize',
    num: '3',
    title: 'Prioritize',
    icon: ArrowRightLeft,
    color: 'text-amber-400 border-amber-500/20 bg-amber-950/10',
    desc: 'Leverages Gemini model: re-ranks task priority, flags unrealistic workloads, and determines tactical order to counter task paralysis.',
    meta: 'gemini-3.5-flash Core'
  },
  {
    id: 'plan',
    num: '4',
    title: 'Plan',
    icon: Scroll,
    color: 'text-purple-400 border-purple-500/20 bg-purple-950/10',
    desc: 'Constructs custom survival frameworks: plans timeline schedules, isolates what to skip or simplify, and allocates strategic rest buffers.',
    meta: 'Structured Block Assembly'
  },
  {
    id: 'rescue',
    num: '5',
    title: 'Rescue',
    icon: Flame,
    color: 'text-rose-400 border-rose-500/20 bg-rose-950/10',
    desc: 'Launches active focus shields: triggers a 25m Pomodoro sprint, sets up interactive milestones, and formats copiable emergency messages.',
    meta: 'Focus Sprint Control'
  },
  {
    id: 'replan',
    num: '6',
    title: 'Replan',
    icon: AlertTriangle,
    color: 'text-amber-400 border-amber-500/20 bg-amber-950/10',
    desc: 'Intercepts late delays: calculates success probabilities, compromises auxiliary parameters, drafts extension notes, and restructures today’s calendar.',
    meta: 'Contingency Sub-Agent'
  },
  {
    id: 'complete',
    num: '7',
    title: 'Complete',
    icon: CheckCircle2,
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10',
    desc: 'Secures progress: marks task complete, releases active lock, writes behavioral self-reflections, and increments local habit streaks.',
    meta: 'Progress Vault Sync'
  }
];

export default function AgenticWorkflow() {
  const [activeStage, setActiveStage] = useState('prioritize');

  const selectedStage = STAGES.find(s => s.id === activeStage) || STAGES[2];
  const SelectedIcon = selectedStage.icon;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-wider">Agentic Pipeline Visualizer</h2>
        <p className="text-slate-400 text-xs mt-0.5">Explore the autonomous cognitive loop driving Deadline Defender AI’s decision matrix.</p>
      </div>

      {/* CORE TIMELINE GRAPHIC (VISUAL PIPE) */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-20 translate-y-10">
          <Server className="w-80 h-80 text-indigo-500" />
        </div>

        {/* Pipeline horizontal connection bar */}
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-2 pt-4">
          
          {/* Connector bar line for medium screens + */}
          <div className="hidden md:block absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-850 z-0"></div>

          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = stage.id === activeStage;
            const isCompleted = idx < STAGES.findIndex(s => s.id === activeStage);

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className="relative z-10 flex flex-col items-center group focus:outline-none"
              >
                {/* Node circle */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition duration-200 relative ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950 scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
                    : isCompleted
                    ? 'bg-slate-900 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-750'
                }`}>
                  <Icon className="w-5 h-5" />
                  
                  {/* Step number tag */}
                  <span className={`absolute -top-1.5 -right-1.5 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-white text-indigo-950' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {stage.num}
                  </span>
                </div>

                {/* Node Label */}
                <span className={`text-[10px] font-extrabold uppercase tracking-widest mt-2.5 transition ${
                  isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                }`}>
                  {stage.title}
                </span>

                {/* Mobile connector line spacer */}
                {idx < STAGES.length - 1 && (
                  <div className="block md:hidden h-6 w-0.5 bg-slate-850 my-2"></div>
                )}
              </button>
            );
          })}

        </div>

        {/* SELECTED STAGE DEBRIEF PANEL */}
        <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-5 md:p-6 space-y-4 relative">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg border ${selectedStage.color}`}>
                <SelectedIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Stage {selectedStage.num} of 7</span>
                <h3 className="text-base font-black text-white">{selectedStage.title} Node</h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 px-3 py-1 rounded border border-slate-850">
                {selectedStage.meta}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">Process Overview</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedStage.desc}</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 space-y-2.5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Underlying Technologies</h4>
              <div className="space-y-1.5 text-[11px] text-slate-300">
                {selectedStage.id === 'observe' && (
                  <>
                    <p>⚡ HTML5 LocalStorage Persistence</p>
                    <p>⚡ High-Resolution Performance APIs</p>
                    <p>⚡ JS State Subscriptions</p>
                  </>
                )}
                {selectedStage.id === 'analyze' && (
                  <>
                    <p>⚡ local riskEngine.ts Scoring Model</p>
                    <p>⚡ Concurrency Threat Evaluation</p>
                    <p>⚡ Deadline Closeness Integrator</p>
                  </>
                )}
                {selectedStage.id === 'prioritize' && (
                  <>
                    <p>⚡ Google AI Studio Server Node</p>
                    <p>⚡ gemini-3.5-flash Context Parsing</p>
                    <p>⚡ Workload Capacity Calibration</p>
                  </>
                )}
                {selectedStage.id === 'plan' && (
                  <>
                    <p>⚡ Gemini Structured Prompt Pipes</p>
                    <p>⚡ Dynamic 4-Block Schedules</p>
                    <p>⚡ Auto-Buffer Computations</p>
                  </>
                )}
                {selectedStage.id === 'rescue' && (
                  <>
                    <p>⚡ Pomodoro Focused Interval Timers</p>
                    <p>⚡ Copiable Message Formatter</p>
                    <p>⚡ Interactive State Progress bars</p>
                  </>
                )}
                {selectedStage.id === 'replan' && (
                  <>
                    <p>⚡ Delay Recovery Sub-Agent API</p>
                    <p>⚡ Success Likelihood Weights</p>
                    <p>⚡ Extension Note Templating</p>
                  </>
                )}
                {selectedStage.id === 'complete' && (
                  <>
                    <p>⚡ Local Storage Writeback</p>
                    <p>⚡ Dynamic Habit Streaks System</p>
                    <p>⚡ Structured Self-Review logs</p>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
