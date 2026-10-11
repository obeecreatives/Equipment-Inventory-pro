import React from 'react';
import { 
  Camera, 
  Calendar, 
  History, 
  TrendingUp, 
  CheckSquare, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle,
  Plus
} from 'lucide-react';
import { Role } from '../types/inventory';

export type TabType = 'peralatan' | 'booking' | 'riwayat' | 'aset';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  currentRole: Role;
  onOpenBookingModal: () => void;
  onOpenItemModal: () => void;
  onOpenOpnameModal: () => void;
  onOpenUserModal: () => void;
  bookingBadgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapsed,
  currentRole,
  onOpenBookingModal,
  onOpenItemModal,
  onOpenOpnameModal,
  onOpenUserModal,
  bookingBadgeCount = 0
}) => {
  const isAdminOrPM = currentRole === 'Admin' || currentRole === 'Project Manager' || currentRole === 'Site Engineer';
  const isAdminOnly = currentRole === 'Admin';

  const menuItems = [
    { id: 'peralatan' as TabType, label: 'Katalog Alat', icon: Camera },
    { id: 'booking' as TabType, label: 'Booking & Paket', icon: Calendar, badge: bookingBadgeCount },
    { id: 'riwayat' as TabType, label: 'Riwayat Pinjam', icon: History },
    ...(isAdminOrPM ? [{ id: 'aset' as TabType, label: 'Valuasi Aset', icon: TrendingUp }] : [])
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r transition-all duration-200 bg-white dark:bg-[#070D19] border-slate-200 dark:border-slate-800 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] self-start z-30 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header with Collapse Toggle */}
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        {!collapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
            Menu Navigasi
          </span>
        )}
        <button
          onClick={onToggleCollapsed}
          className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            collapsed ? 'w-full flex items-center justify-center' : 'ml-auto'
          }`}
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={onOpenBookingModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white font-semibold text-sm shadow-md shadow-red-500/20 transition-all cursor-pointer"
          title="Booking Peralatan Baru"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Booking Alat</span>}
        </button>

        {isAdminOrPM && !collapsed && (
          <button
            onClick={onOpenItemModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
            title="Tambah Alat ke Inventaris"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Alat</span>
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#E30000] text-white shadow-sm shadow-red-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-[#E30000]' : 'bg-red-500/15 text-red-500 dark:text-red-400'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}

        {/* Admin Tools Section */}
        {isAdminOrPM && (
          <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800/80">
            {!collapsed && (
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Fitur Manajemen
              </div>
            )}

            <button
              onClick={onOpenOpnameModal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Stock Opname Fisik Alat"
            >
              <CheckSquare className="w-4 h-4 shrink-0 text-emerald-500" />
              {!collapsed && <span className="truncate">Stock Opname</span>}
            </button>

            {isAdminOnly && (
              <button
                onClick={onOpenUserModal}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Kelola Hak Akses Pengguna"
              >
                <Users className="w-4 h-4 shrink-0 text-amber-500" />
                {!collapsed && <span className="truncate">Kelola Akses</span>}
              </button>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};
