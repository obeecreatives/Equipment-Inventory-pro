import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  User,
  Copy,
  Check,
  FileCheck2
} from 'lucide-react';
import {
  InventarisItem,
  KategoriPeminjam,
  PublicBookingSlot,
  StatusBiaya
} from '../../types/inventory';
import {
  formatRentangTanggal,
  formatRupiah,
  getFutureDateString,
  getTodayString
} from '../../lib/dateUtils';
import { EquipmentCombobox } from '../EquipmentCombobox';
import { postToGas } from '../../lib/gasClient';

export interface PublicBookingReceipt {
  nomorFormulir: string;
  groupId: string;
  untukProyek: string;
  namaPeminjam: string;
  kontakPeminjam: string;
  kategoriPeminjam: 'Eksternal' | 'Freelancer obeecreatives';
  statusBiaya: StatusBiaya;
  tanggalPinjam: string;
  tanggalKembaliRencana: string;
  totalBiaya: number;
  items: Array<{ itemId: string; namaBarang: string; kategori: string; qty: number }>;
}

interface PublicBookingModalProps {
  presetItems: InventarisItem[];
  inventaris: InventarisItem[];
  bookingSlots: PublicBookingSlot[];
  onClose: () => void;
  onBookingSuccess: (receipt: PublicBookingReceipt) => void;
}

