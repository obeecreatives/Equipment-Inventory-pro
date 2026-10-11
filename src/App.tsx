import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  InventarisItem, 
  BookingItem, 
  BookingGroup, 
  StockOpnameRow, 
  AppUser, 
  Role, 
  ToastMessage, 
  KondisiKembali 
} from './types/inventory';
import { 
  loadStorage, 
  saveStorage, 
  SEED_INVENTARIS, 
  SEED_BOOKINGS, 
  SEED_USERS, 
  SEED_STOCK_OPNAME,
  getStoredRole, 
  setStoredRole, 
  getStoredTheme, 
  setStoredTheme, 
  getSidebarCollapsed, 
  setSidebarCollapsed, 
  getAutoSync, 
  setAutoSync, 
  getGasUrl 
} from './lib/storage';
import { 
  fetchInitialDataFromGas, 
  pingGasEndpoint, 
  postToGas, 
  enqueueOutbox, 
  flushOutboxQueue 
} from './lib/gasClient';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { MetricCards } from './components/MetricCards';
import { PeralatanTab } from './components/PeralatanTab';
import { BookingTab } from './components/BookingTab';
import { RiwayatTab } from './components/RiwayatTab';
import { NilaiAsetTab } from './components/NilaiAsetTab';
import { Toast } from './components/Toast';

// Modals
import { BookingModal } from './components/modals/BookingModal';
import { CheckoutModal } from './components/modals/CheckoutModal';
import { ReturnModal } from './components/modals/ReturnModal';
import { ItemModal } from './components/modals/ItemModal';
import { StockOpnameModal } from './components/modals/StockOpnameModal';
import { UserAccessModal } from './components/modals/UserAccessModal';
import { GasCenterModal } from './components/modals/GasCenterModal';
import { HelpModal } from './components/modals/HelpModal';

