import type { Cliente } from '../types/comercial.types';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

const getStorageKey = (tId?: string | null) =>
  `terragest_clientes_cache_${tId || (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) || DEFAULT_LEGACY_TENANT}`;

const getDeletedKey = (tId?: string | null) =>
  `terragest_clientes_deleted_ids_${tId || (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) || DEFAULT_LEGACY_TENANT}`;

export function getCachedClientes(tenantId?: string | null): Cliente[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(tenantId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

export function saveCachedClientes(list: Cliente[], tenantId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(tenantId), JSON.stringify(list));
  } catch {}
}

export function getDeletedClienteIds(tenantId?: string | null): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(getDeletedKey(tenantId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function addDeletedClienteId(id: string, tenantId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDeletedClienteIds(tenantId);
    current.add(id);
    localStorage.setItem(getDeletedKey(tenantId), JSON.stringify(Array.from(current)));
  } catch {}
}
