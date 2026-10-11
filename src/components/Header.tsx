import React, { useState } from 'react';
import { 
  RefreshCw, 
  Sun, 
  Moon, 
  Layers, 
  Server, 
  HelpCircle, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Role, SWITCH_APPS } from '../types/inventory';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  isSyncing: boolean;
  autoSync: boolean;
  onToggleAutoSync: () => void;
  onManualRefresh: () => void;
  lastSyncTime: string | null;
  gasConnected: boolean;
  onOpenGasCenter: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  theme,
  onThemeToggle,
  isSyncing,
  autoSync,
  onToggleAutoSync,
  onManualRefresh,
  lastSyncTime,
  gasConnected,
  onOpenGasCenter,
  onOpenHelp
}) => {
  const [showSwitchApp, setShowSwitchApp] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { role: Role; label: string; colorClass: string }[] = [
    { role: 'Project Manager', label: 'Project Manager', colorClass: 'bg-red-500/15 text-red-500 border-red-500/30' },
    { role: 'Site Engineer', label: 'Site Engineer', colorClass: 'bg-red-500/15 text-red-500 border-red-500/30' },
    { role: 'Admin', label: 'Admin', colorClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
    { role: 'Staff', label: 'Staff / Creator', colorClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
    { role: 'Client', label: 'Client (Read-Only)', colorClass: 'bg-purple-500/15 text-purple-500 border-purple-500/30' }
  ];

  const currentRoleConfig = roles.find(r => r.role === currentRole) || roles[0];

  return (
    <header className="w-full sticky top-0 z-40 border-b transition-colors duration-200 bg-white dark:bg-[#070D19] border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        {/* Brand & Workspace OS label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E30000] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-red-500/20">
              O
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">obee</span>
                <span className="font-extrabold text-xl tracking-tight text-[#E30000]">creatives</span>
              </div>
              <div className="text-[10.5px] font-semibold tracking-wider text-[#38BDF8] flex items-center gap-1.5 uppercase mt-0.5">
                <span>EQUIPMENT HUB</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400">WORKSPACE OS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & RBAC */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap ml-auto">
          {/* RBAC Role Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${currentRoleConfig.colorClass}`}
              title="Ganti Peran Pengguna (RBAC)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentRole}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showRoleMenu && (
              <div 
                className="absolute right-0 mt-1.5 w-52 rounded-xl p-1.5 shadow-xl border z-50 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-1"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Hak Akses (Role Selector)
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => onRoleChange(r.role)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      currentRole === r.role 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{r.label}</span>
                    {currentRole === r.role && <div className="w-1.5 h-1.5 rounded-full bg-[#E30000]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto-Sync & Manual Refresh Indicator */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 overflow-hidden text-xs">
            <button
              onClick={onManualRefresh}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors font-medium"
              title={lastSyncTime ? `Terakhir sync: ${lastSyncTime}. Klik untuk refresh manual.` : 'Refresh data'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || autoSync ? 'text-[#38BDF8] animate-spin-slow' : 'text-slate-500'}`} />
              <span className="hidden md:inline">{isSyncing ? 'Sinkron...' : 'Sync'}</span>
            </button>
            <button
              onClick={onToggleAutoSync}
              className={`px-2 py-1.5 border-l border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors ${
                autoSync 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={autoSync ? 'Auto-sync aktif (logo terus berputar)' : 'Auto-sync nonaktif'}
            >
              AUTO
            </button>
          </div>

          {/* Headless GAS Center Trigger */}
          <button
            onClick={onOpenGasCenter}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              gasConnected 
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20' 
                : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
            title="Pengaturan Endpoint Headless GAS REST API"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GAS Center</span>
            <div className={`w-2 h-2 rounded-full ${gasConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>

          {/* Switch App Suite Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchApp(!showSwitchApp)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Pindah ke Aplikasi obeeTOOLS Lainnya"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showSwitchApp && (
              <div 
                className="absolute right-0 mt-1.5 w-56 rounded-xl p-2 shadow-xl border z-50 bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-1"
                onClick={() => setShowSwitchApp(false)}
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  obeeTOOLS Workspace Suite
                </div>
                {SWITCH_APPS.map(app => (
                  <a
                    key={app.name}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span>{app.name}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#38BDF8]" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Ganti ke Mode Terang (Crisp Studio White)' : 'Ganti ke Mode Gelap (Deep Obsidian)'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Panduan & Bantuan Penggunaan"
          >
            <HelpCircle className="w-4 h-4 text-[#E30000]" />
          </button>
        </div>
      </div>
    </header>
  );
};
