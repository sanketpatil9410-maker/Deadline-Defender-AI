import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Sparkles, RefreshCw, MessageSquare, Flame, Lightbulb, 
  Trash2, ShieldCheck, HelpCircle, BadgeInfo, Zap, Clock
} from 'lucide-react';
import { Task, Message } from '../types/task';

interface ProductivityCoachProps {
  tasks: Task[];
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  apiSource?: 'gemini' | 'local_fallback';
}

const PROMPT_CHIPS = [
  'What should I do first?',
  'I have only 2 hours, help me.',
  'I am stressed, simplify my plan.',
  'Which task can I delay?',
  'Create a 25-minute sprint.',
  'Make a message to request extension.',
  'Give me a no-excuse plan.',
  'Turn my tasks into a study plan.',
  'What should I skip?'
] as const;

export default function ProductivityCoach({
  tasks,
  messages,
  loading,
  onSendMessage,
  onClearChat,
  apiSource
}: ProductivityCoachProps) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;

  useEffect(() => {
    // Scroll to bottom whenever messages list updates
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleChipClick = (chip: string) => {
    if (loading) return;
    onSendMessage(chip);
  };

  // Parsing markdown formatting inside coach bubble
  const formatCoachText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5"></div>;

          if (trimmed.startsWith('###')) {
            return (
              <h5 key={idx} className="font-extrabold text-indigo-400 pt-2 pb-0.5 uppercase tracking-wider text-[11px] border-b border-slate-800/80">
                {trimmed.replace('###', '').trim()}
              </h5>
            );
          }
          if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
            return (
              <h4 key={idx} className="font-black text-indigo-400 pt-3 pb-1 text-xs">
                {trimmed.replace(/^#+\s*/, '').trim()}
              </h4>
            );
          }
          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            return (
              <div key={idx} className="flex items-start pl-3 py-0.5">
                <span className="w-1.5 h-1.5 mt-1.5 mr-2 rounded-full bg-indigo-500 shrink-0"></span>
                <span>{parseBoldContent(trimmed.replace(/^[-*]\s*/, ''))}</span>
              </div>
            );
          }
          return <p key={idx}>{parseBoldContent(trimmed)}</p>;
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

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Tactical AI Coach</h2>
          <p className="text-slate-400 text-xs mt-0.5">Direct, non-generic, actionable advice aware of your active task context and deadline profiles.</p>
        </div>

        <button 
          onClick={onClearChat}
          className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl transition flex items-center space-x-1"
          title="Clear Context History"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-xs font-bold px-1">Clear Chat</span>
        </button>
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
                ? '🔴 Coach Online: Using Process Prompts on gemini-3.5-flash with real-time active task structures.' 
                : '⚠️ Coach Offline: Local rule-based coaching loops active due to API connection state.'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500">
            {apiSource === 'gemini' ? 'AI Cloud' : 'Local Backup'}
          </span>
        </div>
      )}

      {/* THREE MODULE CHAT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: Chat container */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px] shadow-xl">
          
          {/* Chat header context block */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Coach Feed Active</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
              Payload: {pendingCount} Pending Tasks
            </span>
          </div>

          {/* Chat message list area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => {
              const isCoach = msg.sender === 'coach';
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start space-x-3 max-w-[85%] ${
                    isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse space-x-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isCoach 
                      ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' 
                      : 'bg-slate-850 border-slate-700 text-slate-300'
                  }`}>
                    {isCoach ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble content */}
                  <div className={`p-4 rounded-2xl space-y-1 ${
                    isCoach 
                      ? 'bg-slate-900 border border-slate-850 text-slate-200 rounded-tl-none' 
                      : 'bg-indigo-600 text-white rounded-tr-none shadow shadow-indigo-950'
                  }`}>
                    {isCoach ? (
                      formatCoachText(msg.text)
                    ) : (
                      <p className="text-xs leading-relaxed font-semibold">{msg.text}</p>
                    )}
                    <span className={`text-[9px] block text-right pt-1 opacity-55 ${
                      isCoach ? 'text-slate-500' : 'text-slate-100'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>

                </div>
              );
            })}

            {/* Coach typing loader */}
            {loading && (
              <div className="flex items-start space-x-3 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-850 text-slate-400 p-4 rounded-2xl rounded-tl-none flex items-center space-x-1.5 text-xs font-semibold shadow animate-pulse">
                  <span>Coach is weighing deadline matrices...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Chat Input panel */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input 
                type="text" 
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your coach anything (e.g. 'How do I start on my hackathon project?')..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-600 disabled:border-slate-800 text-white font-bold text-xs px-4 rounded-xl transition duration-150 flex items-center justify-center shrink-0 shadow shadow-indigo-950"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COMPONENT: Action Prompt Chips */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800/80 pb-2 flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">Coach Fast Commands</h4>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Click any prompt chip to feed your active context directly into the AI coach.
          </p>

          <div className="flex flex-col gap-2 pt-1">
            {PROMPT_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip)}
                disabled={loading}
                className="text-left bg-slate-950/50 hover:bg-indigo-950/15 border border-slate-850 hover:border-indigo-900/30 p-2.5 rounded-xl text-xs text-slate-300 font-semibold transition flex items-center justify-between group disabled:opacity-50"
              >
                <span>{chip}</span>
                <Zap className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition" />
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
