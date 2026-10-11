import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Bookmark, 
  MapPin, 
  AlertCircle, 
  LayoutGrid, 
  List, 
  Camera, 
  Mic, 
  Headphones, 
  Volume2, 
  Tv, 
  Laptop, 
  Sliders, 
  Layers, 
  Image as ImageIcon
} from 'lucide-react';
import { InventarisItem, KondisiAlat, Role } from '../types/inventory';
import { formatRupiah } from '../lib/dateUtils';
import { getViewMode, setViewMode } from '../lib/storage';
import { formatDriveImageUrl } from '../lib/imageUtils';

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
  const [viewMode, setViewModeState] = useState<'grid' | 'compact'>(() => getViewMode());

  const canEdit = currentRole === 'Admin' || currentRole === 'Project Manager' || currentRole === 'Site Engineer';
  const showFinancials = currentRole === 'Admin' || currentRole === 'Project Manager';

  const handleToggleViewMode = (mode: 'grid' | 'compact') => {
    setViewModeState(mode);
    setViewMode(mode);
  };

  // Daftar kategori unik
  const kategoriList = useMemo(() => {
    return Array.from(new Set(items.map(i => i.kategori).filter(Boolean))).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = (search || '').toLowerCase().trim();

    return items.filter(i => {
      if (!i) return false;

      const nama = String(i.namaBarang || '').toLowerCase();
      const kat = String(i.kategori || '').toLowerCase();
      const seri = String(i.noSeri || '').toLowerCase();
      const lok = String(i.lokasiSimpan || '').toLowerCase();
      const ket = String(i.keterangan || '').toLowerCase();

      const matchSearch =
        !q ||
        nama.includes(q) ||
        kat.includes(q) ||
        seri.includes(q) ||
        lok.includes(q) ||
        ket.includes(q);

      const matchKategori = selectedKategori === 'all' || String(i.kategori || '') === selectedKategori;
      const matchKondisi = selectedKondisi === 'all' || String(i.kondisiAlat || '') === selectedKondisi;

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

  const getCategoryFallbackIcon = (kategori: string) => {
    const k = kategori.toUpperCase();
    if (k.includes('KAMERA') || k.includes('LENSA')) return Camera;
    if (k.includes('MIC') || k.includes('CLIP')) return Mic;
    if (k.includes('HEADPHONE')) return Headphones;
    if (k.includes('SPEAKER') || k.includes('SOUND')) return Volume2;
    if (k.includes('MONITOR')) return Tv;
    if (k.includes('LAPTOP') || k.includes('TAB')) return Laptop;
    if (k.includes('MIXER') || k.includes('MIDI')) return Sliders;
    return Layers;
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

        {/* Filter Dropdowns & View Mode */}
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

          {/* Toggle View Mode (Grid Foto vs Kompak) */}
          <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A]">
            <button
              onClick={() => handleToggleViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1E293B] text-[#E30000] shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Mode Visual (Tampilkan Foto Alat)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToggleViewMode('compact')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-[#1E293B] text-[#E30000] shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Mode Kompak (Ringkas & Hemat Kuota)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

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

              {/* Items Display */}
              {viewMode === 'grid' ? (
                /* GRID MODE WITH PHOTO THUMBNAILS */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {list.map(item => {
                    const FallbackIcon = getCategoryFallbackIcon(item.kategori);

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group overflow-hidden"
                      >
                        <div>
                          {/* Image Thumbnail Container (Lazy Loaded & Responsive) */}
                          <div className="relative w-full aspect-16/9 bg-slate-100 dark:bg-[#0F172A] overflow-hidden border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-center">
                            {item.fotoUrl ? (
                              <img
                                src={formatDriveImageUrl(item.fotoUrl, 800)}
                                alt={item.namaBarang}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  // Fallback gracefully to icon placeholder if image fails to load
                                  (e.target as HTMLElement).style.display = 'none';
                                  const fallbackEl = (e.target as HTMLElement).nextElementSibling;
                                  if (fallbackEl) (fallbackEl as HTMLElement).style.display = 'flex';
                                }}
                              />
                            ) : null}

                            {/* Fallback Icon Box if no fotoUrl or load failed */}
                            <div 
                              className={`w-full h-full flex flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 bg-linear-to-br from-slate-100 to-slate-200 dark:from-[#0F172A] dark:to-[#1E293B] ${item.fotoUrl ? 'hidden' : 'flex'}`}
                            >
                              <FallbackIcon className="w-8 h-8 opacity-60 text-slate-400 group-hover:text-[#E30000] transition-colors" />
                              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                                {item.kategori}
                              </span>
                            </div>

                            {/* Status Tag Overlay on Image */}
                            <div className="absolute top-2.5 left-2.5">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm border ${getKondisiBadge(item.kondisiAlat)}`}>
                                {item.kondisiAlat}
                              </span>
                            </div>

                            {/* Qty Badge on Image */}
                            <div className="absolute top-2.5 right-2.5">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-sm">
                                {item.qtyTotal} {item.satuan}
                              </span>
                            </div>
                          </div>

                          {/* Card Content Body */}
                          <div className="p-4 pb-2">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
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
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer shrink-0"
                                  title="Edit Data & Foto Alat"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Location & Tags */}
                            {item.lokasiSimpan && (
                              <div className="mb-2">
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 border border-slate-200 dark:border-slate-800">
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  <span className="truncate max-w-[180px]">{item.lokasiSimpan}</span>
                                </span>
                              </div>
                            )}

                            {/* Description */}
                            {item.keterangan && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                {item.keterangan}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom Pricing & Booking Action */}
                        <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
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
                    );
                  })}
                </div>
              ) : (
                /* COMPACT MODE FOR LOW BANDWIDTH */
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 overflow-hidden">
                  {list.map(item => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Small Avatar Thumbnail */}
                        <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.fotoUrl ? (
                            <img src={formatDriveImageUrl(item.fotoUrl, 200)} alt={item.namaBarang} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {item.namaBarang}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                            <span>{item.qtyTotal} {item.satuan}</span>
                            <span>•</span>
                            <span className={`px-1.5 py-0.2 rounded-full border text-[10px] font-semibold ${getKondisiBadge(item.kondisiAlat)}`}>
                              {item.kondisiAlat}
                            </span>
                            {item.lokasiSimpan && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[120px]">{item.lokasiSimpan}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.hargaSewa > 0 ? formatRupiah(item.hargaSewa) : 'Free'}
                          </div>
                          {showFinancials && (
                            <div className="text-[10.5px] text-slate-400">
                              {formatRupiah(item.hargaPerolehan)}
                            </div>
                          )}
                        </div>

                        {canEdit && (
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onBookItem(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#E30000] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Booking
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
