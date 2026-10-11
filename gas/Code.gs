// ============================================================================
// obeecreatives - EQUIPMENT HUB (HEADLESS GAS REST BACKEND)
// Spreadsheet ID: 1T7jJL5YKhZEvKNhbweWA_aFkxrsBCHXZ_lJFeqgJeJc
// Arsitektur Standalone REST API: doGet & doPost (JSON Output)
// ============================================================================

const SPREADSHEET_ID = '1T7jJL5YKhZEvKNhbweWA_aFkxrsBCHXZ_lJFeqgJeJc';

const SHEET_INVENTARIS = 'Inventaris';
const SHEET_BOOKING = 'Booking';
const SHEET_OPNAME = 'StockOpname';
const SHEET_USERS = 'Users';

// Seed Admin bawaan saat sheet Users pertama kali dibuat
const DEFAULT_ADMIN_EMAILS = [
  { email: 'obeecreatives@gmail.com', nama: 'Perusahaan' },
  { email: 'obeetools@gmail.com', nama: 'Developer' },
  { email: 'loehendra@gmail.com', nama: 'Engineer' }
];

const USER_HEADERS = ['ID', 'Email', 'Nama', 'Role', 'Status', 'CreatedAt'];
const ROLE_OPTIONS = ['Admin', 'Staff'];

const KONDISI_OPTIONS = ['Baik', 'Perlu Servis', 'Rusak', 'Hilang', 'Dikeluarkan dari Aset'];
const BOOKING_STATUS = ['Dipesan', 'Sedang Dipinjam', 'Selesai', 'Dibatalkan'];
const KONDISI_KEMBALI_OPTIONS = ['Baik', 'Rusak', 'Hilang'];
const KATEGORI_PEMINJAM_OPTIONS = ['Tim Internal', 'Eksternal'];

const INV_HEADERS = [
  'ID', 'Kategori', 'NamaBarang', 'NoSeri', 'Satuan', 'QtyTotal',
  'HargaPerolehan', 'HargaSewa', 'LokasiSimpan', 'KondisiAlat', 'Keterangan'
];

const BOOKING_HEADERS = [
  'ID', 'GroupID', 'NomorFormulir', 'ItemID', 'NamaBarang', 'Kategori', 'Qty', 'TanggalPinjam', 'TanggalKembaliRencana',
  'UntukProyek', 'KategoriPeminjam', 'DipesanOleh', 'NamaPeminjamEksternal', 'KontakPeminjam', 'NoKTP',
  'Status', 'WaktuCheckout', 'PICMengeluarkan', 'PICMembawa',
  'WaktuPengembalian', 'PICMenerima', 'KondisiKembali', 'CatatanKembali', 'CreatedAt',
  'StatusBiaya', 'BiayaSewa'
];

const STATUS_BIAYA_OPTIONS = ['Free Charge', 'Maintenance Charge', 'Full Charge'];
const STATUS_BIAYA_PERSEN = { 'Free Charge': 0, 'Maintenance Charge': 0.25, 'Full Charge': 1 };

const OPNAME_HEADERS = [
  'ID', 'SesiOpnameID', 'TanggalOpname', 'PIC', 'ItemID', 'NamaBarang', 'Kategori',
  'QtySistem', 'QtyAktual', 'Selisih', 'Catatan', 'PenyesuaianDiterapkan'
];

const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const INV_KEY_MAP = {
  'ID': 'id', 'Kategori': 'kategori', 'NamaBarang': 'namaBarang', 'NoSeri': 'noSeri',
  'Satuan': 'satuan', 'QtyTotal': 'qtyTotal', 'HargaPerolehan': 'hargaPerolehan',
  'HargaSewa': 'hargaSewa', 'LokasiSimpan': 'lokasiSimpan', 'KondisiAlat': 'kondisiAlat',
  'Keterangan': 'keterangan'
};

const BOOKING_KEY_MAP = {
  'ID': 'id', 'GroupID': 'groupId', 'NomorFormulir': 'nomorFormulir', 'ItemID': 'itemId', 'NamaBarang': 'namaBarang', 'Kategori': 'kategori',
  'Qty': 'qty', 'TanggalPinjam': 'tanggalPinjam', 'TanggalKembaliRencana': 'tanggalKembaliRencana',
  'UntukProyek': 'untukProyek', 'KategoriPeminjam': 'kategoriPeminjam', 'DipesanOleh': 'dipesanOleh',
  'NamaPeminjamEksternal': 'namaPeminjamEksternal', 'KontakPeminjam': 'kontakPeminjam', 'NoKTP': 'noKtp', 'Status': 'status',
  'WaktuCheckout': 'waktuCheckout', 'PICMengeluarkan': 'picMengeluarkan', 'PICMembawa': 'picMembawa',
  'WaktuPengembalian': 'waktuPengembalian', 'PICMenerima': 'picMenerima',
  'KondisiKembali': 'kondisiKembali', 'CatatanKembali': 'catatanKembali', 'CreatedAt': 'createdAt',
  'StatusBiaya': 'statusBiaya', 'BiayaSewa': 'biayaSewa'
};

