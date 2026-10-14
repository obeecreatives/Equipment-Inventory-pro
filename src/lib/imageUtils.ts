/**
 * Utility untuk konversi URL foto Google Drive & optimasi gambar CDN
 */

export function isGoogleDriveFolder(url: string): boolean {
  if (!url) return false;
  return url.includes('/folders/') || (url.includes('drive.google.com/drive/u/') && url.includes('/folders/'));
}

export function extractDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  // Cek jika ini folder, bukan file
  if (isGoogleDriveFolder(url)) {
    return null;
  }

  // Pola 1: /file/d/FILE_ID/...
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Pola 2: id=FILE_ID
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Pola 3: /d/FILE_ID (lh3.googleusercontent.com/d/FILE_ID)
  const matchLh3 = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (matchLh3 && matchLh3[1]) return matchLh3[1];

  // Pola 4: Jika user hanya paste string ID saja (panjang 25-45 char alfanumerik)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

/**
 * Mengonversi link Google Drive apapun menjadi URL CDN gambar langsung berkecepatan tinggi
 * Menggunakan lh3.googleusercontent.com/d/ID=w800 atau thumbnail sz=w800
 */
export function formatDriveImageUrl(url?: string, width = 800): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Jika ini link folder Google Drive, kembalikan apa adanya (akan terdeteksi sebagai folder)
  if (isGoogleDriveFolder(trimmed)) {
    return trimmed;
  }

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    // Trik rahasia CDN Google berkecepatan tinggi (lh3.googleusercontent.com)
    // Parameter =w{width} menginstruksikan server Google untuk mengompresi gambar otomatis
    return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
  }

  return trimmed;
}

/**
 * Fallback URL sekunder jika lh3 diblokir oleh ISP / DNS tertentu
 */
export function getDriveThumbnailFallbackUrl(url?: string, width = 800): string {
  if (!url) return '';
  const fileId = extractDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
  }
  return url;
}

export type AssetPlatformType = 'gdrive' | 'gdrive-folder' | 'canva' | 'figma' | 'capcut' | 'direct-image' | 'external-link';

export interface AssetInfo {
  type: AssetPlatformType;
  label: string;
  badgeColor: string;
  isImageDisplayable: boolean;
  isInteractiveCanvas: boolean;
  originalUrl: string;
  highResImageUrl?: string;
  fileId?: string | null;
}

/**
 * Deteksi cerdas format aset: Google Drive, Canva, Figma, CapCut, atau Gambar Langsung
 */
export function detectAssetType(url?: string): AssetInfo {
  if (!url || typeof url !== 'string') {
    return {
      type: 'direct-image',
      label: 'Tanpa Gambar',
      badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      isImageDisplayable: false,
      isInteractiveCanvas: false,
      originalUrl: ''
    };
  }

  const trimmed = url.trim();

  // Cek Google Drive Folder
  if (isGoogleDriveFolder(trimmed)) {
    return {
      type: 'gdrive-folder',
      label: 'Google Drive Folder',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      isImageDisplayable: false,
      isInteractiveCanvas: false,
      originalUrl: trimmed
    };
  }

  // Cek Canva
  if (trimmed.includes('canva.com/design') || trimmed.includes('canva.com')) {
    return {
      type: 'canva',
      label: 'Canva Design Workspace',
      badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      isImageDisplayable: false,
      isInteractiveCanvas: true,
      originalUrl: trimmed
    };
  }

  // Cek Figma
  if (trimmed.includes('figma.com/file') || trimmed.includes('figma.com/design') || trimmed.includes('figma.com/proto')) {
    return {
      type: 'figma',
      label: 'Figma Project Canvas',
      badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      isImageDisplayable: false,
      isInteractiveCanvas: true,
      originalUrl: trimmed
    };
  }

  // Cek CapCut
  if (trimmed.includes('capcut.com')) {
    return {
      type: 'capcut',
      label: 'CapCut Video Project',
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      isImageDisplayable: false,
      isInteractiveCanvas: true,
      originalUrl: trimmed
    };
  }

  // Cek Google Drive File
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    return {
      type: 'gdrive',
      label: 'Google Drive HD Asset',
      badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      isImageDisplayable: true,
      isInteractiveCanvas: false,
      originalUrl: `https://drive.google.com/file/d/${driveId}/view`,
      highResImageUrl: `https://lh3.googleusercontent.com/d/${driveId}=w2560`,
      fileId: driveId
    };
  }

  // Cek apakah url adalah link file gambar umum
  const isDirectImage = /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i.test(trimmed) || trimmed.startsWith('data:image/');

  if (isDirectImage || trimmed.startsWith('http')) {
    return {
      type: isDirectImage ? 'direct-image' : 'external-link',
      label: isDirectImage ? 'Foto Resolusi Tinggi' : 'Web Image Link',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      isImageDisplayable: true,
      isInteractiveCanvas: false,
      originalUrl: trimmed,
      highResImageUrl: trimmed
    };
  }

  return {
    type: 'direct-image',
    label: 'Gambar Aset',
    badgeColor: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    isImageDisplayable: true,
    isInteractiveCanvas: false,
    originalUrl: trimmed,
    highResImageUrl: trimmed
  };
}

/**
 * Download file gambar langsung ke perangkat pengguna
 */
export async function downloadAssetImage(url: string, filename = 'foto-peralatan.jpg'): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('CORS or network error');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch {
    // Fallback direct link trigger
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return false;
  }
}
