import React, { Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application Crash Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0B0F17] text-white font-sans">
          <div className="max-w-md w-full p-6 rounded-2xl border border-red-500/40 bg-[#1E293B] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center font-bold text-xl">
                !
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Terjadi Kendala Tampilan</h2>
                <p className="text-xs text-slate-400">obeecreatives Equipment Hub</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 font-mono p-3 rounded-lg bg-black/40 border border-slate-700/60 break-words">
              {this.state.error?.message || 'Error tidak diketahui'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
