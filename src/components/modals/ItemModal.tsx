import React, { useState, useRef } from 'react';
import { 
  X, Save, Box, Image as ImageIcon, CheckCircle2, AlertTriangle, 
  HelpCircle, ExternalLink, Sparkles, Trash2, ZoomIn, Upload, Link2, 
  RefreshCw, Check, Smartphone, Camera, FileImage, ArrowRight
} from 'lucide-react';
import { InventarisItem, KondisiAlat } from '../../types/inventory';
import { 
  formatDriveImageUrl, 
  isGoogleDriveFolder, 
  extractDriveFileId, 
  compressImageToWebP, 
  getBrandBannerConfig, 
  CompressionResult 
} from '../../lib/imageUtils';
import { BrandAssetBanner } from '../common/BrandAssetBanner';
import { ImageInspectorModal } from './ImageInspectorModal';

interface ItemModalProps {
  item: InventarisItem | null;
  onClose: () => void;
  onSave: (item: Partial<InventarisItem>) => void;
  onDelete?: (itemId: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onClose, onSave, onDelete }) => {
  const isEdit = !!item?.id;
  const initialUrl = (item?.fotoUrl || '').trim();
  const isInitialDataUrl = initialUrl.startsWith('data:image/');

  const [inputMode, setInputMode] = useState<'upload' | 'link'>(
    initialUrl && !isInitialDataUrl ? 'link' : 'upload'
  );
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [showPreviewInspector, setShowPreviewInspector] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<InventarisItem>>({
    id: item?.id || '',
    kategori: item?.kategori || 'KAMERA',
    namaBarang: item?.namaBarang || '',
    noSeri: item?.noSeri || '',
    satuan: item?.satuan || 'Pcs',
    qtyTotal: item?.qtyTotal || 1,
    hargaPerolehan: item?.hargaPerolehan || 0,
    hargaSewa: item?.hargaSewa || 0,
    lokasiSimpan: item?.lokasiSimpan || '',
    kondisiAlat: item?.kondisiAlat || 'Baik',
    keterangan: item?.keterangan || '',
    fotoUrl: item?.fotoUrl || ''
  });

  const handleChange = (field: keyof InventarisItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProcessFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      setIsCompressing(true);
      const result = await compressImageToWebP(file, 800, 800, 0.78);
      setCompressionStats(result);
      handleChange('fotoUrl', result.dataUrl);
    } catch (err) {
      console.error('Gagal mengompres gambar:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleProcessFile(file);
      setInputMode('upload');
    }
  };

  const handlePasteEvent = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleProcessFile(file);
          setInputMode('upload');
          break;
        }
      }
    }
  };

  const handleClearPhoto = () => {
    handleChange('fotoUrl', '');
    setCompressionStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang?.trim() || !formData.kategori?.trim()) return;
    
    // Otomatis optimasi jika menggunakan link Google Drive, biarkan WebP base64 dan external link apa adanya
    const cleanFoto = formData.fotoUrl?.trim() ? formatDriveImageUrl(formData.fotoUrl.trim()) : '';
    
    onSave({
      ...formData,
      fotoUrl: cleanFoto
    });
    onClose();
  };

  const currentUrl = (formData.fotoUrl || '').trim();
  const isWebPUpload = currentUrl.startsWith('data:image/');
  const brandConfig = getBrandBannerConfig(currentUrl);
  const isFolder = isGoogleDriveFolder(currentUrl);
  const driveFileId = extractDriveFileId(currentUrl);
  const previewImgSrc = formatDriveImageUrl(currentUrl, 400);

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onPaste={handlePasteEvent}
      >
      <div 
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E30000] text-white flex items-center justify-center font-bold">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {isEdit ? 'Edit Data Peralatan' : 'Tambah Peralatan Baru'}
              </h3>
              <p className="text-xs text-slate-400">Master inventaris, foto & nilai aset studio.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {/* Dual-Engine Photo System: Upload vs Link */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] space-y-3">
            {/* Header & Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#E30000]" />
                <span>Gambar & Sampul Alat</span>
              </label>

              {/* Mode Switcher */}
              <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A]">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-[#E30000] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload / Screenshot</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('link')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    inputMode === 'link'
                      ? 'bg-[#E30000] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                  <span>Tempel Link URL</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input for Gallery/Camera Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* TAB 1: UPLOAD & AUTO WEBP COMPRESSOR */}
            {inputMode === 'upload' && (
              <div className="space-y-2.5">
                {isWebPUpload ? (
                  /* State: Image Already Uploaded & Compressed */
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Foto WebP Berhasil Dipasang (~{compressionStats?.compressedSizeKb || '30'} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearPhoto}
                        className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setShowPreviewInspector(true)}
                        className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden border border-emerald-500/40 relative cursor-zoom-in shrink-0 group/box shadow-md"
                        title="Klik untuk inspeksi zoom & pan foto"
                      >
                        <img
                          src={currentUrl}
                          alt="Cover"
                          className="w-full h-full object-cover group-hover/box:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/box:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                          <ZoomIn className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 text-xs space-y-1">
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {compressionStats ? (
                            <>
                              Ukuran awal <strong>{compressionStats.originalSizeKb} KB</strong> dikompres menjadi <strong>{compressionStats.compressedSizeKb} KB</strong> ({compressionStats.savedPercentage}% lebih hemat).
                            </>
                          ) : (
                            'Format WebP mini siap disinkronkan ke Google Sheets tanpa membuat lembar kerja berat.'
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Ganti dengan Foto Lain</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* State: Dropzone / Picker */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                      isDragOver
                        ? 'border-[#E30000] bg-red-500/10'
                        : 'border-slate-300 dark:border-slate-700 hover:border-[#E30000] bg-white dark:bg-[#0F172A]'
                    }`}
                  >
                    {isCompressing ? (
                      <div className="py-3 flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                        <div className="w-6 h-6 border-2 border-[#E30000] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Mengompresi ke WebP mini (~30 KB)...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-[#E30000] flex items-center justify-center border border-red-200 dark:border-red-900/50 group-hover:scale-110 transition-transform">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Pilih Foto dari Galeri HP / Komputer
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Bisa screenshot dari Canva / CapCut lalu tempel (Ctrl+V) langsung di sini
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          ⚡ Otomatis Dikompresi WebP ~30KB (Ringan & Cepat)
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PASTE URL (DRIVE / CANVA / CAPCUT / FIGMA / WEB) */}
            {inputMode === 'link' && (
              <div className="space-y-2.5">
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={formData.fotoUrl || ''}
                    onChange={e => handleChange('fotoUrl', e.target.value)}
                    placeholder="https://... (Google Drive, Canva, CapCut, Figma, atau Web)"
                    className="flex-1 px-3 py-2 rounded-xl text-xs border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
                  />
                  {currentUrl && (
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Kosongkan link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Smart Brand Banner Live Preview */}
                {brandConfig && (
                  <div className="space-y-1.5">
                    <BrandAssetBanner config={brandConfig} mode="preview" />
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                      * Kartu akan otomatis menampilkan <strong>Smart Brand Banner</strong> dengan tombol 1-klik menuju lembar kerja. (Jika ingin ada thumbnail karya, Anda juga bisa mengunggah screenshot di tab <em>Upload / Screenshot</em>).
                    </p>
                  </div>
                )}

                {/* Google Drive Direct Image CDN Success */}
                {driveFileId && !isFolder && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        onClick={() => setShowPreviewInspector(true)}
                        className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden border border-emerald-500/40 relative cursor-zoom-in shrink-0"
                        title="Klik untuk periksa detail foto"
                      >
                        <img
                          src={previewImgSrc}
                          alt="Drive Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Google Drive CDN Otomatis Aktif</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                          File ID: {driveFileId} • Konversi resolusi cepat & tajam
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Image preview */}
                {!brandConfig && !driveFileId && currentUrl && !isWebPUpload && (
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
                    <div 
                      onClick={() => setShowPreviewInspector(true)}
                      className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-300 dark:border-slate-700 relative cursor-zoom-in shrink-0"
                      title="Klik untuk inspeksi zoom"
                    >
                      <img
                        src={currentUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Link gambar langsung terpasang. Klik kotak di samping untuk cek resolusi.
                    </div>
                  </div>
                )}

                {/* Google Drive Link Guide Toggle */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDriveGuide(!showDriveGuide)}
                    className="text-[11px] font-semibold text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Panduan Link Google Drive</span>
                  </button>
                </div>
              </div>
            )}

            {/* Folder Warning Box */}
            {isFolder && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Ini adalah Link Folder Google Drive!</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Folder berisi kumpulan banyak file sehingga tidak bisa langsung ditampilkan sebagai foto tunggal.
                  <br />
                  <strong>Saran:</strong> Buka folder &gt; Klik kanan file foto &gt; Pilih <strong>"Salin link" (Copy link)</strong> &gt; Tempel di sini.
                </p>
                {currentUrl.startsWith('http') && (
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-300 underline mt-1"
                  >
                    <span>Buka Folder di Tab Baru</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Drive Guide Accordion */}
            {showDriveGuide && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#E30000]" />
                  <span>3 Langkah Mudah Pasang Foto dari Google Drive:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li>
                    <strong>Atur Akses Publik:</strong> Di Google Drive, klik kanan file &gt; <em>Bagikan (Share)</em> &gt; ubah Akses Umum menjadi <strong>"Siapa saja yang memiliki link"</strong>.
                  </li>
                  <li>
                    <strong>Ambil Link File Foto (Bukan Folder):</strong> Klik kanan pada <em>file foto alat</em> &gt; pilih <strong>"Salin link" (Copy link)</strong>.
                  </li>
                  <li>
                    <strong>Tempel di sini:</strong> Tempel link file tersebut. Sistem otomatis mengubahnya menjadi CDN Google berkecepatan tinggi!
                  </li>
                </ol>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Nama Barang / Model *
            </label>
            <input
              type="text"
              required
              value={formData.namaBarang}
              onChange={e => handleChange('namaBarang', e.target.value)}
              placeholder="Contoh: SONY A6400"
              className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Kategori *
              </label>
              <input
                type="text"
                required
                value={formData.kategori}
                onChange={e => handleChange('kategori', e.target.value.toUpperCase())}
                placeholder="KAMERA, LENSA, MIC, dll."
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Nomor Seri (Serial No)
              </label>
              <input
                type="text"
                value={formData.noSeri}
                onChange={e => handleChange('noSeri', e.target.value)}
                placeholder="S01-4483893"
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Satuan
              </label>
              <input
                type="text"
                value={formData.satuan}
                onChange={e => handleChange('satuan', e.target.value)}
                placeholder="Pcs, Unit, Set"
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Qty Total *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formData.qtyTotal}
                onChange={e => handleChange('qtyTotal', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Kondisi
              </label>
              <select
                value={formData.kondisiAlat}
                onChange={e => handleChange('kondisiAlat', e.target.value as KondisiAlat)}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              >
                <option value="Baik">Baik</option>
                <option value="Perlu Servis">Perlu Servis</option>
                <option value="Rusak">Rusak</option>
                <option value="Hilang">Hilang</option>
                <option value="Dikeluarkan dari Aset">Dikeluarkan dari Aset</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Harga Perolehan (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={formData.hargaPerolehan}
                onChange={e => handleChange('hargaPerolehan', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
                Harga Sewa / Hari (Rp)
              </label>
              <input
                type="number"
                min={0}
                value={formData.hargaSewa}
                onChange={e => handleChange('hargaSewa', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Lokasi Simpan
            </label>
            <input
              type="text"
              value={formData.lokasiSimpan}
              onChange={e => handleChange('lokasiSimpan', e.target.value)}
              placeholder="Contoh: Etalase Box 1A, Rak Lighting, Dry Box"
              className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Keterangan / Kelengkapan
            </label>
            <textarea
              rows={2}
              value={formData.keterangan}
              onChange={e => handleChange('keterangan', e.target.value)}
              placeholder="Catatan lensa bawaan, baterai, dus, dll."
              className="w-full px-3 py-2 rounded-xl text-sm border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
            />
          </div>
        </form>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 bg-slate-50 dark:bg-[#070D19]">
          {isEdit && onDelete && item?.id ? (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Alat</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-[#E30000] hover:bg-[#DC2626] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Alat'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    {showPreviewInspector && (
      <ImageInspectorModal
        item={{
          id: formData.id || 'preview',
          namaBarang: formData.namaBarang || 'Pratinjau Foto Alat',
          kategori: formData.kategori || 'KAMERA',
          noSeri: formData.noSeri || '',
          satuan: formData.satuan || 'Pcs',
          qtyTotal: formData.qtyTotal || 1,
          hargaPerolehan: formData.hargaPerolehan || 0,
          hargaSewa: formData.hargaSewa || 0,
          lokasiSimpan: formData.lokasiSimpan || '',
          kondisiAlat: formData.kondisiAlat || 'Baik',
          keterangan: formData.keterangan || '',
          fotoUrl: formData.fotoUrl || ''
        }}
        isOpen={showPreviewInspector}
        onClose={() => setShowPreviewInspector(false)}
      />
    )}
  </>
);
};