const OPNAME_KEY_MAP = {
  'ID': 'id', 'SesiOpnameID': 'sesiOpnameId', 'TanggalOpname': 'tanggalOpname', 'PIC': 'pic',
  'ItemID': 'itemId', 'NamaBarang': 'namaBarang', 'Kategori': 'kategori',
  'QtySistem': 'qtySistem', 'QtyAktual': 'qtyAktual', 'Selisih': 'selisih',
  'Catatan': 'catatan', 'PenyesuaianDiterapkan': 'penyesuaianDiterapkan'
};

// ------------------------------------------------------------
// SPREADSHEET ACCESSOR (Mendukung Standalone Project)
// ------------------------------------------------------------
function getSpreadsheet_() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet_(name, headers) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  const current = range.getValues()[0];
  const matches = headers.every(function (h, i) { return current[i] === h; });
  if (!matches) {
    range.setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function rowToObject_(headers, row, keyMap) {
  const obj = {};
  headers.forEach(function (h, i) {
    obj[keyMap[h] || h] = row[i];
  });
  return obj;
}

function generateId_(prefix) {
  const now = new Date();
  const stamp = Utilities.formatDate(now, 'Asia/Jakarta', 'yyMMddHHmmss');
  return prefix + stamp + Math.floor(Math.random() * 90 + 10);
}

function safeStr_(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function formatTanggalIndo_(value) {
  if (!value) return '-';
  const d = (value instanceof Date) ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return HARI_ID[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN_ID[d.getMonth()] + ' ' + d.getFullYear();
}

function nextFormNumber_() {
  const props = PropertiesService.getScriptProperties();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const key = 'formCounter_' + year + month;
  let counter = Number(props.getProperty(key) || '0') + 1;
  props.setProperty(key, String(counter));
  return 'EQP/' + year + '/' + month + '/' + String(counter).padStart(4, '0');
}

function sanitizeForClient_(obj) {
  if (obj instanceof Date) {
    return Utilities.formatDate(obj, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForClient_);
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    Object.keys(obj).forEach(function (k) {
      out[k] = sanitizeForClient_(obj[k]);
    });
    return out;
  }
  return obj;
}

// ------------------------------------------------------------
// USERS & RBAC HELPER
// ------------------------------------------------------------
function getUsersSheet_() {
  return getSheet_(SHEET_USERS, USER_HEADERS);
}

function getAllUsers_() {
  const sheet = getUsersSheet_();
  let data = sheet.getDataRange().getValues();
  let rows = data.slice(1).filter(function (r) { return r[0]; });

  if (rows.length === 0) {
    const now = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');
    DEFAULT_ADMIN_EMAILS.forEach(function (u) {
      sheet.appendRow([generateId_('USR'), u.email, u.nama, 'Admin', 'Aktif', timestamp]);
    });
    data = sheet.getDataRange().getValues();
    rows = data.slice(1).filter(function (r) { return r[0]; });
  }

  return rows.map(function (r) {
    return { id: r[0], email: r[1], nama: r[2], role: r[3], status: r[4], createdAt: r[5] };
  });
}

function isAllowed_(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return getAllUsers_().some(function (u) { return u.email.toLowerCase() === lower && u.status === 'Aktif'; });
}

function isAdmin_(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return getAllUsers_().some(function (u) { return u.email.toLowerCase() === lower && u.status === 'Aktif' && u.role === 'Admin'; });
}

// ------------------------------------------------------------
// DATA GETTERS & BUSINESS LOGIC
// ------------------------------------------------------------
function getInitialData(callerEmail) {
  try {
    const invSheet = getSheet_(SHEET_INVENTARIS, INV_HEADERS);
    const bookingSheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
    const opnameSheet = getSheet_(SHEET_OPNAME, OPNAME_HEADERS);

    const invData = invSheet.getDataRange().getValues();
    const invHeaders = invData.shift() || INV_HEADERS;
    
    // Cek status admin dari callerEmail atau Session
    const activeEmail = callerEmail || Session.getActiveUser().getEmail() || '';
    const admin = activeEmail ? isAdmin_(activeEmail) : true; // Default admin untuk master sync

    let inventaris = invData
      .filter(function (row) { return row[0]; })
      .map(function (row) { return rowToObject_(invHeaders, row, INV_KEY_MAP); });

    const bookingData = bookingSheet.getDataRange().getValues();
    const bookingHeaders = bookingData.shift() || BOOKING_HEADERS;
    const bookings = bookingData
      .filter(function (row) { return row[0]; })
      .map(function (row) { return rowToObject_(bookingHeaders, row, BOOKING_KEY_MAP); });

    const opnameData = opnameSheet.getDataRange().getValues();
    const opnameHeaders = opnameData.shift() || OPNAME_HEADERS;
    const stockOpname = opnameData
      .filter(function (row) { return row[0]; })
      .map(function (row) { return rowToObject_(opnameHeaders, row, OPNAME_KEY_MAP); });

    const users = getAllUsers_();

    return sanitizeForClient_({
      serverCodeVersion: 'EQUIPMENT-HEADLESS-v2.0',
      ok: true,
      isAdmin: admin,
      spreadsheetId: SPREADSHEET_ID,
      inventaris: inventaris,
      bookings: bookings,
      stockOpname: stockOpname,
      users: users,
      options: {
        kondisi: KONDISI_OPTIONS,
        status: BOOKING_STATUS,
        kondisiKembali: KONDISI_KEMBALI_OPTIONS,
        kategoriPeminjam: KATEGORI_PEMINJAM_OPTIONS,
        statusBiaya: STATUS_BIAYA_OPTIONS
      },
      userEmail: activeEmail
    });
  } catch (err) {
    return sanitizeForClient_({
      serverCodeVersion: 'EQUIPMENT-HEADLESS-v2.0',
      ok: false,
      isAdmin: false,
      errorMessage: err && err.message,
      errorStack: err && err.stack,
      inventaris: [],
      bookings: [],
      stockOpname: [],
      users: [],
      options: { kondisi: [], status: [], kondisiKembali: [], kategoriPeminjam: [], statusBiaya: [] }
    });
  }
}

function getBookedQty_(bookingRows, headers, itemId, start, end, excludeBookingId) {
  const idIdx = headers.indexOf('ID');
  const itemIdx = headers.indexOf('ItemID');
  const qtyIdx = headers.indexOf('Qty');
  const startIdx = headers.indexOf('TanggalPinjam');
  const endIdx = headers.indexOf('TanggalKembaliRencana');
  const statusIdx = headers.indexOf('Status');

  let total = 0;
  bookingRows.forEach(function (row) {
    if (String(row[itemIdx]) !== String(itemId)) return;
    if (excludeBookingId && String(row[idIdx]) === String(excludeBookingId)) return;
    const status = row[statusIdx];
    if (status !== 'Dipesan' && status !== 'Sedang Dipinjam') return;

    // Normalisasi tanggal perbandingan
    const rowStart = new Date(String(row[startIdx]).split('T')[0] + 'T00:00:00');
    const rowEnd = new Date(String(row[endIdx]).split('T')[0] + 'T23:59:59');
    const reqStart = new Date(String(start).split('T')[0] + 'T00:00:00');
    const reqEnd = new Date(String(end).split('T')[0] + 'T23:59:59');

    if (rowStart <= reqEnd && rowEnd >= reqStart) {
      total += Number(row[qtyIdx]) || 0;
    }
  });
  return total;
}

function checkAvailability(itemId, qty, tanggalPinjam, tanggalKembali, excludeBookingId) {
  const invSheet = getSheet_(SHEET_INVENTARIS, INV_HEADERS);
  const invData = invSheet.getDataRange().getValues();
  const invHeaders = invData[0];
  const idIdx = invHeaders.indexOf('ID');
  const qtyTotalIdx = invHeaders.indexOf('QtyTotal');

  const itemRow = invData.find(function (row) { return String(row[idIdx]) === String(itemId); });
  if (!itemRow) {
    return sanitizeForClient_({ available: false, message: 'Item tidak ditemukan' });
  }
  const qtyTotal = Number(itemRow[qtyTotalIdx]) || 0;

  const bookingSheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  const bookingData = bookingSheet.getDataRange().getValues();
  const bookingHeaders = bookingData.shift();

  const bookedQty = getBookedQty_(bookingData, bookingHeaders, itemId, tanggalPinjam, tanggalKembali, excludeBookingId);
  const sisa = qtyTotal - bookedQty;

  return sanitizeForClient_({
    available: sisa >= Number(qty),
    qtyTotal: qtyTotal,
    sisa: sisa,
    diminta: Number(qty)
  });
}

function getItemHargaSewa_(itemId) {
  const invSheet = getSheet_(SHEET_INVENTARIS, INV_HEADERS);
  const invData = invSheet.getDataRange().getValues();
  const invHeaders = invData[0];
  const idIdx = invHeaders.indexOf('ID');
  const hargaSewaIdx = invHeaders.indexOf('HargaSewa');
  for (let r = 1; r < invData.length; r++) {
    if (String(invData[r][idIdx]) === String(itemId)) {
      return Number(invData[r][hargaSewaIdx]) || 0;
    }
  }
  return 0;
}

function createBooking(booking) {
  const check = checkAvailability(booking.itemId, booking.qty, booking.tanggalPinjam, booking.tanggalKembaliRencana, null);
  if (!check.available) {
    throw new Error('Tidak bisa booking: alat ini tersisa ' + check.sisa + ' unit di rentang tanggal itu (diminta ' + check.diminta + ').');
  }

  const sheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  ensureHeaders_(sheet, BOOKING_HEADERS);
  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');

  const statusBiaya = STATUS_BIAYA_OPTIONS.indexOf(booking.statusBiaya) !== -1 ? booking.statusBiaya : 'Free Charge';
  const persen = STATUS_BIAYA_PERSEN[statusBiaya] || 0;
  const hargaSewaItem = getItemHargaSewa_(booking.itemId);
  const biayaSewa = Math.round(hargaSewaItem * persen * (Number(booking.qty) || 1));

  const rowMap = {
    'ID': generateId_('BOOK'),
    'GroupID': booking.groupId || generateId_('GRP'),
    'NomorFormulir': booking.nomorFormulir || nextFormNumber_(),
    'ItemID': booking.itemId,
    'NamaBarang': booking.namaBarang || '',
    'Kategori': booking.kategori || '',
    'Qty': booking.qty,
    'TanggalPinjam': booking.tanggalPinjam,
    'TanggalKembaliRencana': booking.tanggalKembaliRencana,
    'UntukProyek': booking.untukProyek || '',
    'KategoriPeminjam': booking.kategoriPeminjam || 'Tim Internal',
    'DipesanOleh': booking.dipesanOleh || '',
    'NamaPeminjamEksternal': booking.namaPeminjamEksternal || '',
    'KontakPeminjam': booking.kontakPeminjam || '',
    'NoKTP': booking.noKtp || '',
    'Status': 'Dipesan',
    'WaktuCheckout': '',
    'PICMengeluarkan': '',
    'PICMembawa': '',
    'WaktuPengembalian': '',
    'PICMenerima': '',
    'KondisiKembali': '',
    'CatatanKembali': '',
    'CreatedAt': timestamp,
    'StatusBiaya': statusBiaya,
    'BiayaSewa': biayaSewa
  };

  const newRow = BOOKING_HEADERS.map(function (h) { return rowMap[h]; });
  sheet.appendRow(newRow);
  return sanitizeForClient_({ success: true, id: rowMap['ID'] });
}

function createBookingBatch(shared, items) {
  if (!items || !items.length) {
    throw new Error('Belum ada alat yang dipilih.');
  }

  // Gunakan LockService agar tidak terjadi tabrakan nomor formulir atau race-condition
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const groupId = generateId_('GRP');
    const nomorFormulir = nextFormNumber_();
    const created = [];
    const errors = [];

    items.forEach(function (it, idx) {
      try {
        const res = createBooking(Object.assign({}, shared, {
          itemId: it.itemId,
          namaBarang: it.namaBarang,
          kategori: it.kategori,
          qty: it.qty,
          groupId: groupId,
          nomorFormulir: nomorFormulir
        }));
        created.push(res.id);
      } catch (err) {
        errors.push((it.namaBarang || ('Alat ke-' + (idx + 1))) + ': ' + (err && err.message));
      }
    });

    return sanitizeForClient_({
      success: errors.length === 0,
      groupId: groupId,
      nomorFormulir: nomorFormulir,
      created: created.length,
      failed: errors.length,
      errors: errors,
      ids: created
    });
  } finally {
    lock.releaseLock();
  }
}

function updateBookingStatus_(bookingId, updates) {
  const sheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][0]) === String(bookingId)) {
      Object.keys(updates).forEach(function (key) {
        const colIdx = headers.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(r + 1, colIdx + 1).setValue(updates[key]);
        }
      });
      return true;
    }
  }
  return false;
}

