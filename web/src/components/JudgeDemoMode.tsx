import React from 'react';
import { 
  ShieldCheck, ArrowRight, Play, RefreshCw, Layers, Sparkles, 
  Flame, AlertTriangle, MessageSquare, ChevronRight, HelpCircle
} from 'lucide-react';

interface JudgeDemoModeProps {
  onTriggerDemo: () => void;
  onNavigateTab: (tab: string) => void;
  hasTasks: boolean;
}

export default function JudgeDemoMode({
  onTriggerDemo,
  onNavigateTab,
  hasTasks
}: JudgeDemoModeProps) {
  
  const STEPS = [
    {
      num: '1',
      title: 'Hydrate Crisis Telemetry',
      actionText: 'Load Demo Crisis Data',
      desc: 'Injects a high-fidelity preset of approaching deadlines, overdue homeworks, energy meters, and note configurations directly into the storage state.',
      onClick: onTriggerDemo,
      isButton: true,
      activeIf: !hasTasks
    },
    {
      num: '2',
      title: 'Analyze Threat Matrix',
      actionText: 'View AI Prioritizations',
      desc: 'Opens the "AI Plan" screen to run the loaded context through Gemini. Review re-ranked list rankings, workload capacity evaluations, and focus suggestions.',
      onClick: () => onNavigateTab('plan'),
      isButton: false,
      activeIf: hasTasks
    },
    {
      num: '3',
      title: 'Run Focus Sprint',
      actionText: 'Activate Rescue Mode',
      desc: 'Navigate to Tasks and select "Rescue" on the critical submission task. Experience the Pomodoro focus sprint timer, micro checklists, and the emergency message boards.',
      onClick: () => onNavigateTab('tasks'),
      isButton: false,
      activeIf: hasTasks
    },
    {
      num: '4',
      title: 'Simulate Delay Recovery',
      actionText: 'Test "Running Late" Agent',
      desc: 'Navigate to "Delay Recovery", select a task shield, adjust sliders to simulate running late, and let the sub-agent compute critical-path scope reductions.',
      onClick: () => onNavigateTab('delay'),
      isButton: false,
      activeIf: hasTasks
    },
    {
      num: '5',
      title: 'Consult AI Coach',
      actionText: 'Access Tactical Advisor',
      desc: 'Open the "Productivity Coach" chat, select quick-action prompt chips, and analyze the context-aware, non-generic responses compiled by Gemini.',
      onClick: () => onNavigateTab('coach'),
      isButton: false,
      activeIf: hasTasks
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Intro header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-wider">Judge Walkthrough Mode</h2>
        <p className="text-slate-400 text-xs mt-0.5">Follow this 5-step master testing script to review the complete functional depth of our submission.</p>
      </div>

      {/* TUTORIAL TIMELINE CARD */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-6">
        
        <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-850 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-100">5-Step Master Evaluation Guide</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {STEPS.map((step, idx) => (
            <div 
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 relative transition duration-150 ${
                step.activeIf 
                  ? 'bg-indigo-950/15 border-indigo-500/30 ring-1 ring-indigo-500/10 shadow' 
                  : 'bg-slate-950/40 border-slate-850 opacity-65'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center border ${
                    step.activeIf ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    {step.num}
                  </span>
                  
                  {step.activeIf && (
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                  )}
                </div>

                <h4 className="text-xs font-black text-white uppercase tracking-wider">{step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{step.desc}</p>
              </div>

              {step.isButton ? (
                <button 
                  onClick={step.onClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2 rounded-lg text-[10px] uppercase tracking-wider transition active:scale-95 flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>{step.actionText}</span>
                </button>
              ) : (
                <button 
                  onClick={step.onClick}
                  className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider border border-slate-700/80 transition flex items-center justify-center space-x-0.5"
                >
                  <span>{step.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pro tip summary banner */}
        <div className="bg-indigo-950/10 border border-indigo-900/20 p-4 rounded-xl flex items-start space-x-3 text-xs text-slate-300">
          <Sparkles className="w-4.5 h-4.5 mt-0.5 text-indigo-400 shrink-0 animate-pulse" />
          <div className="space-y-1">
            <span className="font-extrabold text-indigo-400 uppercase tracking-widest text-[10px]">Evaluation Pro-Tip:</span>
            <p className="leading-relaxed font-medium">
              Deadline Defender AI represents a paradigm shift from passive scheduling widgets to an active, resilient cognitive companion. Try blocking out your focus and triggering "Rescue Mode" to preview how AI alleviates decision paralysis in real crisis conditions.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
