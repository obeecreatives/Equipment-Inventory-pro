const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const BULAN_RINGKAS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Parsing string tanggal dari berbagai format (ISO, YYYY-MM-DD, Google Sheets Date string)
 * secara konsisten agar tidak terpengaruh pergeseran timezone UTC.
 */
export function parseLocalDateIndo(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  
  const str = String(value).trim();
  if (!str) return null;

  // Format YYYY-MM-DD atau YYYY-MM-DD HH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('T')[0].split(' ')[0].split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Format DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const [d, m, y] = str.split(' ')[0].split('/').map(v => parseInt(v, 10));
    return new Date(y, m - 1, d);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format tanggal panjang resmi: "Senin, 12 Oktober 2026"
 */
export function formatTanggalIndo(value: string | Date | null | undefined): string {
  const d = parseLocalDateIndo(value);
  if (!d) return '-';
  return `${HARI_ID[d.getDay()]}, ${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format tanggal ringkas: "12 Okt 2026"
 */
export function formatTanggalRingkas(value: string | Date | null | undefined): string {
  const d = parseLocalDateIndo(value);
  if (!d) return '-';
  return `${d.getDate()} ${BULAN_RINGKAS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format rentang tanggal: "12 Okt 2026 → 15 Okt 2026"
 */
export function formatRentangTanggal(start: string | null | undefined, end: string | null | undefined): string {
  if (!start && !end) return '-';
  const startStr = formatTanggalRingkas(start);
  const endStr = formatTanggalRingkas(end);
  if (startStr === endStr) return startStr;
  return `${startStr} → ${endStr}`;
}

/**
 * Format tanggal dan waktu 24 jam Indonesia: "12/10/2026 14:30 WIB"
 */
export function formatWaktuIndo(value: string | Date | null | undefined): string {
  if (!value) return '-';
  const str = String(value);
  // Bila sudah string dd/MM/yyyy HH:mm dari GAS
  if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(str)) {
    return str + ' WIB';
  }
  const d = parseLocalDateIndo(value);
  if (!d) return str;
  const rawDate = new Date(value);
  const hours = String(rawDate.getHours()).padStart(2, '0');
  const mins = String(rawDate.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()} ${hours}:${mins} WIB`;
}

/**
 * Format mata uang Rupiah Indonesia: "Rp 17.000.000"
 */
export function formatRupiah(value: number | string | null | undefined): string {
  const num = Number(value) || 0;
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

/**
 * Hitung selisih hari keterlambatan terhadap tanggal rencana kembali.
 * >= 1 hari: terlambat
 */
export function hitungHariTerlambat(tanggalKembaliRencana: string | null | undefined): number {
  if (!tanggalKembaliRencana) return 0;
  const rencana = parseLocalDateIndo(tanggalKembaliRencana);
  if (!rencana) return 0;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = today.getTime() - rencana.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Ambil tanggal hari ini dalam format input HTML: "YYYY-MM-DD"
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Ambil tanggal X hari ke depan: "YYYY-MM-DD"
 */
export function getFutureDateString(daysAhead: number = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalisasi nomor HP Indonesia ke format nomor internasional WhatsApp (628xxx)
 */
export function formatNomorWa(raw: string | number | null | undefined): string {
  let n = String(raw || '').replace(/[^0-9]/g, '');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  if (!n.startsWith('62')) n = '62' + n;
  return n;
}

/**
 * Bangun tautan langsung WhatsApp dengan pesan pengingat siap kirim
 */
export function buildWaReminderUrl(
  kontak: string,
  namaPeminjam: string,
  daftarAlat: string,
  untukProyek: string,
  tanggalKembaliRencana: string
): string {
  const waNumber = formatNomorWa(kontak);
  const pesan = `Halo ${namaPeminjam},\n\nAlat (${daftarAlat}) yang dipinjam untuk "${untukProyek}" sudah melewati batas waktu pengembalian (rencana: ${formatTanggalRingkas(tanggalKembaliRencana)}).\n\nMohon bantuannya untuk segera dikembalikan ke obeecreatives studio.\n\nTerima kasih! 🙏`;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`;
}
