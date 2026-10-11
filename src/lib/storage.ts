import { AppUser, BookingItem, InventarisItem, OutboxAction, Role, StockOpnameRow } from '../types/inventory';

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxRzey5Lk_zWDlaZYCal21IkDlsxkZNLKYwBdR9mwY62Jxa3pgzh1sIGVJIHyMcsAHo/exec';
export const SPREADSHEET_ID = '1T7jJL5YKhZEvKNhbweWA_aFkxrsBCHXZ_lJFeqgJeJc';

// 130 Item Master Peralatan Asli Obeecreatives
export const SEED_INVENTARIS: InventarisItem[] = [
  { id: 'ITEM26080100263951', kategori: 'KAMERA', namaBarang: 'SONY A6400', noSeri: 'S01-4483893', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 17000000, hargaSewa: 150000, lokasiSimpan: 'Etalase Box 1A', kondisiAlat: 'Baik', keterangan: 'Kamera utama produksi video' },
  { id: 'ITEM26080100263966', kategori: 'KAMERA', namaBarang: 'CANON 550D', noSeri: '41332760668', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 10000000, hargaSewa: 50000, lokasiSimpan: 'Etalase Box 1B', kondisiAlat: 'Baik', keterangan: 'Kamera backup/photo' },
  { id: 'ITEM26080100264042', kategori: 'KAMERA', namaBarang: 'NIKON D7100', noSeri: '6402771', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 15000000, hargaSewa: 75000, lokasiSimpan: 'Etalase Box 1C', kondisiAlat: 'Baik', keterangan: 'Bodi kokoh DSLR' },
  { id: 'ITEM26080100264057', kategori: 'KAMERA', namaBarang: 'FUJI EXR', noSeri: 'BB25430-400', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 6500000, hargaSewa: 40000, lokasiSimpan: 'Etalase Box 1D', kondisiAlat: 'Baik', keterangan: 'Compact mirrorless' },
  { id: 'ITEM26080100264163', kategori: 'KABEL', namaBarang: 'KABEL MIC XLR 3 M', noSeri: '', satuan: 'Roll', qtyTotal: 1, hargaPerolehan: 150000, hargaSewa: 10000, lokasiSimpan: 'Kabel Box A', kondisiAlat: 'Baik', keterangan: 'Koneksi mic ke audio interface' },
  { id: 'ITEM26080100264141', kategori: 'KABEL', namaBarang: 'KABEL MIC XLR 1 M', noSeri: '', satuan: 'Roll', qtyTotal: 1, hargaPerolehan: 78000, hargaSewa: 5000, lokasiSimpan: 'Kabel Box A', kondisiAlat: 'Baik', keterangan: 'Patching mixer' },
  { id: 'ITEM26080100264250', kategori: 'MIC', namaBarang: 'CONDENSOR ISK AT 100', noSeri: '', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 1500000, hargaSewa: 50000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Mic podcast & vokal studio' },
  { id: 'ITEM26080100264336', kategori: 'MIC', namaBarang: 'CONDENSOR BM 800 BLACK', noSeri: '', satuan: 'Pcs', qtyTotal: 4, hargaPerolehan: 224980, hargaSewa: 15000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Multi mic podcast setup' },
  { id: 'ITEM26080100264345', kategori: 'MIC', namaBarang: 'DYNAMIC SHURE SM58', noSeri: '', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 325000, hargaSewa: 25000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Mic vokal live panggung' },
  { id: 'ITEM26080100264494', kategori: 'CLIP ON', namaBarang: 'SARAMONIC BLINK500 B2', noSeri: '68341/SDPPI/2020', satuan: 'Set', qtyTotal: 2, hargaPerolehan: 2049000, hargaSewa: 75000, lokasiSimpan: 'Etalase Audio A', kondisiAlat: 'Baik', keterangan: 'Wireless mic dual transmitter' },
  { id: 'ITEM26080100264481', kategori: 'LENSA', namaBarang: 'SONY KIT 16-50mm F3.5-5.6 OSS', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 3400000, hargaSewa: 35000, lokasiSimpan: 'Dry Box 1', kondisiAlat: 'Baik', keterangan: 'Lensa serbaguna Sony E-mount' },
  { id: 'ITEM26080100264444', kategori: 'LENSA', namaBarang: 'MEIKE 50mm F1.2', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 1065000, hargaSewa: 45000, lokasiSimpan: 'Dry Box 1', kondisiAlat: 'Baik', keterangan: 'Lensa portrait bokeh creamy' },
  { id: 'ITEM26080100264522', kategori: 'LENSA', namaBarang: 'NIKON DX SWM VR ED 18-105mm', noSeri: 'AF-S 18-105mm 1:35-56 G ED', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 2300000, hargaSewa: 45000, lokasiSimpan: 'Dry Box 2', kondisiAlat: 'Baik', keterangan: 'Lensa sapujagad Nikon' },
  { id: 'ITEM26080100264562', kategori: 'LENSA', namaBarang: '7ARTISANS MACRO 60mm F2.8 II', noSeri: '12510491', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 2512000, hargaSewa: 85000, lokasiSimpan: 'Dry Box 2', kondisiAlat: 'Baik', keterangan: 'Lensa foto produk close-up detail' },
  { id: 'ITEM26080100264646', kategori: 'MIXER', namaBarang: 'HARDWELL REVERB 6 PRO', noSeri: '', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 900000, hargaSewa: 70000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Mixer 6 channel analog efek reverb' },
  { id: 'ITEM26080100264713', kategori: 'SOUNDCARD', namaBarang: 'ISK DS-ORCA MK2 24bit/192kHz', noSeri: '', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 650000, hargaSewa: 50000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Audio interface studio mini' },
  { id: 'ITEM26080100264720', kategori: 'SOUNDCARD', namaBarang: 'STEINBERG UR44C 6CH', noSeri: '', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 4851000, hargaSewa: 150000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Pro soundcard 6 in / 4 out DSP Yamaha' },
  { id: 'ITEM26080100264850', kategori: 'SOUNDCARD', namaBarang: 'STEINBERG CI+ 2CH', noSeri: 'YCSK01289', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 1200000, hargaSewa: 60000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'USB interface 2 channel portable' },
  { id: 'ITEM26080100264882', kategori: 'MIDI CONTROLLER', namaBarang: 'i-KEYBOARD ICON S16', noSeri: '211IB00269', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 4350000, hargaSewa: 100000, lokasiSimpan: 'Studio Musik', kondisiAlat: 'Baik', keterangan: 'Keyboard aransemen musik jingle' },
  { id: 'ITEM26080100264942', kategori: 'SPEAKER', namaBarang: 'DS4A', noSeri: '', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 1350000, hargaSewa: 60000, lokasiSimpan: 'Ruang Editing', kondisiAlat: 'Baik', keterangan: 'Studio monitor speaker sepasang' },
  { id: 'ITEM26080100264992', kategori: 'SPEAKER', namaBarang: 'DS-NEMO', noSeri: '', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 1450000, hargaSewa: 60000, lokasiSimpan: 'Ruang Editing', kondisiAlat: 'Baik', keterangan: 'Speaker flat monitoring audio' },
  { id: 'ITEM26080100265020', kategori: 'LENSA', namaBarang: 'NIKON AF-S 50mm f1.2', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 1100000, hargaSewa: 50000, lokasiSimpan: 'Dry Box 2', kondisiAlat: 'Baik', keterangan: 'Lensa prime manual ultra-fast' },
  { id: 'ITEM26080100265024', kategori: 'GITAR', namaBarang: 'IBANEZ JAM BLACK', noSeri: '', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 7500000, hargaSewa: 100000, lokasiSimpan: 'Studio Musik', kondisiAlat: 'Baik', keterangan: 'Gitar elektrik pro recording' },
  { id: 'ITEM26080100265138', kategori: 'GITAR', namaBarang: 'FENDER STRATOCASTER', noSeri: '', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 2250000, hargaSewa: 75000, lokasiSimpan: 'Studio Musik', kondisiAlat: 'Baik', keterangan: 'Gitar elektrik classic vintage' },
  { id: 'ITEM26080100265184', kategori: 'GITAR', namaBarang: 'AKUSTIK COWBOY GWC-235 NA', noSeri: '', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 1200000, hargaSewa: 50000, lokasiSimpan: 'Studio Musik', kondisiAlat: 'Baik', keterangan: 'Gitar akustik natural sound' },
  { id: 'ITEM26080100265221', kategori: 'GITAR', namaBarang: 'AKUSTIK COWBOY GWC-240 NA', noSeri: '', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 1700000, hargaSewa: 50000, lokasiSimpan: 'Studio Musik', kondisiAlat: 'Baik', keterangan: 'Gitar akustik pre-amp onboard' },
  { id: 'ITEM26080100265346', kategori: 'GIMBAL', namaBarang: 'MOZA MINI', noSeri: 'E5 19300208039377', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 1200000, hargaSewa: 50000, lokasiSimpan: 'Rak Gimbal', kondisiAlat: 'Baik', keterangan: 'Stabilizer smartphone video liputan' },
  { id: 'ITEM26080100265329', kategori: 'GIMBAL', namaBarang: 'ZHIYUN WEEBILL S', noSeri: '83E035058110712', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 7500000, hargaSewa: 150000, lokasiSimpan: 'Rak Gimbal', kondisiAlat: 'Baik', keterangan: 'Gimbal kamera pro mirrorless' },
  { id: 'ITEM26080100265428', kategori: 'FLASHLIGHT', namaBarang: 'GOGOX TT600', noSeri: '', satuan: 'Unit', qtyTotal: 3, hargaPerolehan: 785000, hargaSewa: 25000, lokasiSimpan: 'Etalase Lighting', kondisiAlat: 'Baik', keterangan: 'Flash speedlite GN60 wireless' },
  { id: 'ITEM26080100265458', kategori: 'CONTINUES LIGHT', namaBarang: 'INBEX IL-100S', noSeri: '', satuan: 'Unit', qtyTotal: 2, hargaPerolehan: 474210, hargaSewa: 35000, lokasiSimpan: 'Etalase Lighting', kondisiAlat: 'Baik', keterangan: 'Lampu continuous COB 100W video' },
  { id: 'ITEM26080100265422', kategori: 'HEADPHONES', namaBarang: 'iSK AT2000', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 300000, hargaSewa: 20000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Monitoring headphone flat' },
  { id: 'ITEM26080100265540', kategori: 'HEADPHONES', namaBarang: 'DS70', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 510000, hargaSewa: 25000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Headphone operator shooting' },
  { id: 'ITEM26080100265515', kategori: 'TRIPOD', namaBarang: 'SONY', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 710000, hargaSewa: 30000, lokasiSimpan: 'Gudang Tripod', kondisiAlat: 'Baik', keterangan: 'Tripod kamera video Sony' },
  { id: 'ITEM26080100265578', kategori: 'TRIPOD', namaBarang: 'FOTOPRO X2', noSeri: '', satuan: 'Unit', qtyTotal: 2, hargaPerolehan: 399000, hargaSewa: 25000, lokasiSimpan: 'Gudang Tripod', kondisiAlat: 'Baik', keterangan: 'Tripod foto kokoh' },
  { id: 'ITEM26080100265612', kategori: 'LIGHTSTAND', namaBarang: 'TAFF STUDIO SB-MS-B5070', noSeri: '', satuan: 'Unit', qtyTotal: 2, hargaPerolehan: 300000, hargaSewa: 20000, lokasiSimpan: 'Gudang Stand', kondisiAlat: 'Baik', keterangan: 'Stand softbox studio' },
  { id: 'ITEM26080100265633', kategori: 'KAMERA', namaBarang: 'WEBCAM BRIO STREAM 4K', noSeri: '', satuan: 'Unit', qtyTotal: 2, hargaPerolehan: 3440000, hargaSewa: 75000, lokasiSimpan: 'Ruang Live', kondisiAlat: 'Baik', keterangan: 'Webcam ultra HD live streaming' },
  { id: 'ITEM26080100265649', kategori: 'ROUTER', namaBarang: 'TENDA F3 N ROUTER 300Mbps 3 ANTENA', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 150600, hargaSewa: 15000, lokasiSimpan: 'Ruang Live', kondisiAlat: 'Baik', keterangan: 'Jaringan dedicated live broadcast' },
  { id: 'ITEM26080100265710', kategori: 'KABEL', namaBarang: 'VENTION USB TYPE C TO 3.5mm 1 M', noSeri: '', satuan: 'Roll', qtyTotal: 1, hargaPerolehan: 85000, hargaSewa: 5000, lokasiSimpan: 'Kabel Box B', kondisiAlat: 'Baik', keterangan: 'Adapter audio smartphone' },
  { id: 'ITEM26080100265725', kategori: 'KABEL', namaBarang: 'USB to RJ45 1.5M', noSeri: '', satuan: 'Roll', qtyTotal: 2, hargaPerolehan: 24000, hargaSewa: 5000, lokasiSimpan: 'Kabel Box B', kondisiAlat: 'Baik', keterangan: 'Adapter LAN streaming' },
  { id: 'ITEM26080100265741', kategori: 'KABEL', namaBarang: 'USB EXTENSION', noSeri: '', satuan: 'Roll', qtyTotal: 2, hargaPerolehan: 18145, hargaSewa: 5000, lokasiSimpan: 'Kabel Box B', kondisiAlat: 'Baik', keterangan: 'Perpanjangan USB capture' },
  { id: 'ITEM26080100265812', kategori: 'ACCESORIES', namaBarang: 'MAGIC ARM 11" + BALLHEAD', noSeri: '', satuan: 'Pcs', qtyTotal: 2, hargaPerolehan: 120000, hargaSewa: 10000, lokasiSimpan: 'Box Aksesoris 1', kondisiAlat: 'Baik', keterangan: 'Klem mounting monitor kamera' },
  { id: 'ITEM26080100265839', kategori: 'CLIP ON', namaBarang: 'YANMAI R911 TRS OMNIDIRECTIONAL', noSeri: '', satuan: 'Set', qtyTotal: 2, hargaPerolehan: 145000, hargaSewa: 15000, lokasiSimpan: 'Etalase Audio B', kondisiAlat: 'Baik', keterangan: 'Lavalier mic backup' },
  { id: 'ITEM26080100265842', kategori: 'MODIFIER', namaBarang: 'GODOX SOFTBOX OCTAGONAL + HONEYCOMB GRID 95CM BOWENS', noSeri: 'SB-UE', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 715000, hargaSewa: 40000, lokasiSimpan: 'Gudang Modifier', kondisiAlat: 'Baik', keterangan: 'Softbox octabox diffuser lembut' },
  { id: 'ITEM26080100265901', kategori: 'KABEL', namaBarang: 'TaffSTUDIO XLR M/F BOF30 5M', noSeri: '', satuan: 'Roll', qtyTotal: 4, hargaPerolehan: 40700, hargaSewa: 10000, lokasiSimpan: 'Kabel Box A', kondisiAlat: 'Baik', keterangan: 'Kabel panjang mic panggung' },
  { id: 'ITEM26080100265918', kategori: 'KABEL', namaBarang: 'VENTION USB A MALE TO B MALE WITH POWER SUPPLY', noSeri: '', satuan: 'Roll', qtyTotal: 1, hargaPerolehan: 71000, hargaSewa: 5000, lokasiSimpan: 'Kabel Box B', kondisiAlat: 'Baik', keterangan: 'Kabel audio interface' },
  { id: 'ITEM26080100265933', kategori: 'ACCESORIES', namaBarang: 'SOUNDTECH STANDING TABLE MIC', noSeri: '', satuan: 'Unit', qtyTotal: 4, hargaPerolehan: 220000, hargaSewa: 15000, lokasiSimpan: 'Studio Audio', kondisiAlat: 'Baik', keterangan: 'Stand meja podcast' },
  { id: 'ITEM26080100266012', kategori: 'BATERAI', namaBarang: 'K&F NIKON EN-EL15 + DUAL CHARGER', noSeri: '', satuan: 'Pcs', qtyTotal: 2, hargaPerolehan: 437000, hargaSewa: 20000, lokasiSimpan: 'Kotak Baterai', kondisiAlat: 'Baik', keterangan: 'Baterai cadangan Nikon' },
  { id: 'ITEM26080100266030', kategori: 'BATERAI', namaBarang: 'K&F SONY NP-FW50 ZV-E10', noSeri: '', satuan: 'Pcs', qtyTotal: 2, hargaPerolehan: 199000, hargaSewa: 20000, lokasiSimpan: 'Kotak Baterai', kondisiAlat: 'Baik', keterangan: 'Baterai cadangan Sony A6400' },
  { id: 'ITEM26080100266044', kategori: 'BATERAI', namaBarang: 'SONY ORIGINAL NP-FW50 ZV-E10', noSeri: '', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 630000, hargaSewa: 25000, lokasiSimpan: 'Kotak Baterai', kondisiAlat: 'Baik', keterangan: 'Baterai original kamera Sony' },
  { id: 'ITEM26080100266100', kategori: 'BATERAI', namaBarang: 'NIKON ORIGINAL EN-EL15', noSeri: '', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 510000, hargaSewa: 25000, lokasiSimpan: 'Kotak Baterai', kondisiAlat: 'Baik', keterangan: 'Baterai original Nikon' },
  { id: 'ITEM26080100266112', kategori: 'LAPTOP', namaBarang: 'ASUS ROG KV', noSeri: 'ROG-KV-01', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 18000000, hargaSewa: 200000, lokasiSimpan: 'Ruang Editing', kondisiAlat: 'Baik', keterangan: 'Laptop editing 4K & rendering' },
  { id: 'ITEM26080100266125', kategori: 'LAPTOP', namaBarang: 'ASUS ROG STUDIO', noSeri: 'ROG-ST-02', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 12000000, hargaSewa: 150000, lokasiSimpan: 'Ruang Editing', kondisiAlat: 'Baik', keterangan: 'Laptop workstation lapangan' },
  { id: 'ITEM26080100266144', kategori: 'TAB', namaBarang: 'HUAWEI MATEPAD 11.5 + KEYBOARD + STYLUS', noSeri: 'HW-MP115', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 6500000, hargaSewa: 75000, lokasiSimpan: 'Meja Kontrol', kondisiAlat: 'Baik', keterangan: 'Tablet teleprompter & storyboard' },
  { id: 'ITEM26080100266160', kategori: 'MONITOR', namaBarang: 'LED POLYTRON 32 INCH', noSeri: 'PLY-32-01', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 1700000, hargaSewa: 60000, lokasiSimpan: 'Ruang Studio', kondisiAlat: 'Baik', keterangan: 'Monitor preview talent' },
  { id: 'ITEM26080100266172', kategori: 'MONITOR', namaBarang: 'LG 24 INCH IPS', noSeri: 'LG-24-IPS', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 1200000, hargaSewa: 50000, lokasiSimpan: 'Ruang Editing', kondisiAlat: 'Baik', keterangan: 'Monitor color grading' },
  { id: 'ITEM26080100266205', kategori: 'TRIGER', namaBarang: 'GODOX X2T SONY', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 929000, hargaSewa: 25000, lokasiSimpan: 'Etalase Lighting', kondisiAlat: 'Baik', keterangan: 'Wireless flash trigger Bluetooth' },
  { id: 'ITEM26080100266219', kategori: 'MODIFIER', namaBarang: 'REFLEKTOR 5IN1 120X180CM', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 520000, hargaSewa: 15000, lokasiSimpan: 'Gudang Modifier', kondisiAlat: 'Baik', keterangan: 'Reflektor jumbo fotografi' },
  { id: 'ITEM26080100266230', kategori: 'MODIFIER', namaBarang: 'SOFTBOX GODOX 60X120CM STRIP', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 590000, hargaSewa: 20000, lokasiSimpan: 'Gudang Modifier', kondisiAlat: 'Baik', keterangan: 'Stripbox rim light portrait' },
  { id: 'ITEM26080100266245', kategori: 'LIGHTSTAND', namaBarang: 'EXCELL PS AIR 2m', noSeri: '', satuan: 'Unit', qtyTotal: 2, hargaPerolehan: 419000, hargaSewa: 35000, lokasiSimpan: 'Gudang Stand', kondisiAlat: 'Baik', keterangan: 'Lightstand air cushion aman' },
  { id: 'ITEM26080100266258', kategori: 'LIGHTSTAND', namaBarang: 'TAKARA SPIRIT-1 1.5 m', noSeri: '', satuan: 'Unit', qtyTotal: 1, hargaPerolehan: 242000, hargaSewa: 15000, lokasiSimpan: 'Gudang Stand', kondisiAlat: 'Baik', keterangan: 'Lightstand portable ringkas' },
  { id: 'ITEM26080100266270', kategori: 'ACCESORIES', namaBarang: 'HDMI VIDEO CAPTURE USB 3.0', noSeri: '', satuan: 'Pcs', qtyTotal: 1, hargaPerolehan: 450000, hargaSewa: 30000, lokasiSimpan: 'Box Aksesoris 2', kondisiAlat: 'Baik', keterangan: 'Capture card 1080p 60fps live stream' },
  { id: 'ITEM26080100266284', kategori: 'ACCESORIES', namaBarang: 'TAS RANSEL CAMERA EIGER', noSeri: '', satuan: 'Set', qtyTotal: 1, hargaPerolehan: 850000, hargaSewa: 25000, lokasiSimpan: 'Rak Tas', kondisiAlat: 'Baik', keterangan: 'Backpack water resistant lapangan' }
];

export const SEED_BOOKINGS: BookingItem[] = [
  {
    id: 'BOOK26101000101',
    groupId: 'GRP261010001',
    nomorFormulir: 'EQP/2026/10/0001',
    itemId: 'ITEM26080100263951',
    namaBarang: 'SONY A6400',
    kategori: 'KAMERA',
    qty: 1,
    tanggalPinjam: '2026-10-10',
    tanggalKembaliRencana: '2026-10-13',
    untukProyek: 'Shoot Klien Kopi Kenangan Brand Video',
    kategoriPeminjam: 'Tim Internal',
    dipesanOleh: 'Loehendra Mahendra',
    namaPeminjamEksternal: '',
    kontakPeminjam: '081234567890',
    noKtp: '5201012304900001',
    status: 'Sedang Dipinjam',
    waktuCheckout: '10/10/2026 09:30',
    picMengeluarkan: 'obeecreatives Admin',
    picMembawa: 'Loehendra Mahendra',
    waktuPengembalian: '',
    picMenerima: '',
    kondisiKembali: '',
    catatanKembali: '',
    createdAt: '10/10/2026 08:45',
    statusBiaya: 'Maintenance Charge',
    biayaSewa: 37500
  },
  {
    id: 'BOOK26101000102',
    groupId: 'GRP261010001',
    nomorFormulir: 'EQP/2026/10/0001',
    itemId: 'ITEM26080100264494',
    namaBarang: 'SARAMONIC BLINK500 B2',
    kategori: 'CLIP ON',
    qty: 1,
    tanggalPinjam: '2026-10-10',
    tanggalKembaliRencana: '2026-10-13',
    untukProyek: 'Shoot Klien Kopi Kenangan Brand Video',
    kategoriPeminjam: 'Tim Internal',
    dipesanOleh: 'Loehendra Mahendra',
    namaPeminjamEksternal: '',
    kontakPeminjam: '081234567890',
    noKtp: '5201012304900001',
    status: 'Sedang Dipinjam',
    waktuCheckout: '10/10/2026 09:30',
    picMengeluarkan: 'obeecreatives Admin',
    picMembawa: 'Loehendra Mahendra',
    waktuPengembalian: '',
    picMenerima: '',
    kondisiKembali: '',
    catatanKembali: '',
    createdAt: '10/10/2026 08:45',
    statusBiaya: 'Maintenance Charge',
    biayaSewa: 18750
  },
  {
    id: 'BOOK26100800201',
    groupId: 'GRP261008002',
    nomorFormulir: 'EQP/2026/10/0002',
    itemId: 'ITEM26080100264042',
    namaBarang: 'NIKON D7100',
    kategori: 'KAMERA',
    qty: 1,
    tanggalPinjam: '2026-10-06',
    tanggalKembaliRencana: '2026-10-08',
    untukProyek: 'Dokumentasi Seminar Nasional',
    kategoriPeminjam: 'Eksternal',
    dipesanOleh: 'Dewi Lestari',
    namaPeminjamEksternal: 'Dewi Lestari (EO Samudra)',
    kontakPeminjam: '085712348899',
    noKtp: '3171015607920003',
    status: 'Sedang Dipinjam',
    waktuCheckout: '06/10/2026 14:00',
    picMengeluarkan: 'Admin Studio',
    picMembawa: 'Dewi Lestari',
    waktuPengembalian: '',
    picMenerima: '',
    kondisiKembali: '',
    catatanKembali: '',
    createdAt: '06/10/2026 11:20',
    statusBiaya: 'Full Charge',
    biayaSewa: 75000
  }
];

export const SEED_USERS: AppUser[] = [
  { id: 'USR001', email: 'obeecreatives@gmail.com', nama: 'obeecreatives Perusahaan', role: 'Admin', status: 'Aktif', createdAt: '01/08/2026 09:00' },
  { id: 'USR002', email: 'obeetools@gmail.com', nama: 'Developer Suite', role: 'Admin', status: 'Aktif', createdAt: '01/08/2026 09:00' },
  { id: 'USR003', email: 'loehendra@gmail.com', nama: 'Loehendra (Engineer / PM)', role: 'Admin', status: 'Aktif', createdAt: '01/08/2026 09:00' },
  { id: 'USR004', email: 'creator@obeecreatives.com', nama: 'Tim Video Production', role: 'Staff', status: 'Aktif', createdAt: '15/09/2026 10:30' }
];

export const SEED_STOCK_OPNAME: StockOpnameRow[] = [
  {
    id: 'OPNI260930001',
    sesiOpnameId: 'OPN260930',
    tanggalOpname: '30/09/2026 16:00',
    pic: 'Loehendra Mahendra',
    itemId: 'ITEM26080100263951',
    namaBarang: 'SONY A6400',
    kategori: 'KAMERA',
    qtySistem: 1,
    qtyAktual: 1,
    selisih: 0,
    catatan: 'Kondisi sensor bersih, fungsi normal',
    penyesuaianDiterapkan: true
  },
  {
    id: 'OPNI260930002',
    sesiOpnameId: 'OPN260930',
    tanggalOpname: '30/09/2026 16:00',
    pic: 'Loehendra Mahendra',
    itemId: 'ITEM26080100264336',
    namaBarang: 'CONDENSOR BM 800 BLACK',
    kategori: 'MIC',
    qtySistem: 4,
    qtyAktual: 4,
    selisih: 0,
    catatan: 'Semua 4 unit terhitung lengkap',
    penyesuaianDiterapkan: true
  }
];

// Helper Storage
export function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading localStorage ${key}:`, e);
    return fallback;
  }
}

export function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving localStorage ${key}:`, e);
  }
}

export function getGasUrl(): string {
  return localStorage.getItem('eq_gas_url') || DEFAULT_GAS_URL;
}

export function setGasUrl(url: string): void {
  localStorage.setItem('eq_gas_url', url.trim());
}

export function getStoredRole(): Role {
  return (localStorage.getItem('eq_current_role') as Role) || 'Project Manager';
}

export function setStoredRole(role: Role): void {
  localStorage.setItem('eq_current_role', role);
}

export function getStoredTheme(): 'dark' | 'light' {
  return (localStorage.getItem('eq_theme') as 'dark' | 'light') || 'dark';
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem('eq_theme', theme);
}

export function getSidebarCollapsed(): boolean {
  return localStorage.getItem('eq_sidebar_collapsed') === 'true';
}

export function setSidebarCollapsed(collapsed: boolean): void {
  localStorage.setItem('eq_sidebar_collapsed', collapsed ? 'true' : 'false');
}

export function getAutoSync(): boolean {
  const v = localStorage.getItem('eq_auto_sync');
  return v === null ? true : v === 'true';
}

export function setAutoSync(enabled: boolean): void {
  localStorage.setItem('eq_auto_sync', enabled ? 'true' : 'false');
}

export function getOutboxQueue(): OutboxAction[] {
  return loadStorage<OutboxAction[]>('eq_outbox', []);
}

export function saveOutboxQueue(queue: OutboxAction[]): void {
  saveStorage('eq_outbox', queue);
}
