import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { pingGasEndpoint, flushOutboxQueue } from '../../lib/gasClient';
import { getGasUrl, setGasUrl, getOutboxQueue, SPREADSHEET_ID } from '../../lib/storage';

interface GasCenterModalProps {
  onClose: () => void;
  onUrlUpdated: () => void;
  onAddToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const GasCenterModal: React.FC<GasCenterModalProps> = ({
  onClose,
  onUrlUpdated,
  onAddToast
}) => {
  const [url, setUrl] = useState(getGasUrl());
  const [testing, setTesting] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok: boolean; latencyMs: number; message: string; spreadsheetId?: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [flushing, setFlushing] = useState(false);

  const outbox = getOutboxQueue();

  const handleSaveUrl = () => {
    if (!url.trim()) return;
    setGasUrl(url.trim());
    onUrlUpdated();
    onAddToast('URL Backend Headless GAS berhasil disimpan');
  };

  const handleTestPing = async () => {
    setTesting(true);
    setPingResult(null);
    try {
      const res = await pingGasEndpoint();
      setPingResult(res);
      if (res.ok) {
        onAddToast(`Ping berhasil! Latensi: ${res.latencyMs}ms`);
      } else {
        onAddToast(`Ping gagal: ${res.message}`, 'error');
      }
    } catch (e: any) {
      setPingResult({ ok: false, latencyMs: 0, message: e.message });
      onAddToast('Gagal menghubungi GAS', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleFlushOutbox = async () => {
    setFlushing(true);
    try {
      const res = await flushOutboxQueue();
      onAddToast(`Sync antrean selesai: ${res.synced} berhasil, ${res.failed} gagal`);
    } catch (e: any) {
      onAddToast(`Gagal flush antrean: ${e.message}`, 'error');
    } finally {
      setFlushing(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/gas/Code.gs');
      let codeText = '';
      if (res.ok) {
        codeText = await res.text();
      } else {
        codeText = `// Kode backend GAS tersedia di file /gas/Code.gs`;
      }
      await navigator.clipboard.writeText(codeText);
      setCopiedCode(true);
      onAddToast('Kode Code.gs utuh berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedCode(false), 3000);
    } catch (e) {
      onAddToast('Gagal menyalin kode, silakan copy dari /gas/Code.gs', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8] text-white flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Headless GAS Control Center</h3>
              <p className="text-xs text-slate-400">Konfigurasi endpoint REST API, testing latensi & sinkronisasi.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Endpoint URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Web App Exec URL (Google Apps Script)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#E30000]"
              />
              <button
                onClick={handleSaveUrl}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Simpan
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * Pastikan deployment di Apps Script diatur: <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>.
            </p>
          </div>

          {/* Test Ping & Connection Status */}
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Uji Koneksi & Latensi Real-Time
              </div>
              <button
                onClick={handleTestPing}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-sky-500 text-white text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'Mengecek...' : 'Ping Test'}</span>
              </button>
            </div>

            {pingResult && (
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                pingResult.ok 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}>
                <div className="flex items-center gap-2">
                  {pingResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{pingResult.message}</span>
                </div>
                <div className="font-mono font-bold">
                  {pingResult.latencyMs} ms
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div>Database Sheet ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{SPREADSHEET_ID}</span></div>
              <div>Arsitektur: <span className="font-semibold text-emerald-500">Headless REST JSON (doGet & doPost)</span></div>
            </div>
          </div>

          {/* Outbox Offline Sync Queue */}
          <div className="p-4 rounded-xl border bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Antrean Mutasi Offline (Outbox)
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {outbox.length} item menunggu sinkronisasi
              </div>
            </div>
            <button
              onClick={handleFlushOutbox}
              disabled={flushing || outbox.length === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold cursor-pointer"
            >
              {flushing ? 'Mengirim...' : 'Sinkronkan Sekarang'}
            </button>
          </div>

          {/* Copy Full Code.gs Backend Script */}
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E30000] uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>Kode Utuh Code.gs (REST Adapter)</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E30000] hover:bg-[#DC2626] text-white text-xs font-bold transition-all shadow-sm shadow-red-500/20 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode Utuh (1-Klik)'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Sesuai standar kami, Anda dapat menyalin seluruh kode backend Google Apps Script yang 100% utuh langsung dari sini kapan saja untuk ditempel ke editor Apps Script Anda.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-[#070D19]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
