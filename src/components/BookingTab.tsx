import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  Calendar, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  RotateCcw, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  User,
  Phone,
  CreditCard,
  Layers
} from 'lucide-react';
import { BookingGroup, BookingStatus, Role } from '../types/inventory';
import { 
  formatTanggalRingkas, 
  formatRentangTanggal, 
  formatRupiah, 
  hitungHariTerlambat, 
  buildWaReminderUrl 
} from '../lib/dateUtils';

interface BookingTabProps {
  groups: BookingGroup[];
  currentRole: Role;
  onCheckoutGroup: (group: BookingGroup) => void;
  onReturnGroup: (group: BookingGroup) => void;
  onCancelGroup: (group: BookingGroup) => void;
  onExportPdf: (group: BookingGroup) => void;
  onOpenNewBookingModal: () => void;
}

export const BookingTab: React.FC<BookingTabProps> = ({
  groups,
  currentRole,
  onCheckoutGroup,
  onReturnGroup,
  onCancelGroup,
  onExportPdf,
  onOpenNewBookingModal
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const canManage = currentRole !== 'Client';
  const showFinance = currentRole === 'Admin' || currentRole === 'Project Manager';

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Filter active vs all
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      // Filter status
      if (statusFilter === 'active' && !(g.status === 'Dipesan' || g.status === 'Sedang Dipinjam')) {
        return false;
      }
      if (statusFilter !== 'all' && statusFilter !== 'active' && g.status !== statusFilter) {
        return false;
      }

      // Filter search
      if (search) {
        const q = search.toLowerCase().trim();
        const matchProject = String(g.untukProyek || '').toLowerCase().includes(q);
        const matchForm = String(g.nomorFormulir || '').toLowerCase().includes(q);
        const matchBorrower = 
          String(g.dipesanOleh || '').toLowerCase().includes(q) ||
          String(g.namaPeminjamEksternal || '').toLowerCase().includes(q);
        const matchItems = (g.items || []).some(i => 
          String(i.namaBarang || '').toLowerCase().includes(q) || 
          String(i.kategori || '').toLowerCase().includes(q)
        );
        if (!matchProject && !matchForm && !matchBorrower && !matchItems) return false;
      }

      return true;
    });
  }, [groups, statusFilter, search]);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Dipesan':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Sedang Dipinjam':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Selesai':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Dibatalkan':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari proyek, nomor formulir, nama peminjam, atau alat..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E30000]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#E30000]"
          >
            <option value="active">Semua Booking Aktif</option>
            <option value="Dipesan">Hanya Dipesan (Menunggu Checkout)</option>
            <option value="Sedang Dipinjam">Sedang Dipinjam (Di Lapangan)</option>
            <option value="all">Semua Status (Termasuk Selesai)</option>
          </select>
        </div>
      </div>

      {/* Package List */}
      {filteredGroups.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tidak ada paket booking aktif</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Semua peralatan saat ini tersedia atau belum ada pemesanan dalam filter ini.
          </p>
          <button
            onClick={onOpenNewBookingModal}
            className="px-4 py-2 rounded-xl bg-[#E30000] text-white text-xs sm:text-sm font-semibold hover:bg-[#DC2626] transition-colors cursor-pointer"
          >
            + Buat Booking Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map(group => {
            const isExpanded = !!expandedGroups[group.groupId];
            const overdueDays = group.status === 'Sedang Dipinjam' ? hitungHariTerlambat(group.tanggalKembaliRencana) : 0;
            const namaPeminjam = group.kategoriPeminjam === 'Eksternal' ? group.namaPeminjamEksternal : group.dipesanOleh;
            const totalItemCount = group.items.reduce((s, i) => s + (Number(i.qty) || 1), 0);

            return (
              <div
                key={group.groupId}
                className="rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Header */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(group.status)}`}>
                        {group.status}
                      </span>
                      {group.nomorFormulir && (
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {group.nomorFormulir}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {group.kategoriPeminjam}
                      </span>
                      {overdueDays >= 1 && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Terlambat {overdueDays} Hari</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                      {group.untukProyek}
                    </h3>

                    {/* Metadata & Borrower Details */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>{formatRentangTanggal(group.tanggalPinjam, group.tanggalKembaliRencana)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{namaPeminjam || 'Staff'}</span>
                      </div>
                      {group.kontakPeminjam && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{group.kontakPeminjam}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        <span>{group.items.length} item ({totalItemCount} unit)</span>
                      </div>
                      {showFinance && group.statusBiaya && group.statusBiaya !== 'Free Charge' && (
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Total Sewa: {formatRupiah(group.totalBiaya)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* WhatsApp Reminder if overdue >= 2 days & phone is available */}
                    {overdueDays >= 1 && group.kontakPeminjam && (
                      <a
                        href={buildWaReminderUrl(
                          group.kontakPeminjam,
                          namaPeminjam,
                          group.items.map(i => i.namaBarang).join(', '),
                          group.untukProyek,
                          group.tanggalKembaliRencana
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/25 transition-colors cursor-pointer"
                        title="Buka WhatsApp untuk kirim pesan teguran/pengingat"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ingatkan WA</span>
                      </a>
                    )}

                    {/* PDF Export */}
                    <button
                      onClick={() => onExportPdf(group)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Unduh Formulir Serah Terima (PDF)"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-500" />
                      <span>PDF</span>
                    </button>

                    {/* Checkout Button */}
                    {canManage && group.status === 'Dipesan' && (
                      <button
                        onClick={() => onCheckoutGroup(group)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs font-bold transition-all shadow-sm shadow-red-500/20 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Checkout</span>
                      </button>
                    )}

                    {/* Return Button */}
                    {canManage && group.status === 'Sedang Dipinjam' && (
                      <button
                        onClick={() => onReturnGroup(group)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Kembalikan</span>
                      </button>
                    )}

                    {/* Cancel Button */}
                    {canManage && group.status === 'Dipesan' && (
                      <button
                        onClick={() => onCancelGroup(group)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                        title="Batalkan Booking Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Accordion Expand */}
                    <button
                      onClick={() => toggleExpand(group.groupId)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={isExpanded ? 'Tutup Rincian Alat' : 'Buka Rincian Alat'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Equipment List */}
                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-[#0F172A] p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Daftar Alat dalam Paket Ini ({group.items.length} item)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {group.items.map((it, idx) => (
                        <div
                          key={it.id || idx}
                          className="p-2.5 rounded-xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {it.namaBarang}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                              {it.kategori}
                            </div>
                          </div>
                          <div className="shrink-0 font-extrabold text-[#E30000] bg-red-500/10 px-2 py-0.5 rounded-md">
                            × {it.qty}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Checkout & Return Audit Info */}
                    {(group.items[0]?.waktuCheckout || group.items[0]?.waktuPengembalian) && (
                      <div className="pt-2 text-[11.5px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-4 border-t border-slate-200/60 dark:border-slate-800/60 mt-3">
                        {group.items[0]?.waktuCheckout && (
                          <div>
                            Checkout: <span className="font-semibold text-slate-700 dark:text-slate-300">{group.items[0].waktuCheckout}</span>
                            {group.items[0].picMengeluarkan && ` oleh ${group.items[0].picMengeluarkan}`}
                          </div>
                        )}
                        {group.items[0]?.waktuPengembalian && (
                          <div>
                            Pengembalian: <span className="font-semibold text-slate-700 dark:text-slate-300">{group.items[0].waktuPengembalian}</span>
                            {group.items[0].picMenerima && ` diterima ${group.items[0].picMenerima}`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
