import type { TenantMaster } from '../types/tenant.types';

const STORAGE_KEY_EMPRESA = 'terragest_empresa_ativa_dados';

export function getEmpresaAtivaCache(): Partial<TenantMaster> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPRESA);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function salvarEmpresaAtivaCache(dados: Partial<TenantMaster>): void {
  if (typeof window === 'undefined') return;
  try {
    const atual = getEmpresaAtivaCache() || {};
    const novo = { ...atual, ...dados };
    localStorage.setItem(STORAGE_KEY_EMPRESA, JSON.stringify(novo));
  } catch {
    // Silencia se o storage estiver bloqueado
  }
}
