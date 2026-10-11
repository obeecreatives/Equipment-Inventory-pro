import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BookingGroup, KondisiKembali } from '../../types/inventory';

interface ReturnModalProps {
  group: BookingGroup;
  onClose: () => void;
  onSubmitReturn: (
    groupId: string,
    itemUpdates: Array<{ id: string; kondisiKembali: KondisiKembali; catatanKembali: string }>,
    picMenerima: string
  ) => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  group,
  onClose,
  onSubmitReturn
}) => {
  const [picMenerima, setPicMenerima] = useState('Admin Studio');
  const [checks, setChecks] = useState<Array<{
    id: string;
    namaBarang: string;
    qty: number;
    kondisiKembali: KondisiKembali | '';
    catatanKembali: string;
  }>>(
    group.items.map(it => ({
      id: it.id,
      namaBarang: it.namaBarang,
      qty: it.qty,
      kondisiKembali: 'Baik',
      catatanKembali: ''
    }))
  );

  const updateCheck = (idx: number, field: 'kondisiKembali' | 'catatanKembali', val: any) => {
    setChecks(prev => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  };

  const allChecked = checks.every(c => c.kondisiKembali !== '');
  const hasDamaged = checks.some(c => c.kondisiKembali === 'Rusak' || c.kondisiKembali === 'Hilang');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked || !picMenerima.trim()) return;

    const updates = checks.map(c => ({
      id: c.id,
      kondisiKembali: (c.kondisiKembali || 'Baik') as KondisiKembali,
      catatanKembali: c.catatanKembali
    }));

    onSubmitReturn(group.groupId, updates, picMenerima);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Pengembalian Alat</h3>
              <p className="text-xs text-slate-400">Pemeriksaan fisik setiap unit alat sebelum masuk studio.</p>
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
          <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-800">
            <div className="font-bold text-sm text-slate-900 dark:text-white">
              {group.untukProyek}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Peminjam: {group.dipesanOleh || group.namaPeminjamEksternal} ({group.kategoriPeminjam})
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Petugas Penerima (PIC Studio) *
            </label>
            <input
              type="text"
              required
              value={picMenerima}
              onChange={e => setPicMenerima(e.target.value)}
              placeholder="Nama staff yang menerima alat kembali"
              className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
            />
          </div>

          {/* Item by Item Inspection List */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Inspeksi Kondisi Fisik Tiap Unit ({checks.length} item)
            </label>

            {checks.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {item.namaBarang}
                  </span>
                  <span className="text-xs font-extrabold text-[#E30000] bg-red-500/10 px-2 py-0.5 rounded-md">
                    Qty: {item.qty}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={item.kondisiKembali}
                    onChange={e => updateCheck(idx, 'kondisiKembali', e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                  >
                    <option value="Baik">Kondisi: Baik (Lengkap & Normal)</option>
                    <option value="Rusak">Kondisi: Rusak (Perlu Servis)</option>
                    <option value="Hilang">Kondisi: Hilang (Ganti Rugi)</option>
                  </select>

                  <input
                    type="text"
                    value={item.catatanKembali}
                    onChange={e => updateCheck(idx, 'catatanKembali', e.target.value)}
                    placeholder="Catatan kondisi (opsional)..."
                    className="px-3 py-1.5 rounded-lg text-xs border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                  />
                </div>
              </div>
            ))}
          </div>

          {hasDamaged && (
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Alat yang dilaporkan Rusak/Hilang akan otomatis diperbarui statusnya di katalog master.
              </span>
            </div>
          )}
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
            disabled={!allChecked}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Selesaikan Pengembalian
          </button>
        </div>
      </div>
    </div>
  );
};