function updateInventarisKondisi_(itemId, kondisi) {
  const invSheet = getSheet_(SHEET_INVENTARIS, INV_HEADERS);
  const invData = invSheet.getDataRange().getValues();
  const invHeaders = invData[0];
  const idIdx = invHeaders.indexOf('ID');
  const kondisiIdx = invHeaders.indexOf('KondisiAlat');
  for (let r = 1; r < invData.length; r++) {
    if (String(invData[r][idIdx]) === String(itemId)) {
      invSheet.getRange(r + 1, kondisiIdx + 1).setValue(kondisi);
      return;
    }
  }
}

function checkoutBookingGroup(groupId, picMengeluarkan, picMembawa) {
  const sheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const groupIdx = headers.indexOf('GroupID');
  const statusIdx = headers.indexOf('Status');
  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');
  let count = 0;

  for (let r = 1; r < data.length; r++) {
    if (String(data[r][groupIdx]) === String(groupId) && data[r][statusIdx] === 'Dipesan') {
      updateBookingStatus_(data[r][0], {
        'Status': 'Sedang Dipinjam',
        'WaktuCheckout': timestamp,
        'PICMengeluarkan': picMengeluarkan || '',
        'PICMembawa': picMembawa || ''
      });
      count++;
    }
  }
  if (count === 0) throw new Error('Tidak ada alat berstatus "Dipesan" pada paket ini.');
  return sanitizeForClient_({ success: true, count: count });
}

