import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Sun,
  Moon,
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
  Image as ImageIcon,
  Bookmark,
  ZoomIn,
  ClipboardCheck,
  Plus,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { InventarisItem, PublicBookingSlot } from '../../types/inventory';
import { fetchPublicPortalData } from '../../lib/gasClient';
import { SEED_INVENTARIS } from '../../lib/storage';
import { formatRupiah } from '../../lib/dateUtils';
import { formatDriveImageUrl, getBrandBannerConfig } from '../../lib/imageUtils';
import { BrandAssetBanner } from '../common/BrandAssetBanner';
import { ImageInspectorModal } from '../modals/ImageInspectorModal';
import { PublicBookingModal, PublicBookingReceipt } from './PublicBookingModal';
import { PublicStatusModal } from './PublicStatusModal';

interface PublicPortalProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({ theme, onToggleTheme }) => {
  const [inventaris, setInventaris] = useState<InventarisItem[]>(() =>
    SEED_INVENTARIS.filter(i => i.kondisiAlat === 'Baik').map(i => ({
      ...i,
      noSeri: '',
      hargaPerolehan: 0,
      lokasiSimpan: ''
    }))
  );
  const [bookingSlots, setBookingSlots] = useState<PublicBookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  const [inspectingItem, setInspectingItem] = useState<InventarisItem | null>(null);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingPresetItems, setBookingPresetItems] = useState<InventarisItem[]>([]);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [localReceipts, setLocalReceipts] = useState<PublicBookingReceipt[]>([]);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchPublicPortalData();
      if (data.ok && data.inventaris) {
        setInventaris(data.inventaris.filter(i => i.kondisiAlat === 'Baik'));
        setBookingSlots(data.bookingSlots || []);
      }
    } catch (err) {
      console.warn('Public catalog sync fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const kategoriList = useMemo(() => {
    return Array.from(new Set(inventaris.map(i => i.kategori).filter(Boolean))).sort();
  }, [inventaris]);

  const filteredItems = useMemo(() => {
    return inventaris.filter(item => {
      if (selectedKategori !== 'all' && item.kategori !== selectedKategori) return false;
      if (search) {
        const q = search.toLowerCase().trim();
        const matchName = String(item.namaBarang || '').toLowerCase().includes(q);
        const matchCat = String(item.kategori || '').toLowerCase().includes(q);
        const matchKet = String(item.keterangan || '').toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchKet) return false;
      }
      return true;
    });
  }, [inventaris, selectedKategori, search]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, InventarisItem[]> = {};
    filteredItems.forEach(item => {
      const cat = item.kategori || 'Lainnya';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredItems]);

  const getCategoryFallbackIcon = (kategori: string) => {
    const k = String(kategori || '').toLowerCase();
    if (k.includes('kamera') || k.includes('lensa') || k.includes('gimbal')) return Camera;
    if (k.includes('mic') || k.includes('audio')) return Mic;
    if (k.includes('headphone') || k.includes('intercom')) return Headphones;
    if (k.includes('speaker') || k.includes('sound')) return Volume2;
    if (k.includes('tv') || k.includes('monitor') || k.includes('proyektor')) return Tv;
    if (k.includes('laptop') || k.includes('komputer') || k.includes('pc')) return Laptop;
    if (k.includes('mixer') || k.includes('switcher')) return Sliders;
    return Layers;
  };

  const togglePackageItem = (itemId: string) => {
    setSelectedPackageIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleOpenBookSingle = (item: InventarisItem) => {
    setBookingPresetItems([item]);
    setShowBookingModal(true);
  };

  const handleOpenBookSelected = () => {
    const items = inventaris.filter(i => selectedPackageIds.includes(i.id));
    setBookingPresetItems(items);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (receipt: PublicBookingReceipt) => {
    setLocalReceipts(prev => [receipt, ...prev]);
    setSelectedPackageIds([]);
    loadCatalog();
  };

  const renderCardImage = (item: InventarisItem) => {
    const FallbackIcon = getCategoryFallbackIcon(item.kategori);
    if (!item.fotoUrl) {
      return (
        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
          <FallbackIcon className="w-10 h-10 mb-1 opacity-50" />
          <span className="text-[11px] font-medium opacity-70">{item.kategori}</span>
        </div>
      );
    }

    const brandConfig = getBrandBannerConfig(item.fotoUrl);
    if (brandConfig) {
      return <BrandAssetBanner config={brandConfig} mode="card" />;
    }

    return (
      <img
        src={formatDriveImageUrl(item.fotoUrl, 600)}
        alt={item.namaBarang}
        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={e => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
      {/* Clean 3-Zone Top Bar */}
      <header className="w-full sticky top-0 z-40 border-b bg-white dark:bg-[#070D19] border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#E30000] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              O
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                obee<span className="text-[#E30000]">creatives</span>
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-slate-400">
                / Portal Booking Alat
              </span>
            </div>
          </div>

          {/* Zone 2 & 3: Utility + Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ClipboardCheck className="w-4 h-4 text-sky-500" />
              <span>Cek Status</span>
            </button>

            <button
              type="button"
              onClick={loadCatalog}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Muat ulang stok katalog"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#E30000]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <button
              type="button"
              onClick={handleOpenBookSelected}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Bookmark className="w-4 h-4" />
              <span>
                Booking Alat{selectedPackageIds.length > 0 ? ` (${selectedPackageIds.length})` : ''}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 pb-16">
        {/* Intro & Search Filter Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Katalog &amp; Booking Alat Produksi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih peralatan untuk proyek Eksternal atau Freelancer obeecreatives, lalu cek ketersediaan sesuai tanggal.
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
              {filteredItems.length} alat siap pakai
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari kamera, lensa, mic, lighting, atau kategori..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E30000]"
              />
            </div>

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

              <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A]">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#1E293B] text-[#E30000] shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Mode Grid Visual"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'compact'
                      ? 'bg-white dark:bg-[#1E293B] text-[#E30000] shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Mode Daftar Kompak"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Multi-Item Banner */}
        {selectedPackageIds.length > 0 && (
          <div className="p-3.5 rounded-2xl border border-[#E30000]/30 bg-red-500/5 dark:bg-red-500/10 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              <span className="font-extrabold text-[#E30000]">{selectedPackageIds.length} alat</span> dipilih untuk diajukan sekaligus dalam satu formulir booking.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPackageIds([])}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
              >
                Kosongkan
              </button>
              <button
                type="button"
                onClick={handleOpenBookSelected}
                className="px-4 py-1.5 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Lanjut Booking ({selectedPackageIds.length})
              </button>
            </div>
          </div>
        )}

        {/* Catalog List */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Tidak ada alat yang cocok</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Coba ubah kata kunci pencarian atau pilih kategori lain.
            </p>
          </div>
        ) : (
          Object.keys(groupedItems)
            .sort()
            .map(kategori => {
              const list = groupedItems[kategori];
              return (
                <section key={kategori} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 rounded-full bg-[#E30000]" />
                    <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-slate-900 dark:text-white">
                      {kategori}
                    </h2>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                      ({list.length} item)
                    </span>
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                      {list.map(item => {
                        const isPicked = selectedPackageIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className={`rounded-2xl border bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden ${
                              isPicked
                                ? 'border-[#E30000] ring-1 ring-[#E30000]/30'
                                : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div>
                              {/* Cover Image */}
                              <div
                                onClick={() => setInspectingItem(item)}
                                className="relative w-full aspect-16/9 bg-slate-100 dark:bg-[#0F172A] overflow-hidden border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-center cursor-zoom-in group/img"
                                title="Klik untuk periksa detail foto alat"
                              >
                                {renderCardImage(item)}

                                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 text-white pointer-events-none z-10">
                                  <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
                                    <ZoomIn className="w-5 h-5 text-white" />
                                  </div>
                                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/20 text-white">
                                    Klik untuk periksa detail
                                  </span>
                                </div>

                                <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/20 shadow-sm tabular-nums">
                                    {item.qtyTotal} {item.satuan}
                                  </span>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="p-4 pb-2 space-y-1.5">
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                  <span>{item.kategori}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Siap Pakai</span>
                                </div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white truncate" title={item.namaBarang}>
                                  {item.namaBarang}
                                </h3>
                                {item.keterangan && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {item.keterangan}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Footer Pricing & Actions */}
                            <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                                {item.hargaSewa > 0 ? `${formatRupiah(item.hargaSewa)} / hari` : 'Tarif by Admin'}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => togglePackageItem(item.id)}
                                  className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                                    isPicked
                                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                  title={isPicked ? 'Hapus dari pilihan paket' : 'Tambah ke paket multi-alat'}
                                >
                                  {isPicked ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenBookSingle(item)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#E30000] hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>Booking</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 overflow-hidden">
                      {list.map(item => {
                        const isPicked = selectedPackageIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                onClick={() => setInspectingItem(item)}
                                className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center cursor-zoom-in relative group/thumb"
                                title="Klik untuk periksa detail foto"
                              >
                                {item.fotoUrl ? (
                                  (() => {
                                    const brandConfig = getBrandBannerConfig(item.fotoUrl);
                                    if (brandConfig) {
                                      return <BrandAssetBanner config={brandConfig} mode="compact" />;
                                    }
                                    return (
                                      <img
                                        src={formatDriveImageUrl(item.fotoUrl, 200)}
                                        alt={item.namaBarang}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                      />
                                    );
                                  })()
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                  {item.namaBarang}
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-2 tabular-nums">
                                  <span>{item.qtyTotal} {item.satuan}</span>
                                  <span>·</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {item.hargaSewa > 0 ? `${formatRupiah(item.hargaSewa)} / hari` : 'Tarif by Admin'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => togglePackageItem(item.id)}
                                className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                                  isPicked
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Tambah ke paket"
                              >
                                {isPicked ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenBookSingle(item)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#E30000] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                              >
                                Booking
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })
        )}
      </main>

      {/* Modals */}
      {inspectingItem && (
        <ImageInspectorModal
          item={inspectingItem}
          isOpen={!!inspectingItem}
          onClose={() => setInspectingItem(null)}
          canEdit={false}
          hideInternalDetails={true}
          itemsList={filteredItems}
          onNavigateItem={newItem => setInspectingItem(newItem)}
        />
      )}

      {showBookingModal && (
        <PublicBookingModal
          presetItems={bookingPresetItems}
          inventaris={inventaris}
          bookingSlots={bookingSlots}
          onClose={() => {
            setShowBookingModal(false);
            setBookingPresetItems([]);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {showStatusModal && (
        <PublicStatusModal
          localReceipts={localReceipts}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
};
