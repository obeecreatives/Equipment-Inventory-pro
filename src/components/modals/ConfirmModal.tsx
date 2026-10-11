import React, { useEffect } from 'react';
import { X, AlertTriangle, Trash2, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export interface ConfirmDialogOptions {
  headerText?: string; // Default: 'obeecreatives says'
  title?: string;
  message: string;
  subMessage?: string;
  confirmText?: string; // Default: 'Ya, Lanjutkan' or 'Ya, Hapus'
  cancelText?: string;  // Default: 'Batal'
  type?: 'danger' | 'warning' | 'info' | 'success';
  isAlertOnly?: boolean; // If true, only show OK button
}

interface ConfirmModalProps {
  isOpen: boolean;
  options: ConfirmDialogOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  options,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen || !options) return null;

  const headerText = options.headerText || 'obeecreatives says';
  const type = options.type || 'danger';
  const confirmText = options.confirmText || (type === 'danger' ? 'Ya, Hapus' : 'Ya, Lanjutkan');
  const cancelText = options.cancelText || 'Batal';

  const renderIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="w-5 h-5 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  const getIconWrapperClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      case 'info':
      default:
        return 'bg-sky-500/10 border-sky-500/20 text-sky-500';
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-[#E30000] hover:bg-[#DC2626] text-white shadow-red-500/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20';
      case 'info':
      default:
        return 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-150 animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header: Centered & Branded with "obeecreatives says" */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#1E293B]/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#E30000] flex items-center justify-center text-white font-extrabold text-[11px] shadow-xs shadow-red-500/20 leading-none">
              O
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {headerText}
            </span>
          </div>

          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border ${getIconWrapperClass()} shrink-0 mt-0.5`}>
            {renderIcon()}
          </div>

          <div className="flex-1 space-y-1.5">
            {options.title && (
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {options.title}
              </h4>
            )}
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {options.message}
            </p>
            {options.subMessage && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {options.subMessage}
              </p>
            )}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-[#1E293B]/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          {!options.isAlertOnly && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={`px-4.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
