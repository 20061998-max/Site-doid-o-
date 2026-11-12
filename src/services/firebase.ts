import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, DownloadKey, AppSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_KEYS, DEFAULT_SETTINGS } from '../utils/storage';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.warn('Firestore Warning/Notice: ', JSON.stringify(errInfo));
}

// Test connection
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'app'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using cache/local.');
    }
    return false;
  }
}

// ---------------- PRODUCTS ----------------
export async function getProductsFromFirestore(): Promise<Product[]> {
  try {
    const colRef = collection(db, 'products');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return [];
    }
    const products: Product[] = [];
    snapshot.forEach((d) => {
      products.push(d.data() as Product);
    });
    return products;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'products');
    return [];
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, product, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
    throw err;
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    throw err;
  }
}

// ---------------- DOWNLOAD KEYS ----------------
export async function getKeysFromFirestore(): Promise<DownloadKey[]> {
  try {
    const colRef = collection(db, 'download_keys');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return [];
    }
    const keys: DownloadKey[] = [];
    snapshot.forEach((d) => {
      keys.push(d.data() as DownloadKey);
    });
    return keys;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'download_keys');
    return [];
  }
}

export async function saveKeyToFirestore(key: DownloadKey): Promise<void> {
  try {
    const docRef = doc(db, 'download_keys', key.id);
    await setDoc(docRef, key, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `download_keys/${key.id}`);
    throw err;
  }
}

export async function deleteKeyFromFirestore(keyId: string): Promise<void> {
  try {
    const docRef = doc(db, 'download_keys', keyId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `download_keys/${keyId}`);
    throw err;
  }
}

// ---------------- APP SETTINGS ----------------
export async function getSettingsFromFirestore(): Promise<AppSettings | null> {
  try {
    const docRef = doc(db, 'settings', 'app');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as AppSettings;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'settings/app');
    return null;
  }
}

export async function saveSettingsToFirestore(settings: AppSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'app');
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/app');
    throw err;
  }
}

// Seed initial products to Firestore if empty
export async function syncInitialDataToFirestore(): Promise<{ count: number }> {
  let count = 0;
  for (const prod of INITIAL_PRODUCTS) {
    await saveProductToFirestore(prod);
    count++;
  }
  for (const k of INITIAL_KEYS) {
    await saveKeyToFirestore(k);
  }
  await saveSettingsToFirestore(DEFAULT_SETTINGS);
  return { count };
}
