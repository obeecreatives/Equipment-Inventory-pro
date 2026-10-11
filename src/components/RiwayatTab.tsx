import React, { useState, useMemo } from 'react';
import { Search, Calendar, FileText, User, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { BookingGroup } from '../types/inventory';
import { formatTanggalRingkas, formatRentangTanggal, formatRupiah } from '../lib/dateUtils';

interface RiwayatTabProps {
  groups: BookingGroup[];
  onExportPdf: (group: BookingGroup) => void;
}

export const RiwayatTab: React.FC<RiwayatTabProps> = ({ groups, onExportPdf }) => {
  const [searchPeminjam, setSearchPeminjam] = useState('');
  const [searchAlat, setSearchAlat] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredHistory = useMemo(() => {
    return groups
      .filter(g => {
        if (searchPeminjam) {
          const q = searchPeminjam.toLowerCase();
          const nama = (g.kategoriPeminjam === 'Eksternal' ? g.namaPeminjamEksternal : g.dipesanOleh) || '';
          if (!nama.toLowerCase().includes(q)) return false;
        }

        if (searchAlat) {
          const q = searchAlat.toLowerCase();
          const match = g.items.some(i => i.namaBarang.toLowerCase().includes(q) || i.kategori.toLowerCase().includes(q));
          if (!match) return false;
        }

        if (dateFrom && g.tanggalPinjam < dateFrom) return false;
        if (dateTo && g.tanggalPinjam > dateTo) return false;

        return true;
      })
      .sort((a, b) => (b.tanggalPinjam || '').localeCompare(a.tanggalPinjam || ''));
  }, [groups, searchPeminjam, searchAlat, dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
            Nama Peminjam
          </label>
          <input
            type="text"
            value={searchPeminjam}
            onChange={e => setSearchPeminjam(e.target.value)}
            placeholder="Cari peminjam..."
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
            Nama Alat
          </label>
          <input
            type="text"
            value={searchAlat}
            onChange={e => setSearchAlat(e.target.value)}
            placeholder="Cari nama alat..."
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
            Dari Tanggal
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
          />
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tidak ada riwayat yang cocok</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sesuaikan filter pencarian nama peminjam, nama alat, atau rentang tanggal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(group => {
            const namaPeminjam = group.kategoriPeminjam === 'Eksternal' ? group.namaPeminjamEksternal : group.dipesanOleh;
            const isCompleted = group.status === 'Selesai';

            return (
              <div
                key={group.groupId}
                className="p-4 sm:p-5 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      isCompleted 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                        : group.status === 'Dibatalkan'
                        ? 'bg-rose-500/15 text-rose-600 border-rose-500/30'
                        : 'bg-blue-500/15 text-blue-600 border-blue-500/30'
                    }`}>
                      {group.status}
                    </span>
                    {group.nomorFormulir && (
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                        {group.nomorFormulir}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {formatRentangTanggal(group.tanggalPinjam, group.tanggalKembaliRencana)}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                    {group.untukProyek}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span>Peminjam: <strong className="text-slate-700 dark:text-slate-300">{namaPeminjam}</strong></span>
                    <span>•</span>
                    <span>{group.items.length} item ({group.items.map(i => i.namaBarang).join(', ')})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onExportPdf(group)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
