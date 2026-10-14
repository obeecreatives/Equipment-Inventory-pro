import React, { useState } from 'react';
import { X, Save, Box, Image as ImageIcon, CheckCircle2, AlertTriangle, Folder, HelpCircle, ExternalLink, Sparkles, Trash2, ZoomIn } from 'lucide-react';
import { InventarisItem, KondisiAlat } from '../../types/inventory';
import { formatDriveImageUrl, isGoogleDriveFolder, extractDriveFileId } from '../../lib/imageUtils';
import { ImageInspectorModal } from './ImageInspectorModal';

interface ItemModalProps {
  item: InventarisItem | null;
  onClose: () => void;
  onSave: (item: Partial<InventarisItem>) => void;
  onDelete?: (itemId: string) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onClose, onSave, onDelete }) => {
  const isEdit = !!item?.id;
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [showPreviewInspector, setShowPreviewInspector] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang?.trim() || !formData.kategori?.trim()) return;
    
    // Otomatis optimasi jika menggunakan link Google Drive
    const cleanFoto = formData.fotoUrl?.trim() ? formatDriveImageUrl(formData.fotoUrl.trim()) : '';
    
    onSave({
      ...formData,
      fotoUrl: cleanFoto
    });
    onClose();
  };

  const currentUrl = (formData.fotoUrl || '').trim();
  const isFolder = isGoogleDriveFolder(currentUrl);
  const driveFileId = extractDriveFileId(currentUrl);
  const previewImgSrc = formatDriveImageUrl(currentUrl, 400);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
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
          {/* Photo URL & Live Preview */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1E293B] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>URL Foto Alat (Thumbnail Kartu)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowDriveGuide(!showDriveGuide)}
                className="text-[11px] font-semibold text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Panduan Link Google Drive</span>
              </button>
            </div>

            <div className="flex gap-2.5 items-center">
              <input
                type="url"
                value={formData.fotoUrl || ''}
                onChange={e => handleChange('fotoUrl', e.target.value)}
                placeholder="https://... (Link Foto Google Drive, Imgur, atau Web)"
                className="flex-1 px-3 py-1.5 rounded-lg text-xs border bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />

              {/* Live Preview Box with Click-to-Inspect */}
              <div 
                onClick={() => {
                  if (previewImgSrc && !isFolder) {
                    setShowPreviewInspector(true);
                  }
                }}
                className={`w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 relative group/box ${
                  previewImgSrc && !isFolder ? 'cursor-zoom-in' : ''
                }`}
                title={previewImgSrc && !isFolder ? 'Klik untuk inspeksi gambar detail' : undefined}
              >
                {previewImgSrc && !isFolder ? (
                  <>
                    <img
                      src={previewImgSrc}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover/box:scale-110 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/box:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </div>
                  </>
                ) : (
                  <ImageIcon className="w-5 h-5 opacity-50" />
                )}
              </div>
            </div>

            {/* Folder Warning Box */}
            {isFolder && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Ini adalah Link Folder Google Drive!</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Folder berisi kumpulan banyak file sehingga tidak bisa langsung ditampilkan sebagai foto.
                  <br />
                  <strong>Cara perbaiki:</strong> Buka folder tersebut &gt; Klik kanan pada salah satu file foto &gt; Pilih <strong>"Salin link" (Copy link)</strong> &gt; Tempel link file tersebut di sini.
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

            {/* Auto Google Drive CDN Success Badge */}
            {driveFileId && !isFolder && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Trik CDN Google Drive Aktif! Link otomatis diubah menjadi resolusi cepat &amp; ringan.</span>
              </div>
            )}

            {/* Guide Accordion */}
            {showDriveGuide && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <div className="font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#E30000]" />
                  <span>3 Langkah Mudah Pasang Foto dari Google Drive:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <li>
                    <strong>Atur Akses Publik:</strong> Di Google Drive, klik kanan folder/file &gt; <em>Bagikan (Share)</em> &gt; ubah Akses Umum menjadi <strong>"Siapa saja yang memiliki link" (Anyone with the link)</strong>.
                  </li>
                  <li>
                    <strong>Ambil Link File Foto (Bukan Folder):</strong> Masuk ke dalam folder, klik kanan pada <em>file foto alat yang bersangkutan</em> &gt; pilih <strong>"Salin link" (Copy link)</strong>.
                  </li>
                  <li>
                    <strong>Tempel di sini:</strong> Paste link file tersebut ke kolom di atas. Sistem kami otomatis mengonversinya menjadi URL CDN Google berkecepatan tinggi!
                  </li>
                </ol>
              </div>
            )}

            <p className="text-[10.5px] text-slate-400">
              * Kru dapat mengenali peralatan secara instan melalui foto di kartu dan daftar inventaris.
            </p>
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
