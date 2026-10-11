import React, { useState } from 'react';
import { X, CheckSquare, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { InventarisItem } from '../../types/inventory';

interface StockOpnameModalProps {
  inventaris: InventarisItem[];
  onClose: () => void;
  onSubmitOpname: (
    pic: string,
    items: Array<{
      itemId: string;
      namaBarang: string;
      kategori: string;
      qtySistem: number;
      qtyAktual: number;
      catatan: string;
      terapkan: boolean;
    }>
  ) => void;
}

export const StockOpnameModal: React.FC<StockOpnameModalProps> = ({
  inventaris,
  onClose,
  onSubmitOpname
}) => {
  const [pic, setPic] = useState('Admin Studio');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Array<{
    itemId: string;
    namaBarang: string;
    kategori: string;
    qtySistem: number;
    qtyAktual: number;
    catatan: string;
    terapkan: boolean;
    checked: boolean;
  }>>(
    inventaris.map(i => ({
      itemId: i.id,
      namaBarang: i.namaBarang,
      kategori: i.kategori,
      qtySistem: Number(i.qtyTotal) || 0,
      qtyAktual: Number(i.qtyTotal) || 0,
      catatan: '',
      terapkan: true,
      checked: false
    }))
  );

  const updateRow = (idx: number, field: string, val: any) => {
    setRows(prev => prev.map((r, i) => {
      if (i === idx) {
        return { ...r, [field]: val, checked: true };
      }
      return r;
    }));
  };

  const filteredRows = rows
    .map((r, originalIdx) => ({ ...r, originalIdx }))
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase().trim();
      return String(r.namaBarang || '').toLowerCase().includes(q) || String(r.kategori || '').toLowerCase().includes(q);
    });

  const totalDicek = rows.filter(r => r.checked).length;
  const totalSelisih = rows.filter(r => r.checked && r.qtyAktual !== r.qtySistem).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checkedRows = rows.filter(r => r.checked);
    if (checkedRows.length === 0 || !pic.trim()) return;

    onSubmitOpname(pic, checkedRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Stock Opname Fisik Alat</h3>
              <p className="text-xs text-slate-400">Verifikasi fisik & sinkronisasi jumlah unit aktual di gudang studio.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Petugas PIC Opname *
              </label>
              <input
                type="text"
                required
                value={pic}
                onChange={e => setPic(e.target.value)}
                placeholder="Nama pemeriksa fisik alat"
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Cari Alat Cepat
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Ketik nama alat..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                />
              </div>
            </div>
          </div>

          {/* Opname Stats Bar */}
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              Dicek: <strong className="text-slate-900 dark:text-white">{totalDicek}</strong> dari {rows.length} alat
            </span>
            <span className={totalSelisih > 0 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-medium'}>
              {totalSelisih > 0 ? `⚠ Ada ${totalSelisih} selisih fisik!` : 'Semua hitungan klop'}
            </span>
          </div>

          {/* Rows List */}
          <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
            {filteredRows.map(r => {
              const diff = r.qtyAktual - r.qtySistem;
              const hasDiff = r.checked && diff !== 0;

              return (
                <div
                  key={r.itemId}
                  className={`p-3 rounded-xl border transition-all ${
                    hasDiff
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : r.checked
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800'
                  } flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {r.namaBarang}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {r.kategori} • Sistem: <strong className="text-slate-700 dark:text-slate-300">{r.qtySistem}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Fisik:</span>
                      <input
                        type="number"
                        min={0}
                        value={r.qtyAktual}
                        onChange={e => updateRow(r.originalIdx, 'qtyAktual', parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 rounded-lg text-xs font-bold text-center border bg-white dark:bg-[#0F172A] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <input
                      type="text"
                      value={r.catatan}
                      onChange={e => updateRow(r.originalIdx, 'catatan', e.target.value)}
                      placeholder="Catatan fisik..."
                      className="w-36 sm:w-44 px-2.5 py-1 rounded-lg text-xs border bg-white dark:bg-[#0F172A] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />

                    {diff !== 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-500 text-white shrink-0">
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50 dark:bg-[#070D19]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={totalDicek === 0}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Simpan Sesi Opname ({totalDicek} dicek)
          </button>
        </div>
      </div>
    </div>
  );
};
