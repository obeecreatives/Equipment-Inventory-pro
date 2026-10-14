import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Folder,
  Palette,
  Video,
  FileCode2,
  Check,
  Copy,
  Edit2,
  Layers,
  MapPin,
  Tag
} from 'lucide-react';
import { InventarisItem, KondisiAlat } from '../../types/inventory';
import { detectAssetType, downloadAssetImage, getDriveThumbnailFallbackUrl } from '../../lib/imageUtils';

interface ImageInspectorModalProps {
  item: InventarisItem;
  isOpen: boolean;
  onClose: () => void;
  onEditItem?: (item: InventarisItem) => void;
  canEdit?: boolean;
  itemsList?: InventarisItem[];
  onNavigateItem?: (item: InventarisItem) => void;
}

export const ImageInspectorModal: React.FC<ImageInspectorModalProps> = ({
  item,
  isOpen,
  onClose,
  onEditItem,
  canEdit = false,
  itemsList = [],
  onNavigateItem
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);

  // Analisis format aset (Drive, Canva, Figma, CapCut, Direct)
  const assetInfo = detectAssetType(item.fotoUrl);

  // Reset zoom & pan when item changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setImgLoaded(false);
      setImgError(false);
    }
  }, [isOpen, item.id]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 3.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => {
      const next = Math.max(Number((prev - 0.25).toFixed(2)), 1);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleToggleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      handleReset();
    } else {
      setZoom(2);
    }
  }, [zoom, handleReset]);

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'ArrowRight' && onNavigateItem && itemsList.length > 1) {
        e.preventDefault();
        const currentIndex = itemsList.findIndex(i => i.id === item.id);
        if (currentIndex !== -1 && currentIndex < itemsList.length - 1) {
          onNavigateItem(itemsList[currentIndex + 1]);
        }
      } else if (e.key === 'ArrowLeft' && onNavigateItem && itemsList.length > 1) {
        e.preventDefault();
        const currentIndex = itemsList.findIndex(i => i.id === item.id);
        if (currentIndex > 0) {
          onNavigateItem(itemsList[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleZoomIn, handleZoomOut, handleReset, onClose, item.id, itemsList, onNavigateItem]);

  // Wheel zoom with passive: false to allow e.preventDefault()
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom(prev => Math.min(Number((prev + 0.2).toFixed(2)), 3.5));
      } else {
        setZoom(prev => {
          const next = Math.max(Number((prev - 0.2).toFixed(2)), 1);
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isOpen]);

  // Mouse drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pinch and pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDistRef.current;
      const newZoom = Math.min(Math.max(touchStartZoomRef.current * factor, 1), 3.5);
      setZoom(Number(newZoom.toFixed(2)));
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
    setIsDragging(false);
  };

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Copy link
  const handleCopyLink = () => {
    if (!item.fotoUrl) return;
    navigator.clipboard.writeText(item.fotoUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Download high res asset
  const handleDownload = async () => {
    if (!item.fotoUrl) return;
    setIsDownloading(true);
    const targetUrl = assetInfo.highResImageUrl || item.fotoUrl;
    const safeFilename = `${item.namaBarang.replace(/[^a-zA-Z0-9_-]/g, '_')}_foto.jpg`;
    await downloadAssetImage(targetUrl, safeFilename);
    setIsDownloading(false);
  };

  // Navigation indices
  const currentIndex = itemsList.findIndex(i => i.id === item.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < itemsList.length - 1;

  if (!isOpen) return null;

  const getKondisiBadgeClass = (kondisi: KondisiAlat) => {
    switch (kondisi) {
      case 'Baik':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Perlu Servis':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Rusak':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Hilang':
        return 'bg-red-600/30 text-red-300 border-red-500/50';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md text-white select-none overflow-hidden animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      {/* TOP HEADER TOOLBAR */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Item Information */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[220px] sm:max-w-md" title={item.namaBarang}>
                {item.namaBarang}
              </h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getKondisiBadgeClass(item.kondisiAlat)}`}>
                {item.kondisiAlat}
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${assetInfo.badgeColor}`}>
                {assetInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 truncate">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-500" />
                {item.kategori}
              </span>
              {item.noSeri && (
                <span className="font-mono text-slate-400">
                  SN: {item.noSeri}
                </span>
              )}
              {item.lokasiSimpan && (
                <span className="hidden md:flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3 h-3 text-[#E30000]" />
                  {item.lokasiSimpan}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom Controls */}
          {assetInfo.isImageDisplayable && (
            <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/80">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Perkecil Zoom (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 text-xs font-mono font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
                title="Klik untuk Reset ke 100%"
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3.5}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Perbesar Zoom (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70 transition-colors cursor-pointer ml-0.5 border-l border-slate-700/80 pl-1.5"
                title="Reset Ukuran (Fit)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick External Open Button */}
          {assetInfo.originalUrl && (
            <a
              href={assetInfo.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Buka File / Desain Asli di Tab Baru"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden lg:inline">Buka Asli</span>
            </a>
          )}

          {/* Download Button */}
          {assetInfo.isImageDisplayable && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Download Gambar Resolusi Penuh"
            >
              <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span className="hidden lg:inline">Download</span>
            </button>
          )}

          {/* Edit Data Alat Shortcut (if admin) */}
          {canEdit && onEditItem && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditItem(item);
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-[#E30000] text-slate-300 hover:text-white border border-slate-700/80 hover:border-[#E30000] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Edit Data Peralatan"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Data</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-colors cursor-pointer ml-1"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT / CANVAS */}
      <main
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleToggleDoubleClick}
        className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-8 ${
          zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }}
      >
        {/* Previous Button */}
        {hasPrev && onNavigateItem && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateItem(itemsList[currentIndex - 1]);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-white hover:text-slate-950 text-white border border-slate-700 shadow-2xl transition-all cursor-pointer backdrop-blur-md"
            title="Alat Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {hasNext && onNavigateItem && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateItem(itemsList[currentIndex + 1]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/80 hover:bg-white hover:text-slate-950 text-white border border-slate-700 shadow-2xl transition-all cursor-pointer backdrop-blur-md"
            title="Alat Selanjutnya (Panah Kanan)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* DISPLAY 1: INTERACTIVE DESIGN WORKSPACE (Canva, Figma, CapCut, Drive Folder) */}
        {assetInfo.isInteractiveCanvas || assetInfo.type === 'gdrive-folder' ? (
          <div className="max-w-lg w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 text-center shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center border shadow-inner">
              {assetInfo.type === 'canva' && (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#00C4CC] to-[#7D2AE8] flex items-center justify-center text-white">
                  <Palette className="w-8 h-8" />
                </div>
              )}
              {assetInfo.type === 'figma' && (
                <div className="w-full h-full rounded-2xl bg-[#0F172A] border-slate-700 flex items-center justify-center text-[#F24E1E]">
                  <FileCode2 className="w-8 h-8" />
                </div>
              )}
              {assetInfo.type === 'capcut' && (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-rose-500 to-slate-900 flex items-center justify-center text-white">
                  <Video className="w-8 h-8" />
                </div>
              )}
              {assetInfo.type === 'gdrive-folder' && (
                <div className="w-full h-full rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Folder className="w-8 h-8" />
                </div>
              )}
            </div>

            <div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${assetInfo.badgeColor} inline-block mb-2`}>
                {assetInfo.label}
              </span>
              <h3 className="text-xl font-extrabold text-white">
                {item.namaBarang}
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {assetInfo.type === 'canva' &&
                  'Aset ini terhubung langsung ke Lembar Kerja Desain Canva. Anda dapat memeriksa mockup, poster, atau revisi tata letak langsung di Canva.'}
                {assetInfo.type === 'figma' &&
                  'Aset ini merupakan file desain prototipe/vektor Figma. Anda dapat memeriksa komponen dan style guide langsung di kanvas Figma.'}
                {assetInfo.type === 'capcut' &&
                  'Aset ini adalah proyek timeline video CapCut. Anda dapat memutar atau meninjau potongan video langsung di CapCut.'}
                {assetInfo.type === 'gdrive-folder' &&
                  'Tautan ini mengarah ke Folder Google Drive berisi kumpulan dokumentasi foto atau video.'}
              </p>
            </div>

            {/* URL Box & Copy */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs font-mono text-slate-300">
              <span className="truncate flex-1 pl-2">{assetInfo.originalUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                title="Salin Tautan"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-sans">{copiedLink ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            {/* Primary Action Button */}
            <a
              href={assetInfo.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Buka Lembar Kerja Desain</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : assetInfo.isImageDisplayable ? (
          /* DISPLAY 2: HIGH RESOLUTION IMAGE WITH SMOOTH PAN & ZOOM */
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`
            }}
          >
            {/* Loading indicator */}
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-[#E30000] border-t-transparent animate-spin" />
                <span className="text-xs font-semibold">Memuat Gambar Detail...</span>
              </div>
            )}

            <img
              src={assetInfo.highResImageUrl || item.fotoUrl}
              alt={item.namaBarang}
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                // Try fallback Google Drive thumbnail if direct cdn fails
                if (assetInfo.type === 'gdrive' && item.fotoUrl) {
                  const fallback = getDriveThumbnailFallbackUrl(item.fotoUrl, 1600);
                  if (fallback && (e.target as HTMLImageElement).src !== fallback) {
                    (e.target as HTMLImageElement).src = fallback;
                    return;
                  }
                }
                setImgError(true);
              }}
              className={`max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl transition-opacity duration-200 select-none pointer-events-none ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              draggable={false}
            />

            {/* Error Fallback */}
            {imgError && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-sm space-y-3">
                <Layers className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="font-bold text-white text-sm">Tidak dapat memuat pratinjau gambar</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Link gambar mungkin bersifat privat atau diblokir oleh kebijakan keamanan server.
                </p>
                {assetInfo.originalUrl && (
                  <a
                    href={assetInfo.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                  >
                    <span>Buka Tautan Langsung</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          /* DISPLAY 3: NO IMAGE AVAILABLE */
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md space-y-3">
            <Layers className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">{item.namaBarang}</h3>
            <p className="text-xs text-slate-400">
              Belum ada foto yang disematkan untuk peralatan ini. Tambahkan link foto Google Drive atau URL web melalui tombol Edit.
            </p>
            {canEdit && onEditItem && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditItem(item);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Tambahkan Foto Alat</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* BOTTOM CONTROL / SHORTCUT BAR */}
      <footer className="h-12 px-4 sm:px-6 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between gap-4 text-[11px] text-slate-400 shrink-0 z-20">
        {/* Left: Keyboard Shortcuts Tips */}
        <div className="hidden sm:flex items-center gap-3 overflow-x-auto">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">Esc</kbd>
            Tutup
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">+</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">-</kbd>
            Zoom
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">0</kbd>
            Reset
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">Scroll / Drag</kbd>
            Geser &amp; Telusuri Detail
          </span>
          {itemsList.length > 1 && (
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">←</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">→</kbd>
              Pindah Alat
            </span>
          )}
        </div>

        {/* Right: Counter & Status */}
        <div className="flex items-center gap-3 ml-auto">
          {itemsList.length > 1 && currentIndex !== -1 && (
            <span className="font-mono text-slate-400">
              Alat {currentIndex + 1} dari {itemsList.length}
            </span>
          )}
          <span className="text-slate-500 hidden md:inline">
            Smart Image Inspector • Obee Creatives
          </span>
        </div>
      </footer>
    </div>
  );
};
