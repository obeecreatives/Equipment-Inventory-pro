export type Role = 'Admin' | 'Project Manager' | 'Site Engineer' | 'Staff' | 'Client';

export type KondisiAlat = 'Baik' | 'Perlu Servis' | 'Rusak' | 'Hilang' | 'Dikeluarkan dari Aset';
export type BookingStatus = 'Dipesan' | 'Sedang Dipinjam' | 'Selesai' | 'Dibatalkan';
export type KondisiKembali = 'Baik' | 'Rusak' | 'Hilang';
export type KategoriPeminjam = 'Tim Internal' | 'Eksternal';
export type StatusBiaya = 'Free Charge' | 'Maintenance Charge' | 'Full Charge';

export interface InventarisItem {
  id: string;
  kategori: string;
  namaBarang: string;
  noSeri: string;
  satuan: string;
  qtyTotal: number;
  hargaPerolehan: number;
  hargaSewa: number;
  lokasiSimpan: string;
  kondisiAlat: KondisiAlat;
  keterangan: string;
  fotoUrl?: string;
}

export interface BookingItem {
  id: string;
  groupId: string;
  nomorFormulir: string;
  itemId: string;
  namaBarang: string;
  kategori: string;
  qty: number;
  tanggalPinjam: string;
  tanggalKembaliRencana: string;
  untukProyek: string;
  kategoriPeminjam: KategoriPeminjam;
  dipesanOleh: string;
  namaPeminjamEksternal: string;
  kontakPeminjam: string;
  noKtp: string;
  status: BookingStatus;
  waktuCheckout: string;
  picMengeluarkan: string;
  picMembawa: string;
  waktuPengembalian: string;
  picMenerima: string;
  kondisiKembali: KondisiKembali | '';
  catatanKembali: string;
  createdAt: string;
  statusBiaya: StatusBiaya;
  biayaSewa: number;
  fotoUrl?: string;
}

export interface BookingGroup {
  groupId: string;
  nomorFormulir: string;
  untukProyek: string;
  tanggalPinjam: string;
  tanggalKembaliRencana: string;
  kategoriPeminjam: KategoriPeminjam;
  dipesanOleh: string;
  namaPeminjamEksternal: string;
  kontakPeminjam: string;
  noKtp: string;
  status: BookingStatus;
  statusBiaya: StatusBiaya;
  totalBiaya: number;
  items: BookingItem[];
  createdAt: string;
}

export interface StockOpnameRow {
  id: string;
  sesiOpnameId: string;
  tanggalOpname: string;
  pic: string;
  itemId: string;
  namaBarang: string;
  kategori: string;
  qtySistem: number;
  qtyAktual: number;
  selisih: number;
  catatan: string;
  penyesuaianDiterapkan: boolean | string;
}

export interface AppUser {
  id: string;
  email: string;
  nama: string;
  role: 'Admin' | 'Staff';
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

export interface OutboxAction {
  id: string;
  action: string;
  payload: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

export interface GasInitialDataResponse {
  serverCodeVersion?: string;
  ok: boolean;
  isAdmin?: boolean;
  spreadsheetId?: string;
  inventaris: InventarisItem[];
  bookings: BookingItem[];
  stockOpname: StockOpnameRow[];
  users: AppUser[];
  options?: {
    kondisi: string[];
    status: string[];
    kondisiKembali: string[];
    kategoriPeminjam: string[];
    statusBiaya: string[];
  };
  userEmail?: string;
  errorMessage?: string;
}

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const SWITCH_APPS = [
  { name: 'CRM • WORKSPACE OS', url: 'https://script.google.com/macros/s/AKfycbxVhwbra0GbiYtmjbtywZiC3yPHLuOd7uJcST4a9jbowO_MmT1PuUxWNB4a5FUyVdjcKA/exec', icon: 'Briefcase' },
  { name: 'Database Staff', url: 'https://script.google.com/macros/s/AKfycbzPNl7XQg1bJsuBbBKVmmSxZE6vI_ywwHNdIXjFFME6yB2vElBRNgE904SUO-LZjxQd/exec', icon: 'Users' },
  { name: 'Laporan Keuangan', url: 'https://script.google.com/macros/s/AKfycbxS7DF6375QTykkWFTcntYdCiiaBIyiq_4PeW4fhC7QTrx8FilLqZs6bpjNkCQlXKQmQg/exec', icon: 'DollarSign' },
  { name: 'Document Hub', url: 'https://script.google.com/macros/s/AKfycbwjJZKnFPhFto2Fr0m6DGnEQSNyVeEb6Yue3C9OkNpivNm-6sPp1GJo3h5HIwylGhy9/exec', icon: 'FileText' },
  { name: 'Database Surat', url: 'https://script.google.com/macros/s/AKfycbyyfBize1EAdjlzMXD2pjWN3ot-UrhcGdvkyOhM9_hLLQ3Iv9ouLen8e1hOrH-OJZ3TFg/exec', icon: 'Mail' }
];