function returnBookingGroupDetailed(groupId, itemUpdates, picMenerima) {
  if (!itemUpdates || !itemUpdates.length) {
    throw new Error('Belum ada alat yang dicek.');
  }
  const sheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('ID');
  const itemIdIdx = headers.indexOf('ItemID');
  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');
  let count = 0;

  itemUpdates.forEach(function (upd) {
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][idIdx]) === String(upd.id)) {
        updateBookingStatus_(upd.id, {
          'Status': 'Selesai',
          'WaktuPengembalian': timestamp,
          'KondisiKembali': upd.kondisiKembali || 'Baik',
          'CatatanKembali': upd.catatanKembali || '',
          'PICMenerima': picMenerima || ''
        });
        if (upd.kondisiKembali === 'Rusak' || upd.kondisiKembali === 'Hilang') {
          updateInventarisKondisi_(data[r][itemIdIdx], upd.kondisiKembali === 'Hilang' ? 'Hilang' : 'Perlu Servis');
        }
        count++;
        break;
      }
    }
  });

  if (count === 0) throw new Error('Tidak ada alat yang berhasil diproses.');
  return sanitizeForClient_({ success: true, count: count });
}

function cancelBookingGroup(groupId) {
  const sheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const groupIdx = headers.indexOf('GroupID');
  const statusIdx = headers.indexOf('Status');
  let count = 0;

  for (let r = 1; r < data.length; r++) {
    if (String(data[r][groupIdx]) === String(groupId) && data[r][statusIdx] === 'Dipesan') {
      updateBookingStatus_(data[r][0], { 'Status': 'Dibatalkan' });
      count++;
    }
  }
  if (count === 0) throw new Error('Tidak ada alat berstatus "Dipesan" pada paket ini.');
  return sanitizeForClient_({ success: true, count: count });
}

