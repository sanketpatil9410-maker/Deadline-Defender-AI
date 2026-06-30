import React from 'react';
import { 
  Calendar, RefreshCw, Sparkles, Download, Clock, ShieldAlert, BadgeInfo, 
  Sun, Sunset, Moon, Coffee, CalendarCheck
} from 'lucide-react';
import { Task } from '../types/task';
import { exportPlanToICS } from '../utils/calendarExport';

interface WarRoomProps {
  tasks: Task[];
  warRoomText: string;
  loading: boolean;
  onGenerateWarRoom: () => void;
  apiSource?: 'gemini' | 'local_fallback';
}

export default function WarRoom({
  tasks,
  warRoomText,
  loading,
  onGenerateWarRoom,
  apiSource
}: WarRoomProps) {
  const pendingTasks = tasks.filter(t => t.status !== 'Completed');

  // Parse warRoomText into structured blocks for calendar export & rendering
  const parseWarRoomPlan = () => {
    if (!warRoomText) return [];

    // Split based on bullets or headers
    const blocks: Array<{ timeSlot: string; taskTitle: string; description: string; iconType: string }> = [];
    const sections = warRoomText.split(/(?=\🌅|🌅|\🌇|🌇|\🌆|🌆|\🌙|🌙|🌇|🌅|🌆|🌙|- \d{2}:\d{2}|\*\s*\d{2}:\d{2})/g);

    sections.forEach(sec => {
      const trimmed = sec.trim();
      if (!trimmed) return;

      // Extract slot name / time
      const lines = trimmed.split('\n');
      const headerLine = lines[0] || '';
      const bodyLines = lines.slice(1).map(l => l.trim().replace(/^[-*]\s*/, '')).filter(Boolean);

      // Simple icon type detection
      let iconType = 'day';
      if (headerLine.includes('🌅') || headerLine.toLowerCase().includes('morning')) iconType = 'morning';
      else if (headerLine.includes('🌇') || headerLine.toLowerCase().includes('afternoon') || headerLine.toLowerCase().includes('lunch')) iconType = 'afternoon';
      else if (headerLine.includes('🌆') || headerLine.toLowerCase().includes('evening') || headerLine.toLowerCase().includes('cleanup')) iconType = 'evening';
      else if (headerLine.includes('🌙') || headerLine.toLowerCase().includes('night') || headerLine.toLowerCase().includes('retreat')) iconType = 'night';

      // Parse time block using regex
      const timeMatch = headerLine.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      const timeSlot = timeMatch ? timeMatch[0] : '09:00 - 10:00'; // Default placeholder if not matches

      // Clean title line
      const taskTitle = headerLine.replace(/[🌅🌇🌆🌙|#\-*]/g, '').trim();

      blocks.push({
        timeSlot,
        taskTitle: taskTitle || 'Scheduled Work Block',
        description: bodyLines.join(' | ') || 'Focus session allocated by AI.',
        iconType
      });
    });

    return blocks;
  };

  const blocks = parseWarRoomPlan();

  const handleExportClick = () => {
    if (blocks.length === 0) {
      alert('Plan data is not initialized. Generate the War Room plan first.');
      return;
    }
    exportPlanToICS(blocks.map(b => ({
      timeSlot: b.timeSlot,
      taskTitle: b.taskTitle,
      description: b.description
    })));
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
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Today’s War Room</h2>
          <p className="text-slate-400 text-xs mt-0.5">Chronological timeline of hourly blocks allocated strategically to pending task shields.</p>
        </div>

        <div className="flex items-center space-x-2">
          {warRoomText && (
            <button 
              onClick={handleExportClick}
              className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700/80 transition duration-150 flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export to Calendar (.ics)</span>
            </button>
          )}

          <button 
            onClick={onGenerateWarRoom}
            disabled={loading || pendingTasks.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 disabled:border-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-950"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 animate-pulse" />
            )}
            <span>Regenerate War Room Plan</span>
          </button>
        </div>
      </div>

      {/* Connection Indicator */}
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
                ? '🔴 War Room Planner Online: Running dynamic chronological schedulers on gemini-3.5-flash.' 
                : '⚠️ Offline Fallback Active: Running fallback chronometer schedules based on task rankings.'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            {apiSource === 'gemini' ? 'AI Cloud' : 'Local Backup'}
          </span>
        </div>
      )}

      {/* CHRONOLOGICAL TIMELINE VIEW */}
      {loading ? (
        <div className="py-24 text-center bg-slate-900/20 border border-slate-800/60 rounded-2xl flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-300 text-sm">Chronology Recalibration in Progress...</h3>
            <p className="text-slate-500 text-xs">Distributing tasks across morning, afternoon, and evening performance slots.</p>
          </div>
        </div>
      ) : warRoomText ? (
        <div className="space-y-6">
          
          {/* TIMELINE TRACK */}
          <div className="relative border-l-2 border-indigo-900/40 ml-4 md:ml-6 pl-6 md:pl-8 space-y-6 pt-2 pb-4">
            
            {blocks.map((block, idx) => {
              // Icon selector
              let Icon = CalendarCheck;
              let iconColor = 'text-indigo-400 border-indigo-500/20 bg-indigo-950/20';

              if (block.iconType === 'morning') {
                Icon = Sun;
                iconColor = 'text-amber-400 border-amber-500/20 bg-amber-950/20';
              } else if (block.iconType === 'afternoon') {
                Icon = Coffee;
                iconColor = 'text-indigo-400 border-indigo-500/20 bg-indigo-950/20';
              } else if (block.iconType === 'evening') {
                Icon = Sunset;
                iconColor = 'text-purple-400 border-purple-500/20 bg-purple-950/20';
              } else if (block.iconType === 'night') {
                Icon = Moon;
                iconColor = 'text-rose-400 border-rose-500/20 bg-rose-950/20';
              }

              return (
                <div key={idx} className="relative group">
                  {/* Timeline bullet icon */}
                  <div className={`absolute -left-[45px] md:-left-[53px] top-0 w-9 h-9 rounded-xl border flex items-center justify-center transition group-hover:scale-105 ${iconColor}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  {/* Block Card Content */}
                  <div className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 p-5 rounded-xl space-y-2.5 transition duration-150 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-850 pb-2">
                      <span className="text-xs font-bold text-indigo-400 flex items-center space-x-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{block.timeSlot}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        Today's Sequence Block
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-white leading-snug">
                      {parseBoldText(block.taskTitle)}
                    </h4>

                    {block.description && (
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {parseBoldText(block.description)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      ) : (
        <div className="py-16 text-center bg-slate-900/20 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 opacity-60" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-300 text-sm">War Room Chronology Uninitialized</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              {pendingTasks.length === 0 
                ? 'Your active list is empty. Add task shields to allow chronological slot distribution.' 
                : 'Click "Regenerate War Room Plan" to format an hour-by-hour combat plan for today.'}
            </p>
          </div>
          {pendingTasks.length > 0 && (
            <button 
              onClick={onGenerateWarRoom}
              className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition active:scale-95 flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Generate Schedule</span>
            </button>
          )}
        </div>
      )}

    </div>
  );
}
