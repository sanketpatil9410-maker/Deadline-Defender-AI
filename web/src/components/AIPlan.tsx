import React from 'react';
import { 
  Sparkles, ListCollapse, Play, RefreshCw, Calendar, ShieldCheck, 
  Clock, AlertTriangle, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { Task } from '../types/task';

interface AIPlanProps {
  tasks: Task[];
  planText: string;
  loading: boolean;
  onGeneratePlan: () => void;
  apiSource?: 'gemini' | 'local_fallback';
}

export default function AIPlan({
  tasks,
  planText,
  loading,
  onGeneratePlan,
  apiSource
}: AIPlanProps) {
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');

  // Parse markdown content line-by-line into structured cards
  const renderPlanBlocks = () => {
    if (!planText) return null;

    // Split text into major sections starting with ### or ##
    const sections = planText.split(/(?=### |## )/g);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const lines = section.trim().split('\n');
          const headingLine = lines[0] || '';
          const bodyLines = lines.slice(1);

          // Clean heading text
          const headingText = headingLine.replace(/###|##/g, '').trim();
          if (!headingText) return null;

          // Detect accent colors based on heading topic
          let headingColor = 'text-indigo-400 border-indigo-500/20';
          let bgAccent = 'bg-indigo-950/10';
          if (headingText.toLowerCase().includes('high-risk') || headingText.toLowerCase().includes('threat') || headingText.toLowerCase().includes('emergency')) {
            headingColor = 'text-rose-400 border-rose-500/20';
            bgAccent = 'bg-rose-950/10';
          } else if (headingText.toLowerCase().includes('triage') || headingText.toLowerCase().includes('queue') || headingText.toLowerCase().includes('order')) {
            headingColor = 'text-amber-400 border-amber-500/20';
            bgAccent = 'bg-amber-950/10';
          } else if (headingText.toLowerCase().includes('schedule') || headingText.toLowerCase().includes('hour-by-hour') || headingText.toLowerCase().includes('time')) {
            headingColor = 'text-purple-400 border-purple-500/20';
            bgAccent = 'bg-purple-950/10';
          } else if (headingText.toLowerCase().includes('buffer') || headingText.toLowerCase().includes('skip') || headingText.toLowerCase().includes('defense')) {
            headingColor = 'text-emerald-400 border-emerald-500/20';
            bgAccent = 'bg-emerald-950/10';
          }

          return (
            <div 
              key={index} 
              className={`border border-slate-800 rounded-xl p-5 ${bgAccent} shadow-xl flex flex-col justify-between space-y-4`}
            >
              <div>
                <h3 className={`text-sm font-black uppercase tracking-widest pb-2 border-b border-slate-800/80 mb-3 ${headingColor}`}>
                  {headingText}
                </h3>
                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                  {bodyLines.map((line, lIdx) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;

                    // Bullet render
                    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                      const cleanLine = trimmedLine.replace(/^[-*]\s*/, '');
                      return (
                        <div key={lIdx} className="flex items-start pl-3 py-0.5">
                          <span className="w-1.5 h-1.5 mt-1.5 mr-2 rounded-full bg-indigo-400 shrink-0"></span>
                          <span>{parseBoldText(cleanLine)}</span>
                        </div>
                      );
                    }
                    
                    // Paragraph render
                    return <p key={lIdx}>{parseBoldText(trimmedLine)}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const parseBoldText = (str: string) => {
    const parts = str.split('**');
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold text-slate-100">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">AI Prioritization & Plan</h2>
          <p className="text-slate-400 text-xs mt-0.5">Gemini analyzes deadline metrics, risk profiles, and energy scales to formulate tactical order.</p>
        </div>

        <button 
          onClick={onGeneratePlan}
          disabled={loading || pendingTasks.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 disabled:border-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-950/40"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 animate-pulse" />
          )}
          <span>Regenerate Tactical AI Plan</span>
        </button>
      </div>

      {/* Connection Indicator & Warnings */}
      {apiSource && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          apiSource === 'gemini' 
            ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300' 
            : 'bg-amber-950/20 border-amber-900/40 text-amber-400'
        }`}>
          <div className="flex items-center space-x-2">
            <BadgeInfo className="w-4 h-4 shrink-0" />
            <span>
              {apiSource === 'gemini' 
                ? '🟢 Active Pipeline Connected: Structured insights analyzed server-side with gemini-3.5-flash.' 
                : '⚠️ Offline Fallback Mode: Rules-based local calculation engine formulated the schedule blocks.'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            {apiSource === 'gemini' ? 'AI Cloud' : 'Local Backup'}
          </span>
        </div>
      )}

      {/* Unrealistic workload warning */}
      {pendingTasks.length > 4 && (
        <div className="bg-rose-950/25 border border-rose-900/30 rounded-xl p-4 flex items-start space-x-3 text-xs text-rose-300">
          <AlertTriangle className="w-4.5 h-4.5 mt-0.5 text-rose-400 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-200 uppercase tracking-wider">Unrealistic Workload Warning</h4>
            <p>
              You have {pendingTasks.length} pending task shields requiring action today. This exceeds the sustainable cognitive capacity of a high-performance deep-work block (limit: 3-4 items). System recommends prioritizing scope compression (cutting details) on at least two flexible items.
            </p>
          </div>
        </div>
      )}

      {/* Main Content State */}
      {loading ? (
        <div className="py-20 text-center bg-slate-900/20 border border-slate-800/60 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-300 text-sm">Formulating Action Blocks...</h3>
            <p className="text-slate-500 text-xs">Gemini is weighting deadlines and parsing critical dependencies.</p>
          </div>
        </div>
      ) : planText ? (
        <div className="space-y-6">
          {renderPlanBlocks()}
        </div>
      ) : (
        <div className="py-16 text-center bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-600 opacity-60" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-300 text-sm">Tactical Plan Uninitialized</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              {pendingTasks.length === 0 
                ? 'Your active list is clear. Insert task shields to populate dynamic planning metrics.' 
                : 'Click "Regenerate Tactical AI Plan" to run your active context through Gemini and structure your focus blocks.'}
            </p>
          </div>
          {pendingTasks.length > 0 && (
            <button 
              onClick={onGeneratePlan}
              className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition active:scale-95 flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Generate Now</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
