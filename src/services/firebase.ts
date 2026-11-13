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
  onSnapshot,
  query,
  where,
  increment,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, DownloadKey, AppSettings } from '../types';
import { EMPTY_SETTINGS, generateRandomKey } from '../utils/storage';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection to Firestore on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'app'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

// ---------------- REAL-TIME SUBSCRIPTIONS ----------------
export function subscribeToProducts(
  onData: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, 'products');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Product);
      });
      // Sort newest first by createdAt
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (err) => {
      console.error('Firestore products listener error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToKeys(
  onData: (keys: DownloadKey[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, 'download_keys');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: DownloadKey[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as DownloadKey);
      });
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (err) => {
      console.error('Firestore keys listener error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeToSettings(
  onData: (settings: AppSettings) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, 'settings', 'app');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData({ ...EMPTY_SETTINGS, ...(snapshot.data() as AppSettings) });
      } else {
        onData(EMPTY_SETTINGS);
      }
    },
    (err) => {
      console.error('Firestore settings listener error:', err);
      if (onError) onError(err);
    }
  );
}

// ---------------- PRODUCTS ----------------
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, product, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
  }
}

// ---------------- DOWNLOAD KEYS ----------------
export async function createDownloadKeyInFirestore(
  productId: string,
  productName: string,
  customerNote = '',
  maxUses = 3
): Promise<DownloadKey> {
  const newKey: DownloadKey = {
    id: 'key-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    key: generateRandomKey(),
    productId,
    productName,
    customerNote: customerNote || 'Venda WhatsApp',
    status: 'active',
    createdAt: new Date().toISOString(),
    downloadCount: 0,
    maxUses,
  };

  try {
    const docRef = doc(db, 'download_keys', newKey.id);
    await setDoc(docRef, newKey);
    return newKey;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `download_keys/${newKey.id}`);
    throw err;
  }
}

export async function saveKeyToFirestore(key: DownloadKey): Promise<void> {
  try {
    const docRef = doc(db, 'download_keys', key.id);
    await setDoc(docRef, key, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `download_keys/${key.id}`);
  }
}

export async function deleteKeyFromFirestore(keyId: string): Promise<void> {
  try {
    const docRef = doc(db, 'download_keys', keyId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `download_keys/${keyId}`);
  }
}

export async function validateKeyInFirestore(keyToTest: string): Promise<{
  success: boolean;
  message: string;
  product?: Product;
  downloadKey?: DownloadKey;
}> {
  const cleanKey = keyToTest.trim().toUpperCase();
  if (!cleanKey) {
    return { success: false, message: 'Por favor, digite a sua chave de download.' };
  }

  try {
    const q = query(collection(db, 'download_keys'), where('key', '==', cleanKey));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        message:
          'Chave não encontrada ou inválida. Verifique os caracteres ou entre em contato com nosso WhatsApp.',
      };
    }

    const foundKey = snapshot.docs[0].data() as DownloadKey;

    if (foundKey.status === 'revoked') {
      return {
        success: false,
        message: 'Esta chave de download foi revogada pelo administrador.',
      };
    }

    if (foundKey.downloadCount >= foundKey.maxUses) {
      return {
        success: false,
        message: `Esta chave atingiu o limite máximo de ${foundKey.maxUses} downloads. Caso precise de nova autorização, fale conosco no WhatsApp.`,
      };
    }

    const productSnap = await getDoc(doc(db, 'products', foundKey.productId));
    if (!productSnap.exists()) {
      return {
        success: false,
        message: 'Produto associado a esta chave não foi localizado no catálogo.',
      };
    }

    const product = productSnap.data() as Product;
    return {
      success: true,
      message: 'Chave autorizada com sucesso!',
      product,
      downloadKey: foundKey,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'download_keys');
    return {
      success: false,
      message: 'Erro ao validar a chave no banco de dados. Tente novamente.',
    };
  }
}

export async function recordKeyDownloadInFirestore(
  downloadKey: DownloadKey
): Promise<void> {
  try {
    const nextCount = (downloadKey.downloadCount || 0) + 1;
    const keyRef = doc(db, 'download_keys', downloadKey.id);
    await updateDoc(keyRef, {
      downloadCount: nextCount,
      usedAt: new Date().toISOString(),
      status: nextCount >= downloadKey.maxUses ? 'used' : 'active',
    });

    const prodRef = doc(db, 'products', downloadKey.productId);
    await updateDoc(prodRef, {
      downloadsCount: increment(1),
    });
  } catch (err) {
    console.warn('Could not update download counter in Firestore:', err);
  }
}

// ---------------- APP SETTINGS ----------------
export async function saveSettingsToFirestore(settings: AppSettings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'app');
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/app');
  }
}
