import { supabase } from '../lib/supabase';

const DB_NAME = 'TerraGestComprovantesDB';
const STORE_NAME = 'comprovantes';
const memCache = new Map<string, string>();

function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB não suportado'));
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function comprimirImagem(file: File, maxDim = 1200, qualidade = 0.72): Promise<string> {
  if (file.type === 'application/pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(img.src);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', qualidade));
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

export async function salvarComprovante(chave: string, valor: string): Promise<void> {
  memCache.set(chave, valor);
  if (valor && valor.length < 500) {
    try {
      localStorage.setItem(`terragest_cupom_foto_${chave}`, valor);
    } catch {}
  }

  try {
    const db = await abrirDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(valor, chave);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}

export async function obterComprovante(chave: string): Promise<string | null> {
  if (memCache.has(chave)) return memCache.get(chave)!;

  try {
    const local = localStorage.getItem(`terragest_cupom_foto_${chave}`);
    if (local) {
      memCache.set(chave, local);
      return local;
    }
  } catch {}

  try {
    const db = await abrirDB();
    const idbVal = await new Promise<string | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(chave);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
    if (idbVal) {
      memCache.set(chave, idbVal);
      return idbVal;
    }
  } catch {}

  // Fallback: Busca na coluna observacoes do contas_pagar no Supabase
  try {
    const { data } = await supabase
      .from('contas_pagar')
      .select('observacoes')
      .ilike('observacoes', `%[REF:${chave}]%`)
      .limit(1)
      .maybeSingle();

    if (data?.observacoes) {
      const matchFoto = data.observacoes.match(/\[FOTO:(.*?)\]/);
      if (matchFoto && matchFoto[1]) {
        const foto = matchFoto[1];
        memCache.set(chave, foto);
        return foto;
      }
    }
  } catch {}

  return null;
}
