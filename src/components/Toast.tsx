import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types/inventory';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
        let borderClass = 'border-emerald-500/30';
        let bgClass = 'bg-white dark:bg-[#1E293B]';

        if (t.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
          borderClass = 'border-rose-500/40';
        } else if (t.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
          borderClass = 'border-amber-500/40';
        } else if (t.type === 'info') {
          icon = <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />;
          borderClass = 'border-sky-500/40';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 ${bgClass} ${borderClass} animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              {t.title && <div className="font-bold mb-0.5">{t.title}</div>}
              <div className="leading-snug">{t.message}</div>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
