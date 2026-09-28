import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  getDoc,
  deleteField
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  User,
  Client,
  Task,
  ContentItem,
  Meeting,
  FinancialRecord,
  Transaction,
  BriefingData,
  AccessCredential,
  Ticket,
  DocumentFile
} from '../types';

// Generic document saving
export async function setFirestoreDoc<T extends { id: string }>(
  collectionName: string,
  data: T
): Promise<void> {
  const path = `${collectionName}/${data.id}`;
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Generic document reading once
export async function getFirestoreDoc<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as unknown as T;
    }
    return null;
  } catch (error) {
    console.error(`Erro ao buscar documento ${collectionName}/${id}:`, error);
    return null;
  }
}

// Non-destructive migration to remove legacy password fields from Firestore without printing or logging values
export async function sanitizeLegacyUserPasswords(): Promise<number> {
  let sanitizedCount = 0;
  try {
    const snap = await getDocs(collection(db, 'users'));
    for (const d of snap.docs) {
      const data = d.data();
      if ('password' in data || 'passwordOrToken' in data) {
        await updateDoc(doc(db, 'users', d.id), {
          password: deleteField(),
          passwordOrToken: deleteField()
        });
        sanitizedCount++;
      }
    }
  } catch {
    // Non-blocking silent fallback
  }
  return sanitizedCount;
}

// Generic document updating
export async function updateFirestoreDoc(
  collectionName: string,
  id: string,
  data: Record<string, any>
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Generic document deleting
export async function deleteFirestoreDoc(
  collectionName: string,
  id: string
): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Generic real-time collection subscription
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = collectionName;
  try {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as unknown as T);
        });
        onData(items);
      },
      (error) => {
        console.warn(`Firestore permission/read notice for ${path}:`, error.message);
        if (onError) onError(error as Error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn(`Error setting up subscription for ${path}:`, error);
    return () => {};
  }
}

// Real-time subscription filtered by clientId
export function subscribeToClientCollection<T>(
  collectionName: string,
  clientId: string,
  onData: (items: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `${collectionName}?clientId=${clientId}`;
  try {
    const q = query(collection(db, collectionName), where('clientId', '==', clientId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as unknown as T);
        });
        onData(items);
      },
      (error) => {
        console.warn(`Firestore client collection notice for ${path}:`, error.message);
        if (onError) onError(error as Error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn(`Error setting up client subscription for ${path}:`, error);
    return () => {};
  }
}

// Single document subscription
export function subscribeToDocument<T>(
  collectionName: string,
  id: string,
  onData: (item: T | null) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData({ id: snapshot.id, ...snapshot.data() } as unknown as T);
        } else {
          onData(null);
        }
      },
      (error) => {
        console.warn(`Firestore doc subscription notice for ${path}:`, error.message);
        if (onError) onError(error as Error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn(`Error setting up doc subscription for ${path}:`, error);
    return () => {};
  }
}

