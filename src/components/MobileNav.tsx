import React from 'react';
import { Camera, Calendar, History, TrendingUp, Plus } from 'lucide-react';
import { TabType } from './Sidebar';

interface MobileNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenBookingModal: () => void;
  bookingBadgeCount?: number;
  showAsetTab?: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenBookingModal,
  bookingBadgeCount = 0,
  showAsetTab = true
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070D19]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {/* Katalog */}
      <button
        onClick={() => onSelectTab('peralatan')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
          currentTab === 'peralatan'
            ? 'text-[#E30000]'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Camera className="w-5 h-5" />
        <span>Katalog</span>
      </button>

      {/* Booking */}
      <button
        onClick={() => onSelectTab('booking')}
        className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
          currentTab === 'booking'
            ? 'text-[#E30000]'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span>Booking</span>
        {bookingBadgeCount > 0 && (
          <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#E30000] text-white text-[9px] font-bold flex items-center justify-center">
            {bookingBadgeCount}
          </span>
        )}
      </button>

      {/* Center Action + Button */}
      <button
        onClick={onOpenBookingModal}
        className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full bg-[#E30000] text-white shadow-lg shadow-red-500/40 hover:bg-[#DC2626] transition-transform active:scale-95 cursor-pointer"
        title="Booking Cepat"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Riwayat */}
      <button
        onClick={() => onSelectTab('riwayat')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
          currentTab === 'riwayat'
            ? 'text-[#E30000]'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <History className="w-5 h-5" />
        <span>Riwayat</span>
      </button>

      {/* Aset / Valuasi */}
      {showAsetTab && (
        <button
          onClick={() => onSelectTab('aset')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            currentTab === 'aset'
              ? 'text-[#E30000]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Aset</span>
        </button>
      )}
    </nav>
  );
};
