import React from 'react';
import { Box, Calendar, Clock, AlertTriangle } from 'lucide-react';

interface MetricCardsProps {
  totalAlat: number;
  totalBookingAktif: number;
  sedangDipinjam: number;
  perluPerhatian: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalAlat,
  totalBookingAktif,
  sedangDipinjam,
  perluPerhatian
}) => {
  const cards = [
    {
      title: 'Total Unit Alat',
      value: totalAlat,
      desc: 'Master inventaris aktif',
      icon: Box,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Booking Aktif',
      value: totalBookingAktif,
      desc: 'Paket dipesan & dipinjam',
      icon: Calendar,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Sedang di Lapangan',
      value: sedangDipinjam,
      desc: 'Alat keluar proyek',
      icon: Clock,
      color: 'text-[#E30000]',
      bgColor: 'bg-red-500/10 border-red-500/20'
    },
    {
      title: 'Perlu Perhatian',
      value: perluPerhatian,
      desc: 'Servis / rusak / hilang',
      icon: AlertTriangle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10 border-rose-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
                {c.title}
              </span>
              <div className={`p-2 rounded-xl border ${c.bgColor}`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {c.value}
            </div>
            <div className="text-[11.5px] font-medium text-slate-400 dark:text-slate-500 mt-1 truncate">
              {c.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
};
