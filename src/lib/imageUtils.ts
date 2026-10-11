/**
 * Utility untuk konversi URL foto Google Drive & optimasi gambar CDN
 */

export function isGoogleDriveFolder(url: string): boolean {
  if (!url) return false;
  return url.includes('/folders/') || url.includes('drive.google.com/drive/u/') && url.includes('/folders/');
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
