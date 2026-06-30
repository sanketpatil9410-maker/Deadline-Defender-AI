import React, { useEffect } from 'react';
import { Check, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-350 max-w-sm">
      {/* Icon Selector */}
      <div className={`p-1.5 rounded-lg border shrink-0 ${
        type === 'success' ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' :
        type === 'warning' ? 'bg-rose-500/15 border-rose-500/20 text-rose-400' :
        'bg-indigo-500/15 border-indigo-500/20 text-indigo-400'
      }`}>
        {type === 'success' && <Check className="w-4 h-4 stroke-[3]" />}
        {type === 'warning' && <AlertTriangle className="w-4 h-4" />}
        {type === 'info' && <Info className="w-4 h-4" />}
      </div>

      <p className="text-xs text-slate-200 font-semibold leading-relaxed pr-2">
        {message}
      </p>

      <button 
        onClick={onClose}
        className="p-1 hover:bg-slate-800 text-slate-500 hover:text-slate-300 rounded-lg transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
