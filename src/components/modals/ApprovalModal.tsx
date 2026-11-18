import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  CalendarClock,
  MessageCircle,
  User,
  Phone,
  Calendar,
  Layers
} from 'lucide-react';
import { ApprovalStatus, BookingGroup } from '../../types/inventory';
import {
  buildWaApprovalUrl,
  formatRentangTanggal,
  formatRupiah,
  getApprovalNotificationSummary
} from '../../lib/dateUtils';

interface ApprovalModalProps {
  group: BookingGroup;
  onClose: () => void;
  onSubmitApproval: (groupId: string, statusApproval: ApprovalStatus, catatanApproval: string) => Promise<void> | void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  group,
  onClose,
  onSubmitApproval
}) => {
  const initialStatus: ApprovalStatus =
    group.statusApproval && group.statusApproval !== 'Menunggu Konfirmasi'
      ? group.statusApproval
      : 'Disetujui';

  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus>(initialStatus);
  const [catatanApproval, setCatatanApproval] = useState<string>(group.catatanApproval || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const namaPeminjam =
    group.kategoriPeminjam === 'Eksternal' || group.kategoriPeminjam === 'Freelancer obeecreatives'
      ? group.namaPeminjamEksternal || group.dipesanOleh
      : group.dipesanOleh;

  const daftarAlat = group.items.map(i => `${i.namaBarang} (x${i.qty})`).join(', ');
  const previewText = getApprovalNotificationSummary(selectedStatus, catatanApproval);

  const waUrl = group.kontakPeminjam
    ? buildWaApprovalUrl({
        kontak: group.kontakPeminjam,
        namaPeminjam,
        nomorFormulir: group.nomorFormulir,
        untukProyek: group.untukProyek,
        daftarAlat,
        tanggalPinjam: group.tanggalPinjam,
        tanggalKembaliRencana: group.tanggalKembaliRencana,
        statusApproval: selectedStatus,
        catatanApproval
      })
    : '';

  const approvalOptions: Array<{
    value: ApprovalStatus;
    label: string;
    desc: string;
    icon: React.ReactNode;
    activeClass: string;
  }> = [
    {
      value: 'Disetujui',
      label: 'Disetujui',
      desc: 'Pengajuan peminjaman alat disetujui, silakan hubungi admin obeecreatives.',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
      activeClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    },
    {
      value: 'Ditolak',
      label: 'Ditolak',
      desc: 'Mohon maaf, pengajuan peminjaman alat ditolak. Slot alat otomatis dibuka kembali.',
      icon: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
      activeClass: 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300'
    },
    {
      value: 'Pemakaian Terjadwal',
      label: 'Pemakaian Terjadwal',
      desc: 'Mohon maaf, alat yang Anda booking saat ini sudah dalam rencana pemakaian tim internal.',
      icon: <CalendarClock className="w-4 h-4 text-amber-500 shrink-0" />,
      activeClass: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
    }
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitApproval(group.groupId, selectedStatus, catatanApproval);
      setSavedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">Approval Pengajuan Booking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {group.nomorFormulir} · {group.kategoriPeminjam}
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

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Booking Info Summary */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1E293B] space-y-2 text-xs">
            <div className="font-bold text-sm text-slate-900 dark:text-white">{group.untukProyek}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {namaPeminjam || '-'}
              </span>
              {group.kontakPeminjam && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  {group.kontakPeminjam}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
                {formatRentangTanggal(group.tanggalPinjam, group.tanggalKembaliRencana)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                {group.items.length} alat ({group.statusBiaya} · {formatRupiah(group.totalBiaya)})
              </span>
            </div>
          </div>

          {/* Approval Status Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Pilih Keputusan Approval *
            </label>
            <div className="space-y-2">
              {approvalOptions.map(opt => {
                const isSelected = selectedStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(opt.value);
                      setSavedSuccess(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? opt.activeClass
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">{opt.icon}</div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm">{opt.label}</div>
                      <div className="text-xs opacity-80 mt-0.5">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Catatan Tambahan untuk Pemesan (Opsional)
            </label>
            <textarea
              rows={2}
              value={catatanApproval}
              onChange={e => {
                setCatatanApproval(e.target.value);
                setSavedSuccess(false);
              }}
              placeholder="Misal: Pengambilan alat jam 09.00 WIB di studio, wajib bawa KTP asli..."
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
            />
          </div>

          {/* Notification Preview */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1220] space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pratinjau Pesan Notifikasi ke Pemesan
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">{previewText.headline}</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{previewText.body}</p>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold">
                Status approval tersimpan ke Google Sheets & Portal Publik!
              </span>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Kirim Notif WA Sekarang</span>
                </a>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 flex-wrap bg-slate-50 dark:bg-[#070D19]">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Kirim Notif WhatsApp</span>
            </a>
          ) : (
            <div className="text-[11px] text-slate-400">No. WA pemesan belum diisi</div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Keputusan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