export default function App() {
  // Theme & Layout Preferences - Mode Gelap sebagai default
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('eq_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => getSidebarCollapsed());
  const [currentRole, setCurrentRole] = useState<Role>(() => getStoredRole());
  const [currentTab, setCurrentTab] = useState<TabType>('peralatan');

  // Core Data Entities with 0.01s Instant LocalStorage Fallback
  const [inventaris, setInventaris] = useState<InventarisItem[]>(() => 
    loadStorage<InventarisItem[]>('eq_inventaris', SEED_INVENTARIS)
  );
  const [bookings, setBookings] = useState<BookingItem[]>(() => 
    loadStorage<BookingItem[]>('eq_bookings', SEED_BOOKINGS)
  );
  const [stockOpname, setStockOpname] = useState<StockOpnameRow[]>(() => 
    loadStorage<StockOpnameRow[]>('eq_stock_opname', SEED_STOCK_OPNAME)
  );
  const [users, setUsers] = useState<AppUser[]>(() => 
    loadStorage<AppUser[]>('eq_users', SEED_USERS)
  );

  // Sync & Connection State
  const [autoSync, setAutoSyncState] = useState<boolean>(() => getAutoSync());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [gasConnected, setGasConnected] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [presetItemForBooking, setPresetItemForBooking] = useState<InventarisItem | null>(null);
  const [checkoutGroupTarget, setCheckoutGroupTarget] = useState<BookingGroup | null>(null);
  const [returnGroupTarget, setReturnGroupTarget] = useState<BookingGroup | null>(null);
  const [itemModalTarget, setItemModalTarget] = useState<InventarisItem | null>(null);
  const [showNewItemModal, setShowNewItemModal] = useState<boolean>(false);
  const [showOpnameModal, setShowOpnameModal] = useState<boolean>(false);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showGasCenterModal, setShowGasCenterModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Toast stack
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  // Persist local state changes immediately
  useEffect(() => {
    saveStorage('eq_inventaris', inventaris);
  }, [inventaris]);

  useEffect(() => {
    saveStorage('eq_bookings', bookings);
  }, [bookings]);

  useEffect(() => {
    saveStorage('eq_stock_opname', stockOpname);
  }, [stockOpname]);

  useEffect(() => {
    saveStorage('eq_users', users);
  }, [users]);

  // Sync background function
  const syncWithGas = useCallback(async (isManual: boolean = false) => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      // 1. Flush any pending offline mutations first
      await flushOutboxQueue();

      // 2. Fetch fresh initial data from GAS
      const res = await fetchInitialDataFromGas();
      if (res.ok && res.inventaris && res.inventaris.length > 0) {
        setInventaris(res.inventaris);
        if (res.bookings) setBookings(res.bookings);
        if (res.stockOpname) setStockOpname(res.stockOpname);
        if (res.users) setUsers(res.users);

        setGasConnected(true);
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);

        if (isManual) {
          addToast(`Data berhasil disinkronkan dengan Google Sheets (${timeStr})`, 'success');
        }
      }
    } catch (err: any) {
      console.warn('Background sync note:', err.message);
      setGasConnected(false);
      if (isManual) {
        addToast(`Gagal sync ke GAS: ${err.message}. Tetap berjalan di mode offline.`, 'warning');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, addToast]);

  // Initial mount: quick ping test and silent background sync
  useEffect(() => {
    syncWithGas(false);
    pingGasEndpoint().then(res => setGasConnected(res.ok)).catch(() => setGasConnected(false));
  }, []);

  // Recurring auto-sync interval (every 30 seconds if autoSync is active)
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      syncWithGas(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoSync, syncWithGas]);

  // Handlers
  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      addToast(next === 'dark' ? 'Mode Gelap (Deep Obsidian) Aktif' : 'Mode Terang (Crisp Studio White) Aktif', 'info');
      return next;
    });
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsedState(prev => {
      const next = !prev;
      setSidebarCollapsed(next);
      return next;
    });
  };

  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    setStoredRole(newRole);
    addToast(`Beralih ke hak akses: ${newRole}`, 'info');
  };

  const handleToggleAutoSync = () => {
    setAutoSyncState(prev => {
      const next = !prev;
      setAutoSync(next);
      addToast(next ? 'Auto-sync diaktifkan (rotasi live)' : 'Auto-sync dimatikan', 'info');
      return next;
    });
  };

  // Group Bookings by GroupID
  const groupedBookings: BookingGroup[] = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    bookings.forEach(b => {
      const key = b.groupId || b.id;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });

    return Object.keys(map).map(key => {
      const items = map[key];
      const first = items[0];
      const statuses = Array.from(new Set(items.map(i => i.status)));
      const groupStatus = statuses.length === 1 ? statuses[0] : (statuses[0] || 'Dipesan');

      return {
        groupId: key,
        nomorFormulir: first.nomorFormulir,
        untukProyek: first.untukProyek,
        tanggalPinjam: first.tanggalPinjam,
        tanggalKembaliRencana: first.tanggalKembaliRencana,
        kategoriPeminjam: first.kategoriPeminjam,
        dipesanOleh: first.dipesanOleh,
        namaPeminjamEksternal: first.namaPeminjamEksternal,
        kontakPeminjam: first.kontakPeminjam,
        noKtp: first.noKtp,
        status: groupStatus,
        statusBiaya: first.statusBiaya,
        totalBiaya: items.reduce((s, it) => s + (Number(it.biayaSewa) || 0), 0),
        items,
        createdAt: first.createdAt
      };
    }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [bookings]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const totalAlat = inventaris.reduce((s, i) => s + (Number(i.qtyTotal) || 0), 0);
    const totalBookingAktif = groupedBookings.filter(g => g.status === 'Dipesan' || g.status === 'Sedang Dipinjam').length;
    const sedangDipinjam = groupedBookings.filter(g => g.status === 'Sedang Dipinjam').length;
    const perluPerhatian = inventaris.filter(i => i.kondisiAlat && i.kondisiAlat !== 'Baik').length;
    return { totalAlat, totalBookingAktif, sedangDipinjam, perluPerhatian };
  }, [inventaris, groupedBookings]);

  // --- MUTATION ACTIONS (OPTIMISTIC + GAS REST) ---

  // 1. Create Booking Batch
  const handleCreateBookingBatch = async (
    sharedData: any,
    itemsToBook: { itemId: string; namaBarang: string; kategori: string; qty: number }[]
  ) => {
    const groupId = 'GRP' + Date.now();
    const nomorFormulir = `EQP/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newRows: BookingItem[] = itemsToBook.map((it, idx) => {
      const invItem = inventaris.find(i => i.id === it.itemId);
      const ratePersen = sharedData.statusBiaya === 'Maintenance Charge' ? 0.25 : (sharedData.statusBiaya === 'Full Charge' ? 1 : 0);
      const biayaSewa = Math.round((invItem?.hargaSewa || 0) * ratePersen * it.qty);

      return {
        id: 'BOOK' + Date.now() + idx,
        groupId,
        nomorFormulir,
        itemId: it.itemId,
        namaBarang: it.namaBarang,
        kategori: it.kategori,
        qty: it.qty,
        tanggalPinjam: sharedData.tanggalPinjam,
        tanggalKembaliRencana: sharedData.tanggalKembaliRencana,
        untukProyek: sharedData.untukProyek,
        kategoriPeminjam: sharedData.kategoriPeminjam,
        dipesanOleh: sharedData.dipesanOleh,
        namaPeminjamEksternal: sharedData.namaPeminjamEksternal,
        kontakPeminjam: sharedData.kontakPeminjam,
        noKtp: sharedData.noKtp,
        status: 'Dipesan',
        waktuCheckout: '',
        picMengeluarkan: '',
        picMembawa: '',
        waktuPengembalian: '',
        picMenerima: '',
        kondisiKembali: '',
        catatanKembali: '',
        createdAt: nowStr,
        statusBiaya: sharedData.statusBiaya,
        biayaSewa
      };
    });

    // Instant 0.01s optimistic update
    setBookings(prev => [...newRows, ...prev]);
    addToast(`Booking berhasil dibuat (${itemsToBook.length} alat). Nomor: ${nomorFormulir}`, 'success');

    // Silent background dispatch
    try {
      await postToGas('createBookingBatch', { shared: sharedData, items: itemsToBook });
    } catch (e: any) {
      enqueueOutbox('createBookingBatch', { shared: sharedData, items: itemsToBook });
    }
  };

  // 2. Checkout Group
  const handleCheckoutGroup = async (groupId: string, picMengeluarkan: string, picMembawa: string) => {
    const timeStr = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    setBookings(prev => prev.map(b => {
      if (b.groupId === groupId && b.status === 'Dipesan') {
        return {
          ...b,
          status: 'Sedang Dipinjam',
          waktuCheckout: timeStr,
          picMengeluarkan,
          picMembawa
        };
      }
      return b;
    }));

    addToast('Checkout paket berhasil! Alat telah dikeluarkan ke lapangan.', 'success');

    try {
      await postToGas('checkoutBookingGroup', { groupId, picMengeluarkan, picMembawa });
    } catch (e) {
      enqueueOutbox('checkoutBookingGroup', { groupId, picMengeluarkan, picMembawa });
    }
  };

  // 3. Return Group
  const handleReturnGroup = async (
    groupId: string,
    itemUpdates: Array<{ id: string; kondisiKembali: KondisiKembali; catatanKembali: string }>,
    picMenerima: string
  ) => {
    const timeStr = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Update bookings
    setBookings(prev => prev.map(b => {
      const match = itemUpdates.find(u => u.id === b.id);
      if (match) {
        return {
          ...b,
          status: 'Selesai',
          waktuPengembalian: timeStr,
          picMenerima,
          kondisiKembali: match.kondisiKembali,
          catatanKembali: match.catatanKembali
        };
      }
      return b;
    }));

    // Update inventaris condition if damaged/lost
    itemUpdates.forEach(upd => {
      if (upd.kondisiKembali === 'Rusak' || upd.kondisiKembali === 'Hilang') {
        const row = bookings.find(b => b.id === upd.id);
        if (row) {
          setInventaris(prev => prev.map(i => {
            if (i.id === row.itemId) {
              return {
                ...i,
                kondisiAlat: upd.kondisiKembali === 'Hilang' ? 'Hilang' : 'Perlu Servis'
              };
            }
            return i;
          }));
        }
      }
    });

    addToast('Pengembalian paket selesai! Data kondisi telah diperbarui.', 'success');

    try {
      await postToGas('returnBookingGroupDetailed', { groupId, itemUpdates, picMenerima });
    } catch (e) {
      enqueueOutbox('returnBookingGroupDetailed', { groupId, itemUpdates, picMenerima });
    }
  };

  // 4. Cancel Group
  const handleCancelGroup = async (group: BookingGroup) => {
    if (!window.confirm(`Yakin ingin membatalkan booking paket "${group.untukProyek}"?`)) return;

    setBookings(prev => prev.map(b => {
      if (b.groupId === group.groupId) {
        return { ...b, status: 'Dibatalkan' };
      }
      return b;
    }));

    addToast('Paket booking dibatalkan.', 'info');

    try {
      await postToGas('cancelBookingGroup', { groupId: group.groupId });
    } catch (e) {
      enqueueOutbox('cancelBookingGroup', { groupId: group.groupId });
    }
  };

  // 5. Save/Edit Equipment Item
  const handleSaveItem = async (itemData: Partial<InventarisItem>) => {
    const isEdit = !!itemData.id;
    let targetId = itemData.id || ('ITEM' + Date.now());

    const newItem: InventarisItem = {
      id: targetId,
      namaBarang: itemData.namaBarang || '',
      kategori: itemData.kategori || 'KAMERA',
      noSeri: itemData.noSeri || '',
      satuan: itemData.satuan || 'Pcs',
      qtyTotal: Number(itemData.qtyTotal) || 1,
      hargaPerolehan: Number(itemData.hargaPerolehan) || 0,
      hargaSewa: Number(itemData.hargaSewa) || 0,
      lokasiSimpan: itemData.lokasiSimpan || '',
      kondisiAlat: itemData.kondisiAlat || 'Baik',
      keterangan: itemData.keterangan || '',
      fotoUrl: itemData.fotoUrl || ''
    };

    setInventaris(prev => {
      if (isEdit) {
        return prev.map(i => (i.id === targetId ? newItem : i));
      }
      return [newItem, ...prev];
    });

    addToast(isEdit ? 'Perubahan alat berhasil disimpan' : 'Alat baru berhasil ditambahkan');

    try {
      await postToGas('saveInventarisItem', { item: newItem });
    } catch (e) {
      enqueueOutbox('saveInventarisItem', { item: newItem });
    }
  };

  // 6. Save Stock Opname Batch
  const handleSaveOpname = async (
    pic: string,
    itemsOpname: Array<{
      itemId: string;
      namaBarang: string;
      kategori: string;
      qtySistem: number;
      qtyAktual: number;
      catatan: string;
      terapkan: boolean;
    }>
  ) => {
    const sesiId = 'OPN' + Date.now();
    const timeStr = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newLogs: StockOpnameRow[] = itemsOpname.map((it, idx) => ({
      id: 'OPNI' + Date.now() + idx,
      sesiOpnameId: sesiId,
      tanggalOpname: timeStr,
      pic,
      itemId: it.itemId,
      namaBarang: it.namaBarang,
      kategori: it.kategori,
      qtySistem: it.qtySistem,
      qtyAktual: it.qtyAktual,
      selisih: it.qtyAktual - it.qtySistem,
      catatan: it.catatan,
      penyesuaianDiterapkan: it.terapkan
    }));

    // Update opname history
    setStockOpname(prev => [...newLogs, ...prev]);

    // Apply adjustments to inventaris if terapkan is true
    itemsOpname.forEach(it => {
      if (it.terapkan && it.qtyAktual !== it.qtySistem) {
        setInventaris(prev => prev.map(i => {
          if (i.id === it.itemId) {
            return { ...i, qtyTotal: it.qtyAktual };
          }
          return i;
        }));
      }
    });

    addToast(`Stock Opname selesai! ${itemsOpname.length} alat dicek fisik.`, 'success');

    try {
      await postToGas('saveStockOpnameBatch', { pic, items: itemsOpname });
    } catch (e) {
      enqueueOutbox('saveStockOpnameBatch', { pic, items: itemsOpname });
    }
  };

  // 7. Save/Delete User Access
  const handleSaveUser = async (userData: Partial<AppUser>) => {
    const isEdit = !!userData.id;
    const targetId = userData.id || ('USR' + Date.now());
    const nowStr = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const updatedUser: AppUser = {
      id: targetId,
      email: userData.email || '',
      nama: userData.nama || '',
      role: userData.role || 'Staff',
      status: userData.status || 'Aktif',
      createdAt: userData.createdAt || nowStr
    };

    setUsers(prev => {
      if (isEdit) return prev.map(u => (u.id === targetId ? updatedUser : u));
      return [...prev, updatedUser];
    });

    addToast('Hak akses pengguna berhasil diperbarui');

    try {
      await postToGas('saveUserAccess', { user: updatedUser });
    } catch (e) {
      enqueueOutbox('saveUserAccess', { user: updatedUser });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    addToast('Pengguna dihapus');

    try {
      await postToGas('deleteUserAccess', { id: userId });
    } catch (e) {
      enqueueOutbox('deleteUserAccess', { id: userId });
    }
  };

  // 8. PDF Export Handler
  const handleExportPdf = async (group: BookingGroup) => {
    addToast('Menyiapkan formulir serah terima...', 'info');

    try {
      if (gasConnected) {
        const res = await postToGas<{ success: boolean; base64: string }>('generateBookingGroupPdfBase64', {
          groupId: group.groupId
        });

        if (res.base64) {
          const link = document.createElement('a');
          link.href = 'data:application/pdf;base64,' + res.base64;
          link.download = `Formulir-BAST-${(group.nomorFormulir || group.groupId).replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          addToast('Formulir PDF BAST berhasil diunduh!', 'success');
          return;
        }
      }
    } catch (err) {
      console.warn('GAS PDF direct generator fallback:', err);
    }

    // Client-side printable BAST fallback
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const itemsHtml = group.items.map((it, idx) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${idx + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;">${it.namaBarang}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;">${it.kategori}</td>
          <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${it.qty}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>BAST - ${group.nomorFormulir || group.groupId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 32px; color: #1a1a1a; }
              .logo { font-size: 24px; font-weight: bold; }
              .logo .obee { color: #1a1a1a; }
              .logo .creatives { color: #E30000; }
              .header-bar { border-bottom: 3px solid #E30000; padding-bottom: 12px; margin-bottom: 24px; }
              table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
              th { text-align: left; padding: 8px; border-bottom: 2px solid #333; }
              .signs { display: flex; justify-content: space-between; margin-top: 60px; text-align: center; }
              .sign-box { width: 40%; }
              .line { margin-top: 70px; border-top: 1px solid #333; }
            </style>
          </head>
          <body>
            <div class="header-bar">
              <div class="logo"><span class="obee">obee</span><span class="creatives">creatives</span></div>
              <div style="font-size: 13px; color: #666; margin-top: 4px;">Formulir Peminjaman & Berita Acara Serah Terima (BAST)</div>
            </div>
            <h2>Nomor Formulir: ${group.nomorFormulir || group.groupId}</h2>
            <p><strong>Untuk Proyek:</strong> ${group.untukProyek}</p>
            <p><strong>Peminjam:</strong> ${group.dipesanOleh || group.namaPeminjamEksternal} (${group.kategoriPeminjam})</p>
            <p><strong>Jadwal:</strong> ${group.tanggalPinjam} s/d ${group.tanggalKembaliRencana}</p>
            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align:center;">No</th>
                  <th>Nama Alat</th>
                  <th>Kategori</th>
                  <th style="width: 60px; text-align:center;">Qty</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div class="signs">
              <div class="sign-box">Yang Menyerahkan (Studio)<div class="line">${group.items[0]?.picMengeluarkan || '(..............................)'}</div></div>
              <div class="sign-box">Yang Menerima (Kru/Peminjam)<div class="line">${group.items[0]?.picMembawa || group.dipesanOleh || '(..............................)'}</div></div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      addToast('Jendela cetak BAST telah dibuka!', 'success');
    }
  };

  const handleBookSingleItem = (item: InventarisItem) => {
    setPresetItemForBooking(item);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Stack */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Global Full-Width Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        theme={theme}
        onThemeToggle={handleToggleTheme}
        isSyncing={isSyncing}
        autoSync={autoSync}
        onToggleAutoSync={handleToggleAutoSync}
        onManualRefresh={() => syncWithGas(true)}
        lastSyncTime={lastSyncTime}
        gasConnected={gasConnected}
        onOpenGasCenter={() => setShowGasCenterModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {/* Collapsible Sidebar (Desktop) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={handleToggleSidebar}
          currentRole={currentRole}
          onOpenBookingModal={() => {
            setPresetItemForBooking(null);
            setShowBookingModal(true);
          }}
          onOpenItemModal={() => {
            setItemModalTarget(null);
            setShowNewItemModal(true);
          }}
          onOpenOpnameModal={() => setShowOpnameModal(true)}
          onOpenUserModal={() => setShowUserModal(true)}
          bookingBadgeCount={groupedBookings.filter(g => g.status === 'Dipesan' || g.status === 'Sedang Dipinjam').length}
        />

        {/* Dynamic Main Workspace Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-12">
          {/* Top Metric Cards */}
          <MetricCards
            totalAlat={metrics.totalAlat}
            totalBookingAktif={metrics.totalBookingAktif}
            sedangDipinjam={metrics.sedangDipinjam}
            perluPerhatian={metrics.perluPerhatian}
          />

          {/* Tab Views */}
          {currentTab === 'peralatan' && (
            <PeralatanTab
              items={inventaris}
              currentRole={currentRole}
              onEditItem={item => {
                setItemModalTarget(item);
                setShowNewItemModal(true);
              }}
              onBookItem={handleBookSingleItem}
              onAddNewItem={() => {
                setItemModalTarget(null);
                setShowNewItemModal(true);
              }}
            />
          )}

          {currentTab === 'booking' && (
            <BookingTab
              groups={groupedBookings}
              currentRole={currentRole}
              onCheckoutGroup={g => setCheckoutGroupTarget(g)}
              onReturnGroup={g => setReturnGroupTarget(g)}
              onCancelGroup={handleCancelGroup}
              onExportPdf={handleExportPdf}
              onOpenNewBookingModal={() => {
                setPresetItemForBooking(null);
                setShowBookingModal(true);
              }}
            />
          )}

          {currentTab === 'riwayat' && (
            <RiwayatTab
              groups={groupedBookings}
              onExportPdf={handleExportPdf}
            />
          )}

          {currentTab === 'aset' && (
            <NilaiAsetTab
              items={inventaris}
              stockOpname={stockOpname}
            />
          )}
        </main>
      </div>

      {/* Mobile Ergonomic Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenBookingModal={() => {
          setPresetItemForBooking(null);
          setShowBookingModal(true);
        }}
        bookingBadgeCount={groupedBookings.filter(g => g.status === 'Dipesan' || g.status === 'Sedang Dipinjam').length}
        showAsetTab={currentRole === 'Admin' || currentRole === 'Project Manager'}
      />

      {/* MODALS */}
      {showBookingModal && (
        <BookingModal
          presetItem={presetItemForBooking}
          inventaris={inventaris}
          bookings={bookings}
          currentRole={currentRole}
          onClose={() => {
            setShowBookingModal(false);
            setPresetItemForBooking(null);
          }}
          onSubmitBatch={handleCreateBookingBatch}
        />
      )}

      {checkoutGroupTarget && (
        <CheckoutModal
          group={checkoutGroupTarget}
          onClose={() => setCheckoutGroupTarget(null)}
          onSubmitCheckout={handleCheckoutGroup}
        />
      )}

      {returnGroupTarget && (
        <ReturnModal
          group={returnGroupTarget}
          onClose={() => setReturnGroupTarget(null)}
          onSubmitReturn={handleReturnGroup}
        />
      )}

      {showNewItemModal && (
        <ItemModal
          item={itemModalTarget}
          onClose={() => {
            setShowNewItemModal(false);
            setItemModalTarget(null);
          }}
          onSave={handleSaveItem}
        />
      )}

      {showOpnameModal && (
        <StockOpnameModal
          inventaris={inventaris}
          onClose={() => setShowOpnameModal(false)}
          onSubmitOpname={handleSaveOpname}
        />
      )}

      {showUserModal && (
        <UserAccessModal
          users={users}
          onClose={() => setShowUserModal(false)}
          onSaveUser={handleSaveUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {showGasCenterModal && (
        <GasCenterModal
          onClose={() => setShowGasCenterModal(false)}
          onUrlUpdated={() => syncWithGas(true)}
          onAddToast={addToast}
        />
      )}

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}
