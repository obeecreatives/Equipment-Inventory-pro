import React from 'react';
import { X, HelpCircle, BookOpen } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E30000] text-white flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Panduan Penggunaan Equipment Hub</h3>
              <p className="text-xs text-slate-400">Versi: Modern Headless GAS v2.0 • obeecreatives Workspace OS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300">
            <strong>Kecepatan 0.01 Detik & Offline-First:</strong> Seluruh data disimpan di penyimpanan lokal (Instant Cache) dengan sinkronisasi background ke Google Sheets, sehingga Anda tidak perlu menunggu latensi internet lambat.
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">1. Booking Alat (Multi-Unit Sekaligus)</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Klik tombol <strong>+ Booking Alat</strong>, tentukan rentang tanggal, proyek, dan peminjam satu kali. Tambahkan sebanyak mungkin alat yang dibutuhkan dalam satu formulir. Sistem secara cerdas akan mengecek apakah ada overlap peminjaman dengan jadwal lain.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">2. Unduh Formulir BAST (PDF)</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Setiap paket booking memiliki tombol <strong>PDF</strong> untuk mengunduh satu lembar Berita Acara Serah Terima resmi berlogo obeecreatives dengan nomor formulir otomatis (format: <code>EQP/YYYY/MM/####</code>).
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">3. Checkout (Serah Terima Alat Keluar)</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Saat alat diambil kru di hari-H, klik <strong>Checkout Semua</strong>. Catat nama PIC penyerah alat dan kru yang membawa. Status akan berubah menjadi <em>Sedang Dipinjam</em>.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">4. Pengembalian Alat (Inspeksi Fisik Per-Item)</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Saat alat dikembalikan, klik <strong>Kembalikan</strong>. Petugas memeriksa kondisi fisik setiap alat satu per satu (Baik / Rusak / Hilang). Jika ada alat rusak, status master alat otomatis diubah menjadi <em>Perlu Servis</em>.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">5. Peringatan Terlambat & Pengingat WhatsApp</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Paket yang belum kembali lewat 1 hari akan ditandai badge merah <em>⚠ Terlambat</em>. Jika lebih dari 2 hari dan ada nomor kontak, muncul tombol <strong>Ingatkan WA</strong> untuk langsung membuka pesan teguran di WhatsApp tanpa perlu mengetik manual.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">6. Valuasi Nilai Aset (Khusus Admin & PM)</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Menghitung total nilai aset aktif, persentase nilai per kategori, dan 10 alat bernilai tertinggi. Alat berkondisi Rusak, Hilang, atau Dikeluarkan dari Aset otomatis dipisahkan dari total aset aktif.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">7. Stock Opname Fisik</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Audit berkala jumlah unit fisik di studio dan bandingkan dengan data sistem. Selisih hitungan (+ / -) dapat langsung disinkronkan ke master inventaris.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">8. Standar Tanggal & Waktu Locale Indonesia (id-ID)</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Semua tanggal, hari, bulan, dan jam disajikan dalam standar Bahasa Indonesia (WIB) untuk akurasi pelaporan tim lapangan.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#070D19]">
          <span className="text-[11.5px] text-slate-400">
            Dibuat untuk obeecreatives Studio Production.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 cursor-pointer"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
