import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FbUser
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const ALLOWED_MIME_PATTERNS = [
  /^image\/.+$/,
  /^video\/.+$/,
  /^audio\/.+$/,
  /^application\/pdf$/,
  /^application\/vnd\.ms-excel$/,
  /^application\/vnd\.openxmlformats-officedocument\..+$/,
  /^application\/msword$/,
  /^text\/plain$/,
  /^application\/zip$/
];

export function validateStorageFile(file: { size: number; type: string }): { valid: boolean; error?: string } {
  if (file.size >= MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'O arquivo excede o limite máximo permitido de 50 MB.' };
  }
  const isAllowed = ALLOWED_MIME_PATTERNS.some((pattern) => pattern.test(file.type));
  if (!isAllowed) {
    return { valid: false, error: `Tipo de arquivo não permitido (${file.type || 'desconhecido'}). Envie imagens, vídeos, PDFs, docs ou arquivos compactados.` };
  }
  return { valid: true };
}

/**
 * Upload a file directly to Cloud Storage under the isolated client path:
 * /clients/{clientId}/{folder}/{timestamp}_{filename}
 */
export async function uploadClientFileToStorage(
  clientId: string,
  file: File,
  folder: string = 'documents'
): Promise<{ downloadURL: string; storagePath: string }> {
  const validation = validateStorageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `clients/${clientId}/${folder}/${Date.now()}_${cleanFileName}`;
  const fileReference = storageRef(storage, storagePath);

  await uploadBytes(fileReference, file, {
    contentType: file.type || 'application/octet-stream'
  });

  const downloadURL = await getDownloadURL(fileReference);
  return { downloadURL, storagePath };
}

/**
 * Delete a file directly from Cloud Storage by path
 */
export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    const fileReference = storageRef(storage, storagePath);
    await deleteObject(fileReference);
  } catch (err: any) {
    console.warn(`Aviso ao excluir arquivo do Cloud Storage (${storagePath}):`, err?.message || err);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Check connectivity.');
    }
  }
}
testConnection();

export {
  fbSignOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
};
export type { FbUser };
