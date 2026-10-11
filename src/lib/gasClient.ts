import { GasInitialDataResponse, OutboxAction } from '../types/inventory';
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