function saveInventarisItem(item) {
  const sheet = getSheet_(SHEET_INVENTARIS, INV_HEADERS);
  ensureHeaders_(sheet, INV_HEADERS);

  const rowMap = {
    'ID': item.id || generateId_('ITEM'),
    'Kategori': item.kategori || '',
    'NamaBarang': item.namaBarang || '',
    'NoSeri': item.noSeri || '',
    'Satuan': item.satuan || 'Pcs',
    'QtyTotal': item.qtyTotal || 0,
    'HargaPerolehan': item.hargaPerolehan || 0,
    'HargaSewa': item.hargaSewa || 0,
    'LokasiSimpan': item.lokasiSimpan || '',
    'KondisiAlat': item.kondisiAlat || 'Baik',
    'Keterangan': item.keterangan || ''
  };

  if (item.id) {
    const data = sheet.getDataRange().getValues();
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][0]) === String(item.id)) {
        const newRow = INV_HEADERS.map(function (h) { return rowMap[h]; });
        sheet.getRange(r + 1, 1, 1, INV_HEADERS.length).setValues([newRow]);
        return sanitizeForClient_({ success: true, id: item.id });
      }
    }
  }

  const newRow = INV_HEADERS.map(function (h) { return rowMap[h]; });
  sheet.appendRow(newRow);
  return sanitizeForClient_({ success: true, id: rowMap['ID'] });
}

