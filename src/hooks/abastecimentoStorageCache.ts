import type { AbastecimentoItem } from '../types/abastecimento.types';

export const getStorageKey = (tId: string) => `terragest_abastecimentos_cache_${tId}`;

export function getCached(tId: string): AbastecimentoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(tId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
