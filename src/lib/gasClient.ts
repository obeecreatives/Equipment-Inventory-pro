import {
  GasInitialDataResponse,
  OutboxAction,
  PublicBookingStatusResult,
  PublicPortalDataResponse
} from '../types/inventory';
import { getGasUrl, getOutboxQueue, saveOutboxQueue } from './storage';

/**
 * Client REST Headless Google Apps Script
 * Menggunakan trik header 'text/plain' untuk mencegah kegagalan CORS OPTIONS Preflight
 * dan mendukung redirect HTTP 302 otomatis dari Apps Script.
 */
export async function fetchInitialDataFromGas(userEmail?: string): Promise<GasInitialDataResponse> {
  const gasUrl = getGasUrl();
  const url = new URL(gasUrl);
  url.searchParams.set('action', 'getInitialData');
  if (userEmail) {
    url.searchParams.set('email', userEmail);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  const data: GasInitialDataResponse = await response.json();
  if (!data.ok && data.errorMessage) {
    throw new Error(data.errorMessage);
  }

  return data;
}

/**
 * Fetch katalog publik tersanitasi & slot booking ter-anonimisasi untuk portal /booking
 */
export async function fetchPublicPortalData(): Promise<PublicPortalDataResponse> {
  const gasUrl = getGasUrl();
  const url = new URL(gasUrl);
  url.searchParams.set('action', 'getPublicPortalData');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Graceful fallback jika Code.gs versi lama belum dideploy ulang dengan getPublicPortalData:
  // Tarik dari getInitialData lalu sanitasi total di client sebelum dikembalikan ke UI publik.
  if (data && data.ok === false && typeof data.message === 'string' && data.message.includes('Unknown GET action')) {
    const initial = await fetchInitialDataFromGas();
    const sanitizedInventaris = (initial.inventaris || [])
      .filter(item => item.kondisiAlat === 'Baik')
      .map(item => ({
        ...item,
        noSeri: '',
        hargaPerolehan: 0,
        lokasiSimpan: ''
      }));

    const sanitizedSlots = (initial.bookings || [])
      .filter(b => b.status === 'Dipesan' || b.status === 'Sedang Dipinjam')
      .map(b => ({
        itemId: b.itemId,
        qty: Number(b.qty) || 1,
        tanggalPinjam: b.tanggalPinjam,
        tanggalKembaliRencana: b.tanggalKembaliRencana,
        status: b.status
      }));

    return {
      ok: true,
      inventaris: sanitizedInventaris,
      bookingSlots: sanitizedSlots
    };
  }

  if (!data.ok && data.errorMessage) {
    throw new Error(data.errorMessage);
  }

  return data as PublicPortalDataResponse;
}

/**
 * Cek status approval booking publik berdasarkan Nomor Formulir & 4 digit terakhir No. WA
 */
export async function checkPublicBookingStatus(
  nomorFormulir: string,
  kontakLast4: string
): Promise<PublicBookingStatusResult> {
  const gasUrl = getGasUrl();
  const url = new URL(gasUrl);
  url.searchParams.set('action', 'checkPublicBookingStatus');
  url.searchParams.set('nomorFormulir', nomorFormulir.trim());
  url.searchParams.set('kontakLast4', kontakLast4.replace(/[^0-9]/g, '').slice(-4));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Graceful fallback jika Code.gs versi lama belum dideploy ulang
  if (data && data.ok === false && typeof data.message === 'string' && data.message.includes('Unknown GET action')) {
    const initial = await fetchInitialDataFromGas();
    const targetForm = nomorFormulir.trim().toUpperCase();
    const targetDigits = kontakLast4.replace(/[^0-9]/g, '').slice(-4);
    const matchingRows = (initial.bookings || []).filter(b => {
      const formMatch = String(b.nomorFormulir || '').trim().toUpperCase() === targetForm;
      const phoneDigits = String(b.kontakPeminjam || '').replace(/[^0-9]/g, '');
      const phoneMatch = targetDigits.length === 4 && phoneDigits.endsWith(targetDigits);
      return formMatch && phoneMatch;
    });

    if (matchingRows.length === 0) {
      return { ok: true, found: false };
    }

    const first = matchingRows[0];
    return {
      ok: true,
      found: true,
      nomorFormulir: first.nomorFormulir,
      untukProyek: first.untukProyek,
      namaPeminjam: first.namaPeminjamEksternal || first.dipesanOleh,
      kategoriPeminjam: first.kategoriPeminjam,
      tanggalPinjam: first.tanggalPinjam,
      tanggalKembaliRencana: first.tanggalKembaliRencana,
      status: first.status,
      statusApproval: first.statusApproval || 'Menunggu Konfirmasi',
      catatanApproval: first.catatanApproval || '',
      statusBiaya: first.statusBiaya,
      totalBiaya: matchingRows.reduce((s, r) => s + (Number(r.biayaSewa) || 0), 0),
      items: matchingRows.map(r => ({
        namaBarang: r.namaBarang,
        kategori: r.kategori,
        qty: Number(r.qty) || 1
      }))
    };
  }

  return data as PublicBookingStatusResult;
}

export async function pingGasEndpoint(): Promise<{ ok: boolean; latencyMs: number; message: string; spreadsheetId?: string }> {
  const gasUrl = getGasUrl();
  const url = new URL(gasUrl);
  url.searchParams.set('action', 'testPing');

  const start = performance.now();
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const elapsed = Math.round(performance.now() - start);

    if (!response.ok) {
      return { ok: false, latencyMs: elapsed, message: `Status HTTP ${response.status}` };
    }

    const data = await response.json();
    return {
      ok: true,
      latencyMs: elapsed,
      message: data.message || 'pong',
      spreadsheetId: data.spreadsheetId
    };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - start);
    return { ok: false, latencyMs: elapsed, message: err.message || 'Gagal menghubungi server GAS' };
  }
}

export async function postToGas<T = any>(action: string, payload: Record<string, any>): Promise<T> {
  const gasUrl = getGasUrl();
  const body = JSON.stringify({ action, ...payload });

  const response = await fetch(gasUrl, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.ok === false && result.errorMessage) {
    throw new Error(result.errorMessage);
  }
  return result as T;
}

/**
 * Flush antrean mutasi outbox ke GAS
 */
export async function flushOutboxQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getOutboxQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  const remaining: OutboxAction[] = [];
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await postToGas(item.action, item.payload);
      synced++;
    } catch (err) {
      item.retryCount = (item.retryCount || 0) + 1;
      item.status = 'failed';
      failed++;
      remaining.push(item);
    }
  }

  saveOutboxQueue(remaining);
  return { synced, failed };
}

/**
 * Queue mutasi ke antrean lokal jika koneksi offline/lambat
 */
export function enqueueOutbox(action: string, payload: any): void {
  const queue = getOutboxQueue();
  const item: OutboxAction = {
    id: 'OUT_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action,
    payload,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending'
  };
  queue.push(item);
  saveOutboxQueue(queue);
}
