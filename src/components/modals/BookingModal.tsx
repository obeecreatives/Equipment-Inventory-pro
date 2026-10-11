import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, Calendar, User, Phone, Layers } from 'lucide-react';
import { InventarisItem, BookingItem, Role, StatusBiaya, KategoriPeminjam } from '../../types/inventory';
import { getTodayString, getFutureDateString, formatRupiah } from '../../lib/dateUtils';
import { EquipmentCombobox } from '../EquipmentCombobox';

interface BookingModalProps {
  presetItem: InventarisItem | null;
  inventaris: InventarisItem[];
  bookings: BookingItem[];
  currentRole: Role;
  onClose: () => void;
  onSubmitBatch: (sharedData: any, items: { itemId: string; namaBarang: string; kategori: string; qty: number }[]) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  presetItem,
  inventaris,
  bookings,
  currentRole,
  onClose,
  onSubmitBatch
}) => {
  const [tanggalPinjam, setTanggalPinjam] = useState<string>(getTodayString());
  const [tanggalKembaliRencana, setTanggalKembaliRencana] = useState<string>(getFutureDateString(2));
  const [untukProyek, setUntukProyek] = useState<string>('');
  const [dipesanOleh, setDipesanOleh] = useState<string>('');
  const [kategoriPeminjam, setKategoriPeminjam] = useState<KategoriPeminjam>('Tim Internal');
  const [namaPeminjamEksternal, setNamaPeminjamEksternal] = useState<string>('');
  const [kontakPeminjam, setKontakPeminjam] = useState<string>('');
  const [noKtp, setNoKtp] = useState<string>('');
  const [statusBiaya, setStatusBiaya] = useState<StatusBiaya>('Free Charge');

  // Multi-item list
  const [itemRows, setItemRows] = useState<Array<{
    itemId: string;
    qty: number;
    availabilityChecked?: boolean;
    available?: boolean;
    sisa?: number;
  }>>([
    {
      itemId: presetItem ? presetItem.id : (inventaris[0]?.id || ''),
      qty: 1
    }
  ]);

  const showFinancials = currentRole === 'Admin' || currentRole === 'Project Manager' || currentRole === 'Site Engineer';

  // Autocomplete staff list from past bookings
  const staffOptions = useMemo(() => {
    return Array.from(new Set(bookings.map(b => b.dipesanOleh).filter(Boolean))).sort();
  }, [bookings]);

  // Autocomplete external borrowers
  const externalBorrowers = useMemo(() => {
    const map: Record<string, { kontak: string; noKtp: string }> = {};
    bookings.forEach(b => {
      if (b.kategoriPeminjam === 'Eksternal' && b.namaPeminjamEksternal) {
        map[b.namaPeminjamEksternal] = { kontak: b.kontakPeminjam, noKtp: b.noKtp };
      }
    });
    return map;
  }, [bookings]);

  const handleExternalNameChange = (val: string) => {
    setNamaPeminjamEksternal(val);
    if (externalBorrowers[val]) {
      setKontakPeminjam(externalBorrowers[val].kontak || '');
      setNoKtp(externalBorrowers[val].noKtp || '');
    }
  };

  const addItemRow = () => {
    const nextItem = inventaris.find(i => !itemRows.some(r => r.itemId === i.id)) || inventaris[0];
    setItemRows(prev => [...prev, { itemId: nextItem?.id || '', qty: 1 }]);
  };

  const removeItemRow = (idx: number) => {
    if (itemRows.length <= 1) return;
    setItemRows(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: 'itemId' | 'qty', val: any) => {
    setItemRows(prev => prev.map((r, i) => {
      if (i === idx) {
        return { ...r, [field]: val, availabilityChecked: false };
      }
      return r;
    }));
  };

  // Check availability logic
  const checkAvailability = () => {
    const updated = itemRows.map(row => {
      const targetItem = inventaris.find(i => i.id === row.itemId);
      if (!targetItem) return { ...row, availabilityChecked: true, available: false, sisa: 0 };

      // Calculate overlap bookings
      let bookedQty = 0;
      bookings.forEach(b => {
        if (b.itemId === row.itemId && (b.status === 'Dipesan' || b.status === 'Sedang Dipinjam')) {
          const bStart = b.tanggalPinjam;
          const bEnd = b.tanggalKembaliRencana;
          if (bStart <= tanggalKembaliRencana && bEnd >= tanggalPinjam) {
            bookedQty += Number(b.qty) || 0;
          }
        }
      });

      const sisa = Math.max(0, targetItem.qtyTotal - bookedQty);
      return {
        ...row,
        availabilityChecked: true,
        available: sisa >= row.qty,
        sisa
      };
    });

    setItemRows(updated);
  };

  const allAvailable = itemRows.length > 0 && itemRows.every(r => r.availabilityChecked && r.available);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!untukProyek.trim() || !dipesanOleh.trim()) return;
    if (kategoriPeminjam === 'Eksternal' && (!namaPeminjamEksternal.trim() || !kontakPeminjam.trim())) return;

    const itemsToSubmit = itemRows.map(r => {
      const inv = inventaris.find(i => i.id === r.itemId);
      return {
        itemId: r.itemId,
        namaBarang: inv?.namaBarang || '',
        kategori: inv?.kategori || '',
        qty: Number(r.qty) || 1
      };
    });

    const sharedData = {
      tanggalPinjam,
      tanggalKembaliRencana,
      untukProyek,
      dipesanOleh,
      kategoriPeminjam,
      namaPeminjamEksternal,
      kontakPeminjam,
      noKtp,
      statusBiaya
    };

    onSubmitBatch(sharedData, itemsToSubmit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E30000] text-white flex items-center justify-center font-black">
              +
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Booking Paket Peralatan</h3>
              <p className="text-xs text-slate-400">Pesan banyak alat sekaligus untuk satu tanggal & proyek.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 pb-32 sm:pb-40 space-y-4">
          {/* Dates Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Tanggal Pinjam *
              </label>
              <input
                type="date"
                required
                value={tanggalPinjam}
                onChange={e => {
                  setTanggalPinjam(e.target.value);
                  setItemRows(prev => prev.map(r => ({ ...r, availabilityChecked: false })));
                }}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Tanggal Kembali Rencana *
              </label>
              <input
                type="date"
                required
                value={tanggalKembaliRencana}
                onChange={e => {
                  setTanggalKembaliRencana(e.target.value);
                  setItemRows(prev => prev.map(r => ({ ...r, availabilityChecked: false })));
                }}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>

          {/* Project & Borrower */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Untuk Proyek / Klien *
              </label>
              <input
                type="text"
                required
                value={untukProyek}
                onChange={e => setUntukProyek(e.target.value)}
                placeholder="Contoh: Shooting Video Profil Kopi Kenangan"
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                  Dipesan Oleh (Staff PJ) *
                </label>
                <input
                  type="text"
                  required
                  list="staff-suggestions"
                  value={dipesanOleh}
                  onChange={e => setDipesanOleh(e.target.value)}
                  placeholder="Nama staff penanggung jawab"
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                />
                <datalist id="staff-suggestions">
                  {staffOptions.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                  Kategori Peminjam
                </label>
                <select
                  value={kategoriPeminjam}
                  onChange={e => setKategoriPeminjam(e.target.value as KategoriPeminjam)}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                >
                  <option value="Tim Internal">Tim Internal</option>
                  <option value="Eksternal">Eksternal</option>
                </select>
              </div>
            </div>

            {/* External fields */}
            {kategoriPeminjam === 'Eksternal' && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Detail Peminjam Eksternal (Wajib Kontak)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={namaPeminjamEksternal}
                      onChange={e => handleExternalNameChange(e.target.value)}
                      placeholder="Nama orang / pihak eksternal *"
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={kontakPeminjam}
                      onChange={e => setKontakPeminjam(e.target.value)}
                      placeholder="Nomor WA / HP (0812xxx) *"
                      className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={noKtp}
                    onChange={e => setNoKtp(e.target.value)}
                    placeholder="No. KTP Peminjam (opsional untuk BAST resmi)"
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                  />
                </div>
              </div>
            )}

            {/* Status Biaya */}
            {showFinancials && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                  Status Biaya Sewa
                </label>
                <select
                  value={statusBiaya}
                  onChange={e => setStatusBiaya(e.target.value as StatusBiaya)}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                >
                  <option value="Free Charge">Free Charge (Gratis / 0%)</option>
                  <option value="Maintenance Charge">Maintenance Charge (25% tarif sewa)</option>
                  <option value="Full Charge">Full Charge (100% tarif sewa komersil)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Tarif sewa dihitung otomatis dari harga perolehan dan tarif alat.
                </p>
              </div>
            )}
          </div>

          {/* Equipment Items List */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Daftar Alat yang Dipinjam ({itemRows.length})
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-[#E30000] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baris Alat</span>
              </button>
            </div>

            {itemRows.map((row, idx) => {
              const selectedItem = inventaris.find(i => i.id === row.itemId);
              return (
                <div 
                  key={idx} 
                  style={{ zIndex: 40 - idx }}
                  className="p-3 rounded-xl border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700/80 space-y-1.5 relative"
                >
                  <div className="flex items-center gap-2">
                    <EquipmentCombobox
                      items={inventaris}
                      selectedId={row.itemId}
                      onSelect={(item) => updateRow(idx, 'itemId', item.id)}
                      otherSelectedIds={itemRows.map(r => r.itemId)}
                      placeholder="Ketik untuk mencari alat (nama, kategori, ID)..."
                    />

                    <input
                      type="number"
                      min={1}
                      max={selectedItem?.qtyTotal || 99}
                      value={row.qty}
                      onChange={e => updateRow(idx, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-18 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-bold text-center border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      title="Jumlah unit"
                    />

                    {itemRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer"
                        title="Hapus baris alat ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {row.availabilityChecked && (
                    <div className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                      row.available 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium' 
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold'
                    }`}>
                      {row.available ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Tersedia! Sisa {row.sisa} unit pada rentang tanggal tersebut.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Stok tidak cukup! Tersisa {row.sisa} unit (diminta {row.qty} unit).</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Availability Alert Helper */}
          <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={checkAvailability}
              className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Cek Ketersediaan Semua Alat
            </button>
            <div className="text-[11.5px] text-slate-400">
              {allAvailable ? 'Semua alat terkonfirmasi tersedia.' : 'Wajib klik cek ketersediaan sebelum submit.'}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50 dark:bg-[#070D19]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allAvailable}
            className="px-5 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            Booking Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
