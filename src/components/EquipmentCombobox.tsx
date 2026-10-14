import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Box, Layers, Image as ImageIcon } from 'lucide-react';
import { InventarisItem } from '../types/inventory';
import { formatDriveImageUrl, getBrandBannerConfig } from '../lib/imageUtils';
import { BrandAssetBanner } from './common/BrandAssetBanner';

interface EquipmentComboboxProps {
  items: InventarisItem[];
  selectedId: string;
  onSelect: (item: InventarisItem) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  otherSelectedIds?: string[]; // IDs already selected in other rows
}

export const EquipmentCombobox: React.FC<EquipmentComboboxProps> = ({
  items,
  selectedId,
  onSelect,
  disabled = false,
  placeholder = 'Ketik nama alat, kategori, atau ID...',
  className = '',
  otherSelectedIds = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedItem = useMemo(() => {
    return items.find(i => i.id === selectedId) || null;
  }, [items, selectedId]);

  // Unique categories for quick category filter chips
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(i => {
      if (i.kategori) set.add(i.kategori);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filter items by search query and category
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter(item => {
      if (categoryFilter !== 'all' && item.kategori !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      const matchName = (item.namaBarang || '').toLowerCase().includes(q);
      const matchCat = (item.kategori || '').toLowerCase().includes(q);
      const matchId = (item.id || '').toLowerCase().includes(q);
      const matchKet = (item.keterangan || '').toLowerCase().includes(q);
      const matchNoSeri = (item.noSeri || '').toLowerCase().includes(q);
      return matchName || matchCat || matchId || matchKet || matchNoSeri;
    });
  }, [items, searchQuery, categoryFilter]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered items change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredItems.length, categoryFilter]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearchQuery('');
  };

  const handleSelectItem = (item: InventarisItem) => {
    onSelect(item);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[highlightedIndex]) {
        handleSelectItem(filteredItems[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('kamera')) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    if (c.includes('lensa')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    if (c.includes('lighting') || c.includes('lampu')) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    if (c.includes('audio') || c.includes('mic')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (c.includes('drone')) return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  };

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      {/* Search Input Box */}
      <div 
        onClick={() => {
          if (!isOpen) {
            handleOpen();
            inputRef.current?.focus();
          }
        }}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all cursor-pointer bg-white dark:bg-[#0F172A] ${
          isOpen 
            ? 'border-[#E30000] ring-2 ring-red-500/20 shadow-sm' 
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Left Icon / Thumbnail */}
        {selectedItem?.fotoUrl ? (
          (() => {
            const brandConfig = getBrandBannerConfig(selectedItem.fotoUrl);
            if (brandConfig) {
              return (
                <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                  <BrandAssetBanner config={brandConfig} mode="compact" />
                </div>
              );
            }
            return (
              <img
                src={formatDriveImageUrl(selectedItem.fotoUrl, 100)}
                alt={selectedItem.namaBarang}
                className="w-6 h-6 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            );
          })()
        ) : (
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={isOpen ? searchQuery : (selectedItem ? `${selectedItem.namaBarang} (${selectedItem.kategori})` : '')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleOpen}
          onKeyDown={handleKeyDown}
          placeholder={selectedItem ? `${selectedItem.namaBarang} (${selectedItem.kategori})` : placeholder}
          className="flex-1 min-w-0 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-xs sm:text-sm font-semibold"
        />

        {/* Clear or Dropdown Chevron */}
        <div className="flex items-center gap-1 shrink-0">
          {isOpen && searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Bersihkan ketikan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
              if (!isOpen) inputRef.current?.focus();
            }}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            title="Buka saran peralatan"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#E30000]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown Suggestions Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 max-h-80 flex flex-col">
          {/* Header Info & Category Quick Filter Chips */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1E293B]/70 space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium">
              <span>{filteredItems.length} saran alat ditemukan</span>
              {searchQuery && <span className="text-[#E30000] font-semibold">Filter: "{searchQuery}"</span>}
            </div>

            {/* Category horizontal scroll chips */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-[#E30000] text-white font-bold'
                      : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Semua ({items.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
                      categoryFilter === cat
                        ? 'bg-[#E30000] text-white font-bold'
                        : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions List */}
          <div ref={listRef} className="overflow-y-auto max-h-60 p-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-1">
                <Box className="w-7 h-7 mx-auto opacity-50 mb-1" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Tidak ditemukan alat yang cocok
                </p>
                <p className="text-[11px] text-slate-400">
                  Coba ketik kata kunci lain atau pilih kategori 'Semua'.
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                      inputRef.current?.focus();
                    }}
                    className="mt-2 text-xs font-bold text-[#E30000] hover:underline"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = item.id === selectedId;
                const isHighlighted = idx === highlightedIndex;
                const isUsedInOtherRow = otherSelectedIds.includes(item.id) && !isSelected;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`p-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-50 dark:bg-red-950/30'
                        : isHighlighted
                        ? 'bg-slate-100 dark:bg-[#1E293B]'
                        : 'hover:bg-slate-50 dark:hover:bg-[#1E293B]/50'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.fotoUrl ? (
                        (() => {
                          const brandConfig = getBrandBannerConfig(item.fotoUrl);
                          if (brandConfig) {
                            return <BrandAssetBanner config={brandConfig} mode="compact" />;
                          }
                          return (
                            <img
                              src={formatDriveImageUrl(item.fotoUrl, 100)}
                              alt={item.namaBarang}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          );
                        })()
                      ) : (
                        <Box className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    {/* Equipment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected ? 'text-[#E30000] dark:text-red-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {item.namaBarang}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getCategoryColor(item.kategori)}`}>
                          {item.kategori}
                        </span>
                        {isUsedInOtherRow && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                            Sudah di baris lain
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Total: <strong className="text-slate-700 dark:text-slate-200">{item.qtyTotal} {item.satuan}</strong></span>
                        {item.kondisiAlat && (
                          <span>Kondisi: <span className="font-medium">{item.kondisiAlat}</span></span>
                        )}
                        {item.lokasiSimpan && (
                          <span className="hidden sm:inline">Lokasi: {item.lokasiSimpan}</span>
                        )}
                      </div>
                    </div>

                    {/* Check icon if selected */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#E30000] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