function saveStockOpnameBatch(pic, items) {
  if (!items || !items.length) throw new Error('Belum ada alat yang dicek.');

  const sheet = getSheet_(SHEET_OPNAME, OPNAME_HEADERS);
  ensureHeaders_(sheet, OPNAME_HEADERS);
  const now = new Date();
  const tanggal = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');
  const sesiId = generateId_('OPN');

  let selisihCount = 0;
  let disesuaikanCount = 0;

  items.forEach(function (it) {
    const selisih = Number(it.qtyAktual) - Number(it.qtySistem);
    if (selisih !== 0) selisihCount++;

    const rowMap = {
      'ID': generateId_('OPNI'),
      'SesiOpnameID': sesiId,
      'TanggalOpname': tanggal,
      'PIC': pic || '',
      'ItemID': it.itemId,
      'NamaBarang': it.namaBarang || '',
      'Kategori': it.kategori || '',
      'QtySistem': it.qtySistem,
      'QtyAktual': it.qtyAktual,
      'Selisih': selisih,
      'Catatan': it.catatan || '',
      'PenyesuaianDiterapkan': (it.terapkan && selisih !== 0) ? 'TRUE' : 'FALSE'
    };
    sheet.appendRow(OPNAME_HEADERS.map(function (h) { return rowMap[h]; }));

    if (it.terapkan && selisih !== 0) {
      const invSheet = getSheet_(SHEET_INVENTARIS, INV_HEADERS);
      const invData = invSheet.getDataRange().getValues();
      const invHeaders = invData[0];
      const idIdx = invHeaders.indexOf('ID');
      const qtyIdx = invHeaders.indexOf('QtyTotal');
      for (let r = 1; r < invData.length; r++) {
        if (String(invData[r][idIdx]) === String(it.itemId)) {
          invSheet.getRange(r + 1, qtyIdx + 1).setValue(it.qtyAktual);
          disesuaikanCount++;
          break;
        }
      }
    }
  });

  return sanitizeForClient_({
    success: true,
    sesiId: sesiId,
    totalDicek: items.length,
    totalSelisih: selisihCount,
    totalDisesuaikan: disesuaikanCount
  });
}

function saveUserAccess(user) {
  if (!user || !safeStr_(user.email).trim()) {
    throw new Error('Email wajib diisi.');
  }
  const email = safeStr_(user.email).trim().toLowerCase();
  const sheet = getUsersSheet_();
  ensureHeaders_(sheet, USER_HEADERS);
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm');

  if (user.id) {
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][0]) === String(user.id)) {
        const willBeAdmin = user.role === 'Admin' && user.status === 'Aktif';
        if (!willBeAdmin) {
          const currentAdmins = getAllUsers_().filter(function (u) { return u.role === 'Admin' && u.status === 'Aktif' && String(u.id) !== String(user.id); });
          if (currentAdmins.length === 0) {
            throw new Error('Minimal harus ada 1 admin aktif.');
          }
        }
        sheet.getRange(r + 1, 2, 1, 4).setValues([[email, user.nama || '', user.role || 'Staff', user.status || 'Aktif']]);
        return sanitizeForClient_({ success: true, id: user.id });
      }
    }
  }

  const exists = getAllUsers_().some(function (u) { return u.email.toLowerCase() === email; });
  if (exists) throw new Error('Email ini sudah terdaftar.');

  const newId = generateId_('USR');
  sheet.appendRow([newId, email, user.nama || '', user.role || 'Staff', user.status || 'Aktif', timestamp]);
  return sanitizeForClient_({ success: true, id: newId });
}

function deleteUserAccess(id) {
  const target = getAllUsers_().find(function (u) { return String(u.id) === String(id); });
  if (!target) throw new Error('Pengguna tidak ditemukan.');

  if (target.role === 'Admin' && target.status === 'Aktif') {
    const otherAdmins = getAllUsers_().filter(function (u) { return u.role === 'Admin' && u.status === 'Aktif' && String(u.id) !== String(id); });
    if (otherAdmins.length === 0) {
      throw new Error('Minimal harus ada 1 admin aktif.');
    }
  }

  const sheet = getUsersSheet_();
  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][0]) === String(id)) {
      sheet.deleteRow(r + 1);
      return sanitizeForClient_({ success: true });
    }
  }
  throw new Error('Pengguna tidak ditemukan.');
}

// ------------------------------------------------------------
// EXPORT PDF FORMULIR SERAH TERIMA
// ------------------------------------------------------------
function generateBookingGroupPdfBase64(groupId) {
  const sheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const groupIdx = headers.indexOf('GroupID');
  const rows = data.filter(function (r, idx) { return idx > 0 && String(r[groupIdx]) === String(groupId); });
  if (!rows.length) throw new Error('Paket booking tidak ditemukan');

  const items = rows.map(function (row) { return rowToObject_(headers, row, BOOKING_KEY_MAP); });
  const html = buildBookingGroupHtml_(items);
  const blob = Utilities.newBlob(html, 'text/html', 'formulir.html').getAs('application/pdf');
  return Utilities.base64Encode(blob.getBytes());
}

