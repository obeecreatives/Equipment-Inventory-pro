import React, { useState } from 'react';
import { X, CheckCircle2, UserCheck, Package } from 'lucide-react';
import { BookingGroup } from '../../types/inventory';

interface CheckoutModalProps {
  group: BookingGroup;
  onClose: () => void;
  onSubmitCheckout: (groupId: string, picMengeluarkan: string, picMembawa: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  group,
  onClose,
  onSubmitCheckout
}) => {
  const [picMengeluarkan, setPicMengeluarkan] = useState('Admin Studio');
  const [picMembawa, setPicMembawa] = useState(group.dipesanOleh || group.namaPeminjamEksternal || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picMengeluarkan.trim() || !picMembawa.trim()) return;
    onSubmitCheckout(group.groupId, picMengeluarkan, picMembawa);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E30000] text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Serah Terima / Checkout</h3>
              <p className="text-xs text-slate-400">Pelepasan paket alat ({group.items.length} item) ke lapangan.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Info */}
          <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
              {group.untukProyek}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {group.items.map(i => `${i.namaBarang} (${i.qty})`).join(', ')}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              PIC Yang Mengeluarkan (Petugas Studio) *
            </label>
            <input
              type="text"
              required
              value={picMengeluarkan}
              onChange={e => setPicMengeluarkan(e.target.value)}
              placeholder="Nama staff yang menyerahkan alat"
              className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              PIC Yang Membawa / Menerima (Kru Lapangan) *
            </label>
            <input
              type="text"
              required
              value={picMembawa}
              onChange={e => setPicMembawa(e.target.value)}
              placeholder="Nama personil yang membawa alat"
              className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 cursor-pointer"
            >
              Konfirmasi Checkout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
