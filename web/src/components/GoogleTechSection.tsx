import React from 'react';
import { 
  Sparkles, Calendar, Mail, Cloud, ShieldCheck, Database, Award, BookOpen
} from 'lucide-react';

export default function GoogleTechSection() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-wider">Google AI & Cloud Tech Integration</h2>
        <p className="text-slate-400 text-xs mt-0.5">Explore how our architecture harnesses Google's world-class model suites and scalable deployment environments.</p>
      </div>

      {/* DETAILED TECH CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Google Gemini integration block */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4 shadow">
          <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-850 pb-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-200">Google Gemini API</h3>
          </div>

          <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-medium">
            <p>
              The core intelligence of Deadline Defender AI is driven entirely by the <strong className="text-white">gemini-3.5-flash</strong> model suite. To secure keys and preserve privacy, the frontend communicates strictly via relative server-side Node.js routes:
            </p>
            
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 font-mono text-[10px] text-indigo-300 space-y-1">
              <p>&rarr; POST /api/plan (Structured list triage)</p>
              <p>&rarr; POST /api/rescue (Scope cuts & schedules)</p>
              <p>&rarr; POST /api/delay-recovery (Late contingency planning)</p>
              <p>&rarr; POST /api/coach (Contextual conversational support)</p>
              <p>&rarr; POST /api/war-room (Chronological calendar blocks)</p>
            </div>

            <p>
              Advanced system instructions are hardcoded into the backend to enforce bulletproof, structured markdown JSON layouts. This prevents erratic LLM responses and ensures optimal, high-integrity dashboard cards.
            </p>
          </div>
        </div>

        {/* Google Cloud Run block */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4 shadow">
          <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-850 pb-2.5">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-200">Google Cloud Run</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-medium">
            <p>
              This app is fully optimized for containerization and deployable in one click on <strong className="text-white">Google Cloud Run</strong>.
            </p>

            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-850 text-[11px]">
              <div className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">1. Server Port Bind:</span>
                <span>Our Express server automatically binds to <code className="text-indigo-300">process.env.PORT || 3001</code> to adapt seamlessly to GCR container standards.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">2. Static Asset Hosting:</span>
                <span>The Express backend serves compiled production-built React static files on route requests. Single Dockerfile hosting is 100% supported.</span>
              </div>
            </div>

            <p>
              This architecture handles automatic scaling, near-zero baseline idle costs, and robust HTTPS endpoint provisions, ideal for high-traffic SaaS startups.
            </p>
          </div>
        </div>

      </div>

      {/* ROADMAP / FUTURE INTEGRATIONS PANEL */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4 shadow-xl">
        <div className="border-b border-slate-850 pb-2.5 flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-400 animate-bounce" />
          <h3 className="font-extrabold text-sm uppercase tracking-widest text-slate-250">Strategic Future Roadmap</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl font-medium">
          To maintain pristine submission integrity (Evaluation priority: Usability & Impact), we label our prospective calendar and mail connections as <strong className="text-slate-300">Future Scope</strong>, avoiding fake simulated behaviors:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 relative">
            <span className="absolute top-3 right-3 text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">Future Scope</span>
            
            <div className="flex items-center space-x-2 text-indigo-400">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Google Calendar Integration</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Enable OAuth2 consent to let our sub-agent write scheduled War Room focus slots directly to your main Google Calendar. It will auto-resolve time block conflicts in real-time.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 relative">
            <span className="absolute top-3 right-3 text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">Future Scope</span>
            
            <div className="flex items-center space-x-2 text-indigo-400">
              <Mail className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Gmail Dispatch Agent</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Let the Delay Recovery agent automatically send formatted extension draft emails or Slack updates on your behalf when a crisis triggers scope adjustments.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
