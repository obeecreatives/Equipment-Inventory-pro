import React, { useMemo } from 'react';
import { DollarSign, PieChart, ShieldAlert, Award, History, CheckCircle2 } from 'lucide-react';
import { InventarisItem, StockOpnameRow } from '../types/inventory';
import { formatRupiah } from '../lib/dateUtils';

interface NilaiAsetTabProps {
  items: InventarisItem[];
  stockOpname: StockOpnameRow[];
}

export const NilaiAsetTab: React.FC<NilaiAsetTabProps> = ({ items, stockOpname }) => {
  const EXCLUDED_KONDISI = ['Rusak', 'Hilang', 'Dikeluarkan dari Aset'];

  const stats = useMemo(() => {
    const nilaiItem = (i: InventarisItem) => (Number(i.hargaPerolehan) || 0) * (Number(i.qtyTotal) || 0);
    const isExcluded = (i: InventarisItem) => EXCLUDED_KONDISI.includes(i.kondisiAlat);

    const activeItems = items.filter(i => !isExcluded(i));
    const excludedItems = items.filter(isExcluded);

    const totalAktif = activeItems.reduce((sum, i) => sum + nilaiItem(i), 0);
    const totalDikeluarkan = excludedItems.reduce((sum, i) => sum + nilaiItem(i), 0);

    // Nilai per kategori
    const perKategori: Record<string, { totalNilai: number; totalQty: number; count: number }> = {};
    activeItems.forEach(i => {
      const cat = i.kategori || 'Lainnya';
      if (!perKategori[cat]) perKategori[cat] = { totalNilai: 0, totalQty: 0, count: 0 };
      perKategori[cat].totalNilai += nilaiItem(i);
      perKategori[cat].totalQty += (Number(i.qtyTotal) || 0);
      perKategori[cat].count += 1;
    });

    // 10 Alat nilai tertinggi
    const top10 = [...activeItems]
      .map(i => ({ ...i, totalNilai: nilaiItem(i) }))
      .sort((a, b) => b.totalNilai - a.totalNilai)
      .slice(0, 10);

    return {
      totalAktif,
      totalDikeluarkan,
      perKategori,
      top10,
      excludedItems: excludedItems.map(i => ({ ...i, totalNilai: nilaiItem(i) }))
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Top Valuation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              Total Nilai Aset Aktif
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatRupiah(stats.totalAktif)}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Total akumulasi nilai perolehan seluruh peralatan dalam kondisi baik & operasional.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              Nilai Aset Dikeluarkan
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatRupiah(stats.totalDikeluarkan)}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Alat berkondisi Rusak, Hilang, atau Dikeluarkan dari Aset ({stats.excludedItems.length} item).
          </p>
        </div>
      </div>

      {/* Nilai per Kategori */}
      <div className="p-5 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-4 rounded-full bg-[#E30000]" />
          <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900 dark:text-white">
            Nilai Per Kategori (Aset Aktif)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(stats.perKategori)
            .sort((a, b) => stats.perKategori[b].totalNilai - stats.perKategori[a].totalNilai)
            .map(cat => {
              const data = stats.perKategori[cat];
              const percent = stats.totalAktif > 0 ? ((data.totalNilai / stats.totalAktif) * 100).toFixed(1) : '0';
              return (
                <div
                  key={cat}
                  className="p-3.5 rounded-xl border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-800/90 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{cat}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {percent}%
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(data.totalNilai)}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    {data.count} model alat ({data.totalQty} total unit)
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top 10 High-Value Equipment */}
      <div className="p-5 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900 dark:text-white">
            10 Alat Bernilai Tertinggi
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stats.top10.map((item, idx) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {item.namaBarang}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {item.kategori} • {item.qtyTotal} {item.satuan} @ {formatRupiah(item.hargaPerolehan)}
                  </div>
                </div>
              </div>
              <div className="font-black text-sm text-slate-900 dark:text-white shrink-0">
                {formatRupiah(item.totalNilai)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Excluded Items (if any) */}
      {stats.excludedItems.length > 0 && (
        <div className="p-5 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900 dark:text-white">
              Alat Dikeluarkan dari Perhitungan Aset ({stats.excludedItems.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.excludedItems.map(item => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {item.namaBarang}
                  </div>
                  <div className="text-slate-400">
                    Kondisi: <span className="font-bold text-rose-500">{item.kondisiAlat}</span> • {item.kategori}
                  </div>
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-mono">
                  {formatRupiah(item.totalNilai)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Opname Audit History */}
      {stockOpname && stockOpname.length > 0 && (
        <div className="p-5 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-blue-500" />
            <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900 dark:text-white">
              Riwayat Sesi Stock Opname ({stockOpname.length} log)
            </h3>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stockOpname.slice(0, 20).map(row => (
              <div
                key={row.id}
                className="p-3 rounded-xl border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{row.namaBarang}</div>
                  <div className="text-slate-400 text-[11px]">
                    {row.tanggalOpname} • PIC: {row.pic || 'Admin'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    Sistem: {row.qtySistem} | Fisik: {row.qtyAktual}
                  </div>
                  {row.selisih !== 0 && (
                    <span className="text-[10.5px] font-bold text-rose-500">
                      Selisih: {row.selisih > 0 ? `+${row.selisih}` : row.selisih}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
