import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Clock,
  AlertCircle
} from 'lucide-react';
import { ApprovalStatus, PublicBookingStatusResult } from '../../types/inventory';
import { checkPublicBookingStatus } from '../../lib/gasClient';
import {
  formatRentangTanggal,
  formatRupiah,
  getApprovalNotificationSummary
} from '../../lib/dateUtils';
import { PublicBookingReceipt } from './PublicBookingModal';

interface PublicStatusModalProps {
  localReceipts: PublicBookingReceipt[];
  onClose: () => void;
}

export const PublicStatusModal: React.FC<PublicStatusModalProps> = ({
  localReceipts,
  onClose
}) => {
  const [nomorFormulir, setNomorFormulir] = useState<string>(localReceipts[0]?.nomorFormulir || '');
  const [kontakLast4, setKontakLast4] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<PublicBookingStatusResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanForm = nomorFormulir.trim();
    const cleanDigits = kontakLast4.replace(/[^0-9]/g, '').slice(-4);
    if (!cleanForm || cleanDigits.length !== 4) {
      setError('Masukkan Nomor Formulir dan 4 digit terakhir No. WhatsApp Anda.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await checkPublicBookingStatus(cleanForm, cleanDigits);
      if (res.found) {
        setResult(res);
      } else {
        // Fallback ke localReceipts sesi ini jika belum tersinkron
        const localMatch = localReceipts.find(r => {
          const formOk = r.nomorFormulir.trim().toUpperCase() === cleanForm.toUpperCase();
          const digits = r.kontakPeminjam.replace(/[^0-9]/g, '');
          return formOk && digits.endsWith(cleanDigits);
        });
        if (localMatch) {
          setResult({
            ok: true,
            found: true,
            nomorFormulir: localMatch.nomorFormulir,
            untukProyek: localMatch.untukProyek,
            namaPeminjam: localMatch.namaPeminjam,
            kategoriPeminjam: localMatch.kategoriPeminjam,
            tanggalPinjam: localMatch.tanggalPinjam,
            tanggalKembaliRencana: localMatch.tanggalKembaliRencana,
            status: 'Dipesan',
            statusApproval: 'Menunggu Konfirmasi',
            statusBiaya: localMatch.statusBiaya,
            totalBiaya: localMatch.totalBiaya,
            items: localMatch.items
          });
        } else {
          setResult({ ok: true, found: false });
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memeriksa status pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBanner = (approval: ApprovalStatus, catatan?: string) => {
    const summary = getApprovalNotificationSummary(approval, catatan);
    switch (approval) {
      case 'Disetujui':
        return (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <div className="font-bold text-sm">{summary.headline}</div>
              <p className="text-xs mt-0.5 leading-relaxed">{summary.body}</p>
            </div>
          </div>
        );
      case 'Ditolak':
        return (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <div className="font-bold text-sm">{summary.headline}</div>
              <p className="text-xs mt-0.5 leading-relaxed">{summary.body}</p>
            </div>
          </div>
        );
      case 'Pemakaian Terjadwal':
        return (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
            <CalendarClock className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <div className="font-bold text-sm">{summary.headline}</div>
              <p className="text-xs mt-0.5 leading-relaxed">{summary.body}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 flex items-start gap-2.5">
            <Clock className="w-5 h-5 shrink-0 mt-0.5 text-sky-500" />
            <div>
              <div className="font-bold text-sm">{summary.headline}</div>
              <p className="text-xs mt-0.5 leading-relaxed">{summary.body}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg">Cek Status Approval Booking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masukkan Nomor Formulir &amp; 4 digit terakhir No. WhatsApp Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleCheck} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                  Nomor Formulir
                </label>
                <input
                  type="text"
                  required
                  value={nomorFormulir}
                  onChange={e => setNomorFormulir(e.target.value)}
                  placeholder="Contoh: EQP/2026/11/0001"
                  className="w-full px-3 py-2 rounded-xl text-sm font-mono border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                  4 Digit Akhir WA
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={kontakLast4}
                  onChange={e => setKontakLast4(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="Contoh: 1234"
                  className="w-full px-3 py-2 rounded-xl text-sm font-mono text-center border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000] tabular-nums"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E30000] hover:bg-[#DC2626] disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Memeriksa...' : 'Cek Status Pengajuan'}</span>
            </button>
          </form>

          {result && !result.found && (
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
              Data tidak ditemukan. Pastikan Nomor Formulir dan 4 digit terakhir No. WhatsApp sesuai dengan yang Anda masukkan saat booking.
            </div>
          )}

          {result && result.found && (
            <div className="space-y-3 pt-1">
              {renderStatusBanner(result.statusApproval || 'Menunggu Konfirmasi', result.catatanApproval)}

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1E293B] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#E30000]">{result.nomorFormulir}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {result.kategoriPeminjam} · {result.statusBiaya}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{result.untukProyek}</div>
                <div className="text-slate-500 dark:text-slate-400">
                  Pemesan: <strong className="text-slate-800 dark:text-slate-200">{result.namaPeminjam}</strong> ·{' '}
                  {formatRentangTanggal(result.tanggalPinjam, result.tanggalKembaliRencana)}
                </div>
                {result.items && result.items.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-1">
                    {result.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{it.namaBarang}</span>
                        <span className="font-mono font-bold tabular-nums">× {it.qty}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700 font-semibold">
                      <span>Estimasi Biaya</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatRupiah(result.totalBiaya)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