export const PublicBookingModal: React.FC<PublicBookingModalProps> = ({
  presetItems,
  inventaris,
  bookingSlots,
  onClose,
  onBookingSuccess
}) => {
  const [tanggalPinjam, setTanggalPinjam] = useState<string>(getTodayString());
  const [tanggalKembaliRencana, setTanggalKembaliRencana] = useState<string>(getFutureDateString(2));
  const [untukProyek, setUntukProyek] = useState<string>('');
  const [kategoriPeminjam, setKategoriPeminjam] = useState<'Eksternal' | 'Freelancer obeecreatives'>('Eksternal');
  const [namaPeminjamEksternal, setNamaPeminjamEksternal] = useState<string>('');
  const [kontakPeminjam, setKontakPeminjam] = useState<string>('');
  const [noKtp, setNoKtp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [receipt, setReceipt] = useState<PublicBookingReceipt | null>(null);
  const [copiedFormNo, setCopiedFormNo] = useState<boolean>(false);

  // Status Biaya otomatis berdasarkan Kategori Peminjam
  const statusBiaya: StatusBiaya =
    kategoriPeminjam === 'Freelancer obeecreatives' ? 'Maintenance Charge' : 'Full Charge';
  const ratePersen = statusBiaya === 'Maintenance Charge' ? 0.25 : 1;

  const initialRows = useMemo(() => {
    if (presetItems.length > 0) {
      return presetItems.map(item => ({
        itemId: item.id,
        qty: 1,
        availabilityChecked: false,
        available: false,
        sisa: 0
      }));
    }
    return [
      {
        itemId: inventaris[0]?.id || '',
        qty: 1,
        availabilityChecked: false,
        available: false,
        sisa: 0
      }
    ];
  }, [presetItems, inventaris]);

  const [itemRows, setItemRows] = useState<
    Array<{
      itemId: string;
      qty: number;
      availabilityChecked?: boolean;
      available?: boolean;
      sisa?: number;
    }>
  >(initialRows);

  const addItemRow = () => {
    const nextItem = inventaris.find(i => !itemRows.some(r => r.itemId === i.id)) || inventaris[0];
    setItemRows(prev => [...prev, { itemId: nextItem?.id || '', qty: 1 }]);
  };

  const removeItemRow = (idx: number) => {
    if (itemRows.length <= 1) return;
    setItemRows(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: 'itemId' | 'qty', val: any) => {
    setItemRows(prev =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: val, availabilityChecked: false } : r))
    );
  };

  const isDateRangeValid = Boolean(tanggalPinjam && tanggalKembaliRencana && tanggalKembaliRencana >= tanggalPinjam);

  const checkAvailability = () => {
    if (!isDateRangeValid) {
      setSubmitError('Tanggal kembali rencana tidak boleh lebih awal dari tanggal pinjam.');
      return;
    }
    setSubmitError('');

    const updated = itemRows.map(row => {
      const targetItem = inventaris.find(i => i.id === row.itemId);
      if (!targetItem) {
        return { ...row, availabilityChecked: true, available: false, sisa: 0 };
      }

      let bookedQty = 0;
      bookingSlots.forEach(slot => {
        if (slot.itemId === row.itemId && (slot.status === 'Dipesan' || slot.status === 'Sedang Dipinjam')) {
          const bStart = String(slot.tanggalPinjam).split('T')[0];
          const bEnd = String(slot.tanggalKembaliRencana).split('T')[0];
          if (bStart <= tanggalKembaliRencana && bEnd >= tanggalPinjam) {
            bookedQty += Number(slot.qty) || 0;
          }
        }
      });

      const sisa = Math.max(0, targetItem.qtyTotal - bookedQty);
      return {
        ...row,
        availabilityChecked: true,
        available: sisa >= row.qty && row.qty > 0,
        sisa
      };
    });

    setItemRows(updated);
  };

  const estimasiBiayaTotal = useMemo(() => {
    return itemRows.reduce((sum, row) => {
      const item = inventaris.find(i => i.id === row.itemId);
      const tarifDasar = Number(item?.hargaSewa) || 0;
      return sum + Math.round(tarifDasar * ratePersen * (Number(row.qty) || 1));
    }, 0);
  }, [itemRows, inventaris, ratePersen]);

  const allAvailable =
    isDateRangeValid &&
    itemRows.length > 0 &&
    itemRows.every(r => r.itemId && r.availabilityChecked && r.available);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDateRangeValid || !allAvailable) return;
    if (!untukProyek.trim() || !namaPeminjamEksternal.trim() || !kontakPeminjam.trim()) {
      setSubmitError('Mohon lengkapi seluruh kolom bertanda wajib (*).');
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    const itemsToSubmit = itemRows.map(r => {
      const inv = inventaris.find(i => i.id === r.itemId);
      return {
        itemId: r.itemId,
        namaBarang: inv?.namaBarang || '',
        kategori: inv?.kategori || '',
        qty: Number(r.qty) || 1
      };
    });

    const sharedPayload = {
      tanggalPinjam,
      tanggalKembaliRencana,
      untukProyek: untukProyek.trim(),
      dipesanOleh: `[PORTAL PUBLIK] ${namaPeminjamEksternal.trim()}`,
      kategoriPeminjam: kategoriPeminjam as KategoriPeminjam,
      namaPeminjamEksternal: namaPeminjamEksternal.trim(),
      kontakPeminjam: kontakPeminjam.trim(),
      noKtp: noKtp.trim(),
      statusBiaya,
      statusApproval: 'Menunggu Konfirmasi',
      source: 'public'
    };

    try {
      const res = await postToGas<{
        success?: boolean;
        groupId?: string;
        nomorFormulir?: string;
        errors?: string[];
      }>('createBookingBatch', { shared: sharedPayload, items: itemsToSubmit });

      if (res && res.success === false && res.errors && res.errors.length > 0) {
        setSubmitError(res.errors.join(' | '));
        setIsSubmitting(false);
        return;
      }

      const finalReceipt: PublicBookingReceipt = {
        nomorFormulir:
          res?.nomorFormulir ||
          `EQP/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`,
        groupId: res?.groupId || 'GRP' + Date.now(),
        untukProyek: sharedPayload.untukProyek,
        namaPeminjam: sharedPayload.namaPeminjamEksternal,
        kontakPeminjam: sharedPayload.kontakPeminjam,
        kategoriPeminjam,
        statusBiaya,
        tanggalPinjam,
        tanggalKembaliRencana,
        totalBiaya: estimasiBiayaTotal,
        items: itemsToSubmit
      };

      setReceipt(finalReceipt);
      onBookingSuccess(finalReceipt);
    } catch (err: any) {
      setSubmitError(err?.message || 'Gagal mengirim pengajuan booking. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyFormNo = () => {
    if (!receipt?.nomorFormulir) return;
    navigator.clipboard?.writeText(receipt.nomorFormulir);
    setCopiedFormNo(true);
    setTimeout(() => setCopiedFormNo(false), 2000);
  };

  if (receipt) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Pengajuan Booking Terkirim</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Status awal: <strong>Dipesan</strong> · Menunggu Konfirmasi Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1E293B] space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700/80">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Nomor Formulir (Simpan untuk Cek Status)
                  </div>
                  <div className="font-mono font-extrabold text-base text-[#E30000] mt-0.5 tabular-nums">
                    {receipt.nomorFormulir}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyFormNo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copiedFormNo ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFormNo ? 'Disalin' : 'Salin'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <div className="text-slate-400">Nama Pemesan</div>
                  <div className="font-bold text-slate-900 dark:text-white">{receipt.namaPeminjam}</div>
                </div>
                <div>
                  <div className="text-slate-400">Kategori & Tarif</div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {receipt.kategoriPeminjam} ({receipt.statusBiaya})
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Proyek</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{receipt.untukProyek}</div>
                </div>
                <div>
                  <div className="text-slate-400">Jadwal Pinjam</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatRentangTanggal(receipt.tanggalPinjam, receipt.tanggalKembaliRencana)}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Alat yang Diajukan ({receipt.items.length} item)
                </div>
                {receipt.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{it.namaBarang}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">× {it.qty}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Estimasi Biaya Sewa ({receipt.statusBiaya})</span>
                  <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatRupiah(receipt.totalBiaya)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
              Admin obeecreatives akan meninjau pengajuan Anda dan mengirimkan notifikasi persetujuan ke WhatsApp{' '}
              <strong>{receipt.kontakPeminjam}</strong>. Anda juga dapat memantau status approval kapan saja melalui tombol{' '}
              <strong>Cek Status</strong> di portal ini menggunakan Nomor Formulir di atas.
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 cursor-pointer"
              >
                Kembali ke Katalog
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">Formulir Booking Alat</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ajukan peminjaman alat produksi obeecreatives untuk proyek Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 pb-28 space-y-4">
          {submitError && (
            <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Tanggal Pinjam *
              </label>
              <input
                type="date"
                required
                min={getTodayString()}
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
                min={tanggalPinjam || getTodayString()}
                value={tanggalKembaliRencana}
                onChange={e => {
                  setTanggalKembaliRencana(e.target.value);
                  setItemRows(prev => prev.map(r => ({ ...r, availabilityChecked: false })));
                }}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Untuk Proyek / Keperluan Acara *
            </label>
            <input
              type="text"
              required
              value={untukProyek}
              onChange={e => setUntukProyek(e.target.value)}
              placeholder="Contoh: Shooting Video Dokumentasi Event / Iklan Produk"
              className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
            />
          </div>

          {/* Kategori Peminjam & Otomatisasi Status Biaya Sewa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Kategori Peminjam *
              </label>
              <select
                value={kategoriPeminjam}
                onChange={e =>
                  setKategoriPeminjam(e.target.value as 'Eksternal' | 'Freelancer obeecreatives')
                }
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              >
                <option value="Eksternal">Eksternal</option>
                <option value="Freelancer obeecreatives">Freelancer obeecreatives</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Status Biaya Sewa (Otomatis)
              </label>
              <input
                type="text"
                readOnly
                value={
                  kategoriPeminjam === 'Freelancer obeecreatives'
                    ? 'Maintenance Charge (25% Tarif Sewa)'
                    : 'Full Charge (100% tarif sewa komersil)'
                }
                className="w-full px-3 py-2 rounded-xl text-sm font-semibold border bg-slate-100 dark:bg-[#0B1220] border-slate-200 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Borrower Details */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1E293B] space-y-3">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#E30000]" />
              <span>Identitas Pemesan (Untuk Konfirmasi & BAST)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  value={namaPeminjamEksternal}
                  onChange={e => setNamaPeminjamEksternal(e.target.value)}
                  placeholder="Nama Lengkap / Tim / Vendor *"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  value={kontakPeminjam}
                  onChange={e => setKontakPeminjam(e.target.value)}
                  placeholder="Nomor WhatsApp Aktif (0812xxx) *"
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                />
              </div>
            </div>
            <div>
              <input
                type="text"
                value={noKtp}
                onChange={e => setNoKtp(e.target.value)}
                placeholder="No. KTP / Identitas (opsional untuk Berita Acara Serah Terima)"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * Status persetujuan admin akan dikirim ke nomor WhatsApp di atas.
            </p>
          </div>

          {/* Equipment Items */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Daftar Alat yang Diajukan ({itemRows.length})
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-[#E30000] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Baris Alat</span>
              </button>
            </div>

            {itemRows.map((row, idx) => {
              const selectedItem = inventaris.find(i => i.id === row.itemId);
              const itemTarif = Math.round((selectedItem?.hargaSewa || 0) * ratePersen * (Number(row.qty) || 1));

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
                      onSelect={item => updateRow(idx, 'itemId', item.id)}
                      otherSelectedIds={itemRows.map(r => r.itemId)}
                      placeholder="Ketik nama alat atau kategori..."
                    />

                    <input
                      type="number"
                      min={1}
                      max={selectedItem?.qtyTotal || 99}
                      value={row.qty}
                      onChange={e => updateRow(idx, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-18 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-bold text-center border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums"
                      title="Jumlah unit"
                    />

                    {itemRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 cursor-pointer"
                        title="Hapus baris alat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-0.5">
                    <span>Stok studio: {selectedItem?.qtyTotal || 0} {selectedItem?.satuan || 'Unit'}</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      Estimasi: {itemTarif > 0 ? formatRupiah(itemTarif) : 'Sesuai konfirmasi admin'}
                    </span>
                  </div>

                  {row.availabilityChecked && (
                    <div
                      className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                        row.available
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold'
                      }`}
                    >
                      {row.available ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Tersedia! Sisa {row.sisa} unit pada jadwal tersebut.</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Stok tidak mencukupi! Tersisa {row.sisa} unit (diminta {row.qty} unit).</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Availability Check & Total */}
          <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={checkAvailability}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Cek Ketersediaan Alat
            </button>
            <div className="text-right ml-auto">
              <div className="text-[11px] text-slate-400">Estimasi Total ({statusBiaya})</div>
              <div className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatRupiah(estimasiBiayaTotal)}
              </div>
            </div>
          </div>
          <div className="text-[11.5px] text-slate-400">
            {allAvailable
              ? 'Semua alat terkonfirmasi tersedia dan siap diajukan.'
              : 'Klik "Cek Ketersediaan Alat" terlebih dahulu sebelum mengirim pengajuan.'}
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50 dark:bg-[#070D19]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAvailable || isSubmitting}
            className="px-5 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Mengirim Pengajuan...' : 'Ajukan Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};