function buildBookingGroupHtml_(items) {
  const b = items[0];
  const isEksternal = b.kategoriPeminjam === 'Eksternal';
  const totalBiaya = items.reduce(function (s, it) { return s + (Number(it.biayaSewa) || 0); }, 0);

  const infoRows = [
    ['No. Formulir', b.nomorFormulir || '-'],
    ['Untuk Proyek/Klien', b.untukProyek || '-'],
    ['Kategori Peminjam', b.kategoriPeminjam || 'Tim Internal'],
    ['Nama Peminjam', isEksternal ? (b.namaPeminjamEksternal || '-') : (b.dipesanOleh || '-')],
    isEksternal ? ['Kontak Peminjam', b.kontakPeminjam || '-'] : null,
    ['No. KTP Peminjam', b.noKtp || '-'],
    ['Staff Penanggung Jawab', b.dipesanOleh || '-'],
    ['Tanggal Pinjam', formatTanggalIndo_(b.tanggalPinjam)],
    ['Tanggal Kembali Rencana', formatTanggalIndo_(b.tanggalKembaliRencana)],
    ['Status', b.status || '-'],
    ['Status Biaya', b.statusBiaya || 'Free Charge'],
    ['Total Biaya Sewa', 'Rp ' + totalBiaya.toLocaleString('id-ID')]
  ].filter(Boolean);

  const infoRowsHtml = infoRows.map(function (r) {
    return '<tr>' +
      '<td style="padding:7px 0;width:220px;color:#99342C;border-bottom:1px solid #eee;">' + r[0] + '</td>' +
      '<td style="padding:7px 0;color:#1A1A1A;border-bottom:1px solid #eee;">' + r[1] + '</td>' +
      '</tr>';
  }).join('');

  const itemRowsHtml = items.map(function (it, idx) {
    return '<tr>' +
      '<td style="padding:7px 8px;border-bottom:1px solid #eee;color:#6B6B6B;">' + (idx + 1) + '</td>' +
      '<td style="padding:7px 8px;border-bottom:1px solid #eee;">' + (it.namaBarang || '-') + '</td>' +
      '<td style="padding:7px 8px;border-bottom:1px solid #eee;">' + (it.kategori || '-') + '</td>' +
      '<td style="padding:7px 8px;border-bottom:1px solid #eee;text-align:center;">' + (it.qty || '-') + '</td>' +
      '</tr>';
  }).join('');

  return '<html><head><meta charset="UTF-8"><style>' +
    'body{font-family:Arial,sans-serif;font-size:12px;color:#1A1A1A;padding:28px;}' +
    '.logo{font-size:20px;font-weight:bold;}' +
    '.logo .obee{color:#1A1A1A;} .logo .creatives{color:#E30000;}' +
    '.subtitle{color:#6B6B6B;font-size:11px;margin-top:2px;}' +
    'hr{border:none;border-top:2px solid #1A1A1A;margin:10px 0 22px;}' +
    'h1{font-size:15px;margin:0 0 4px;}' +
    '.printdate{color:#6B6B6B;font-size:11px;margin:0 0 18px;}' +
    '.section-title{font-size:13px;font-weight:bold;margin:22px 0 8px;border-bottom:1px solid #ddd;padding-bottom:5px;}' +
    'table{border-collapse:collapse;width:100%;}' +
    'th{text-align:left;padding:7px 8px;border-bottom:2px solid #1A1A1A;font-size:11px;color:#6B6B6B;text-transform:uppercase;}' +
    '.sign{display:flex;justify-content:space-between;margin-top:34px;}' +
    '.sign-box{width:45%;text-align:center;font-size:12px;}' +
    '.sign-line{margin-top:60px;padding-top:6px;}' +
    '</style></head><body>' +
    '<div class="logo"><span class="obee">obee</span><span class="creatives">creatives</span></div>' +
    '<div class="subtitle">Formulir Peminjaman Alat</div>' +
    '<hr>' +
    '<h1>Formulir Peminjaman / Berita Acara Serah Terima</h1>' +
    '<div class="printdate">Dicetak: ' + formatTanggalIndo_(new Date()) + '</div>' +
    '<div class="section-title">Informasi Peminjaman</div>' +
    '<table>' + infoRowsHtml + '</table>' +
    '<div class="section-title">Daftar Alat (' + items.length + ' item)</div>' +
    '<table><thead><tr><th>No</th><th>Nama Alat</th><th>Kategori</th><th style="text-align:center;">Qty</th></tr></thead>' +
    '<tbody>' + itemRowsHtml + '</tbody></table>' +
    '<div class="section-title">Serah Terima</div>' +
    '<div class="sign">' +
    '<div class="sign-box">Yang Menyerahkan<div class="sign-line">' + (b.picMengeluarkan || '(...........................)') + '</div></div>' +
    '<div class="sign-box">Yang Menerima/Membawa<div class="sign-line">' + (b.picMembawa || b.namaPeminjamEksternal || b.dipesanOleh || '(...........................)') + '</div></div>' +
    '</div>' +
    '</body></html>';
}

