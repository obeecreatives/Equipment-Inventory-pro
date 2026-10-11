import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit2, Bookmark, MapPin, Tag, AlertCircle } from 'lucide-react';
import { InventarisItem, KondisiAlat, Role } from '../types/inventory';
import { formatRupiah } from '../lib/dateUtils';

interface PeralatanTabProps {
  items: InventarisItem[];
  currentRole: Role;
  onEditItem: (item: InventarisItem) => void;
  onBookItem: (item: InventarisItem) => void;
  onAddNewItem: () => void;
}

export const PeralatanTab: React.FC<PeralatanTabProps> = ({
  items,
  currentRole,
  onEditItem,
  onBookItem,
  onAddNewItem
}) => {
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [selectedKondisi, setSelectedKondisi] = useState<string>('all');

  const canEdit = currentRole === 'Admin' || currentRole === 'Project Manager' || currentRole === 'Site Engineer';
  const showFinancials = currentRole === 'Admin' || currentRole === 'Project Manager';

  // Daftar kategori unik
  const kategoriList = useMemo(() => {
    return Array.from(new Set(items.map(i => i.kategori).filter(Boolean))).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchSearch = 
        !search ||
        i.namaBarang.toLowerCase().includes(search.toLowerCase()) ||
        i.kategori.toLowerCase().includes(search.toLowerCase()) ||
        i.noSeri.toLowerCase().includes(search.toLowerCase()) ||
        (i.lokasiSimpan && i.lokasiSimpan.toLowerCase().includes(search.toLowerCase()));

      const matchKategori = selectedKategori === 'all' || i.kategori === selectedKategori;
      const matchKondisi = selectedKondisi === 'all' || i.kondisiAlat === selectedKondisi;

      return matchSearch && matchKategori && matchKondisi;
    });
  }, [items, search, selectedKategori, selectedKondisi]);

  // Group by kategori
  const groupedItems = useMemo(() => {
    const map: Record<string, InventarisItem[]> = {};
    filteredItems.forEach(i => {
      const cat = i.kategori || 'Lainnya';
      if (!map[cat]) map[cat] = [];
      map[cat].push(i);
    });
    return map;
  }, [filteredItems]);

  const getKondisiBadge = (kondisi: KondisiAlat) => {
    switch (kondisi) {
      case 'Baik':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Perlu Servis':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Rusak':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'Hilang':
        return 'bg-red-600/20 text-red-600 dark:text-red-400 border-red-600/40 font-bold';
      case 'Dikeluarkan dari Aset':
        return 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/15 text-slate-500';
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama alat, kategori, no seri, atau lokasi..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E30000]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedKategori}
            onChange={e => setSelectedKategori(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#E30000]"
          >
            <option value="all">Semua Kategori ({kategoriList.length})</option>
            {kategoriList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedKondisi}
            onChange={e => setSelectedKondisi(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#E30000]"
          >
            <option value="all">Semua Kondisi</option>
            <option value="Baik">Kondisi: Baik</option>
            <option value="Perlu Servis">Perlu Servis</option>
            <option value="Rusak">Rusak</option>
            <option value="Hilang">Hilang</option>
            <option value="Dikeluarkan dari Aset">Dikeluarkan dari Aset</option>
          </select>

          {canEdit && (
            <button
              onClick={onAddNewItem}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-red-500/20 cursor-pointer ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Alat</span>
            </button>
          )}
        </div>
      </div>

      {/* Grouped Inventory Display */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tidak ada alat yang cocok</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Coba ubah kata kunci pencarian atau sesuaikan filter kategori/kondisi.
          </p>
        </div>
      ) : (
        Object.keys(groupedItems).sort().map(kategori => {
          const list = groupedItems[kategori];
          return (
            <div key={kategori} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 rounded-full bg-[#E30000]" />
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-slate-900 dark:text-white">
                    {kategori}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {list.length} item
                  </span>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {list.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Title & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white truncate" title={item.namaBarang}>
                            {item.namaBarang}
                          </h4>
                          {item.noSeri ? (
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              SN: {item.noSeri}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                              Tanpa No Seri
                            </span>
                          )}
                        </div>

                        {canEdit && (
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                            title="Edit Data Alat"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Tags & Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getKondisiBadge(item.kondisiAlat)}`}>
                          {item.kondisiAlat}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.qtyTotal} {item.satuan}
                        </span>
                        {item.lokasiSimpan && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 flex items-center gap-1 border border-slate-200 dark:border-slate-800">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span className="truncate max-w-[130px]">{item.lokasiSimpan}</span>
                          </span>
                        )}
                      </div>

                      {/* Note / Description */}
                      {item.keterangan && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                          {item.keterangan}
                        </p>
                      )}
                    </div>

                    {/* Bottom Pricing & Booking Action */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                      <div>
                        {showFinancials && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            Perolehan: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatRupiah(item.hargaPerolehan)}</span>
                          </div>
                        )}
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.hargaSewa > 0 ? (
                            <span>Sewa: {formatRupiah(item.hargaSewa)} / hari</span>
                          ) : (
                            <span className="text-slate-400">Tarif: Free</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onBookItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#E30000] hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm group-hover:bg-[#E30000] group-hover:text-white"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Booking</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
