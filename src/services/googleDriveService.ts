// Google OAuth & Drive Service for Client-Side Google Identity Services (GSI)
// Allows connecting user Google Drive, listing files, picking files with Google Picker, uploading, and linking files to clients

const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
].join(' ');

let tokenClient: any = null;
let googleAuthToken: string | null = null;
let tokenExpiresAt: number = 0;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  shared?: boolean;
}

export interface GoogleDriveAuthState {
  isConnected: boolean;
  accessToken: string | null;
  userEmail?: string;
  userName?: string;
}

// Check saved token in sessionStorage
export function getSavedDriveToken(): string | null {
  const token = sessionStorage.getItem('agency_gdrive_token');
  const exp = sessionStorage.getItem('agency_gdrive_token_exp');
  if (token && exp && Date.now() < Number(exp)) {
    googleAuthToken = token;
    tokenExpiresAt = Number(exp);
    return token;
  }
  return null;
}

export function saveDriveToken(token: string, expiresInSeconds: number = 3500) {
  googleAuthToken = token;
  tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  sessionStorage.setItem('agency_gdrive_token', token);
  sessionStorage.setItem('agency_gdrive_token_exp', String(tokenExpiresAt));
}

export function clearDriveToken() {
  googleAuthToken = null;
  tokenExpiresAt = 0;
  sessionStorage.removeItem('agency_gdrive_token');
  sessionStorage.removeItem('agency_gdrive_token_exp');
}

// Load Google Identity Services script
export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as any).google?.accounts?.oauth2) {
      return resolve();
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

// Request Token using GSI client
export async function requestGoogleDriveAccess(clientId?: string): Promise<string> {
  await loadGsiScript();

  return new Promise((resolve, reject) => {
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        throw new Error('Google Identity Services SDK não foi carregado corretamente.');
      }

      // If clientId not passed, check metadata or use default public client if provided
      const effectiveClientId = clientId || (window as any).__GOOGLE_CLIENT_ID__ || '';

      const client = google.accounts.oauth2.initTokenClient({
        client_id: effectiveClientId,
        scope: DRIVE_SCOPES,
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            saveDriveToken(response.access_token, response.expires_in || 3600);
            resolve(response.access_token);
          } else {
            reject(new Error('Nenhum access_token recebido.'));
          }
        },
      });

      tokenClient = client;
      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

// List files from Google Drive using REST API
export async function listGoogleDriveFiles(accessToken: string, query: string = ''): Promise<DriveFileItem[]> {
  try {
    let q = "trashed = false";
    if (query.trim()) {
      q += ` and (name contains '${query.replace(/'/g, "\\'")}' or fullText contains '${query.replace(/'/g, "\\'")}')`;
    }

    const fields = 'files(id, name, mimeType, size, webViewLink, webContentLink, iconLink, thumbnailLink, modifiedTime, shared)';
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=50&orderBy=modifiedTime desc&fields=${encodeURIComponent(fields)}&q=${encodeURIComponent(q)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearDriveToken();
        throw new Error('Sessão do Google Drive expirada. Faça login novamente.');
      }
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro ao consultar Google Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: formatFileSize(f.size),
      webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
      webContentLink: f.webContentLink,
      iconLink: f.iconLink,
      thumbnailLink: f.thumbnailLink,
      modifiedTime: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('pt-BR') : undefined,
      shared: f.shared
    }));
  } catch (err: any) {
    throw err;
  }
}

// Create a new folder on Google Drive for a client
export async function createGoogleDriveFolder(accessToken: string, folderName: string, parentFolderId?: string): Promise<DriveFileItem> {
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Falha ao criar pasta no Google Drive');
  }

  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    webViewLink: data.webViewLink
  };
}

// Upload a file to Google Drive (Multipart upload)
export async function uploadFileToGoogleDrive(
  accessToken: string,
  file: File,
  parentFolderId?: string
): Promise<DriveFileItem> {
  const metadata: any = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream'
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const fileData = await fileDataPromise;

  const metadataContentType = 'application/json; charset=UTF-8';
  const metadataPart = `${delimiter}Content-Type: ${metadataContentType}\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const fileHeader = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  // Combine ArrayBuffers
  const enc = new TextEncoder();
  const part1 = enc.encode(metadataPart + fileHeader);
  const part3 = enc.encode(closeDelimiter);

  const fullPayload = new Uint8Array(part1.byteLength + fileData.byteLength + part3.byteLength);
  fullPayload.set(part1, 0);
  fullPayload.set(new Uint8Array(fileData), part1.byteLength);
  fullPayload.set(part3, part1.byteLength + fileData.byteLength);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: fullPayload
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao enviar arquivo para o Google Drive');
  }

  const uploaded = await res.json();
  return {
    id: uploaded.id,
    name: uploaded.name,
    mimeType: uploaded.mimeType,
    size: formatFileSize(uploaded.size),
    webViewLink: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
    webContentLink: uploaded.webContentLink,
    thumbnailLink: uploaded.thumbnailLink
  };
}

// Helper to format byte sizes
function formatFileSize(bytes?: number | string): string {
  if (!bytes) return '—';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num <= 0) return '—';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  return `${(num / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
