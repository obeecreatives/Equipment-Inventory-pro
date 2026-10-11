import React, { useState } from 'react';
import { X, Save, Box } from 'lucide-react';
import { InventarisItem, KondisiAlat } from '../../types/inventory';

interface ItemModalProps {
  item: InventarisItem | null;
  onClose: () => void;
  onSave: (item: Partial<InventarisItem>) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onClose, onSave }) => {
  const isEdit = !!item?.id;

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
    keterangan: item?.keterangan || ''
  });

  const handleChange = (field: keyof InventarisItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang?.trim() || !formData.kategori?.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
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
              <p className="text-xs text-slate-400">Master inventaris dan nilai aset studio.</p>
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

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50 dark:bg-[#070D19]">
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
  );
};