// ------------------------------------------------------------
// HEADLESS REST API ENTRYPOINTS (doGet & doPost)
// ------------------------------------------------------------
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getInitialData';
  const email = (e && e.parameter && e.parameter.email) || '';
  let responseData;

  try {
    if (action === 'getInitialData') {
      responseData = getInitialData(email);
    } else if (action === 'testPing' || action === 'ping') {
      responseData = { ok: true, message: 'pong', spreadsheetId: SPREADSHEET_ID, timestamp: new Date().toISOString() };
    } else if (action === 'checkAvailability') {
      const p = e.parameter;
      responseData = checkAvailability(p.itemId, p.qty, p.tanggalPinjam, p.tanggalKembali, p.excludeBookingId);
    } else if (action === 'getUsersManage') {
      responseData = { users: getAllUsers_(), roleOptions: ROLE_OPTIONS };
    } else {
      responseData = { ok: false, message: 'Unknown GET action: ' + action };
    }
  } catch (err) {
    responseData = { ok: false, errorMessage: err.message, errorStack: err.stack };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let responseData;

  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;

    if (action === 'createBookingBatch') {
      responseData = createBookingBatch(payload.shared, payload.items);
    } else if (action === 'checkoutBookingGroup') {
      responseData = checkoutBookingGroup(payload.groupId, payload.picMengeluarkan, payload.picMembawa);
    } else if (action === 'returnBookingGroupDetailed') {
      responseData = returnBookingGroupDetailed(payload.groupId, payload.itemUpdates, payload.picMenerima);
    } else if (action === 'cancelBookingGroup') {
      responseData = cancelBookingGroup(payload.groupId);
    } else if (action === 'saveInventarisItem') {
      responseData = saveInventarisItem(payload.item);
    } else if (action === 'saveStockOpnameBatch') {
      responseData = saveStockOpnameBatch(payload.pic, payload.items);
    } else if (action === 'saveUserAccess') {
      responseData = saveUserAccess(payload.user);
    } else if (action === 'deleteUserAccess') {
      responseData = deleteUserAccess(payload.id);
    } else if (action === 'generateBookingGroupPdfBase64') {
      responseData = { success: true, base64: generateBookingGroupPdfBase64(payload.groupId) };
    } else if (action === 'ping') {
      responseData = { ok: true, message: 'pong' };
    } else {
      responseData = { ok: false, message: 'Unknown POST action: ' + action };
    }
  } catch (err) {
    responseData = { ok: false, errorMessage: err.message, errorStack: err.stack };
  }

  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------
// FUNGSI UTILITY MANUAL DI EDITOR
// ------------------------------------------------------------
function authorizeApp() {
  const ss = getSpreadsheet_();
  Logger.log('Spreadsheet terhubung: ' + ss.getName() + ' (' + ss.getId() + ')');
  const invSheet = getSheet_(SHEET_INVENTARIS, INV_HEADERS);
  const bookingSheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  const users = getAllUsers_();
  Logger.log('Sheet Inventaris, Booking, & Users siap. Total user terdaftar: ' + users.length);
  Logger.log('OTORISASI BERHASIL. Sekarang aman untuk Deploy > New version.');
}

function testPing() {
  Logger.log('pong - koneksi ke spreadsheet ' + SPREADSHEET_ID + ' berhasil.');
  return 'pong';
}

function trimSheet_(sheet) {
  const maxRows = sheet.getMaxRows();
  const maxCols = sheet.getMaxColumns();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (maxRows > lastRow + 1) {
    sheet.deleteRows(lastRow + 2, maxRows - lastRow - 1);
  }
  if (maxCols > lastCol + 1) {
    sheet.deleteColumns(lastCol + 2, maxCols - lastCol - 1);
  }
}

function trimAllSheets() {
  const invSheet = getSheet_(SHEET_INVENTARIS, INV_HEADERS);
  const bookingSheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  trimSheet_(invSheet);
  trimSheet_(bookingSheet);
  Logger.log('Rapikan sheet selesai.');
}

function resetBookingData() {
  const sheet = getSheet_(SHEET_BOOKING, BOOKING_HEADERS);
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  ensureHeaders_(sheet, BOOKING_HEADERS);
  Logger.log('Data Booking sudah dikosongkan.');
}
