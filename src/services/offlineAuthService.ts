import type { AuthUser, PerfilAcesso } from '../types/auth.types';
import type { TenantUserItem } from '../types/tenant.types';

const OFFLINE_AUTH_KEY = 'terragest_offline_auth_v1';
const OFFLINE_TENANTS_PREFIX = 'terragest_offline_tenants_v1_';

export interface OfflineAuthSnapshot {
  user: AuthUser;
  perfil: PerfilAcesso;
  tenantId: string | null;
  credentialHash?: string;
  savedAt: string;
}

export interface OfflineTenantsSnapshot {
  tenants: TenantUserItem[];
  isMaster: boolean;
  savedAt: string;
}

export function isErroRedeOffline(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed') ||
    msg.includes('fetch') ||
    msg.includes('offline')
  );
}

export async function gerarHashCredencial(email: string, password: string): Promise<string> {
  const input = `${email.trim().toLowerCase()}::${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return btoa(unescape(encodeURIComponent(input)));
}

export function lerSessaoOffline(): OfflineAuthSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(OFFLINE_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OfflineAuthSnapshot;
    if (!parsed?.user?.id || parsed.perfil === 'BLOQUEADO') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function salvarSessaoOffline(
  user: AuthUser,
  perfil: PerfilAcesso,
  tenantId: string | null,
  credenciais?: { email: string; password: string }
): Promise<void> {
  if (typeof window === 'undefined' || perfil === 'BLOQUEADO') return;
  try {
    const anterior = lerSessaoOffline();
    let credentialHash = anterior?.user?.id === user.id ? anterior.credentialHash : undefined;
    if (credenciais?.email && credenciais?.password) {
      credentialHash = await gerarHashCredencial(credenciais.email, credenciais.password);
    }
    const snapshot: OfflineAuthSnapshot = {
      user,
      perfil,
      tenantId,
      credentialHash,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(OFFLINE_AUTH_KEY, JSON.stringify(snapshot));
  } catch {
    // Silencia falha de quota do storage
  }
}

export async function validarLoginOffline(email: string, password: string): Promise<OfflineAuthSnapshot | null> {
  const snapshot = lerSessaoOffline();
  if (!snapshot?.user?.email || !snapshot.credentialHash) return null;
  if (snapshot.user.email.trim().toLowerCase() !== email.trim().toLowerCase()) return null;
  const hashInformado = await gerarHashCredencial(email, password);
  if (hashInformado !== snapshot.credentialHash) return null;
  return snapshot;
}

export function salvarTenantsOffline(userId: string, tenants: TenantUserItem[], isMaster: boolean): void {
  if (typeof window === 'undefined' || !userId || tenants.length === 0) return;
  try {
    const payload: OfflineTenantsSnapshot = { tenants, isMaster, savedAt: new Date().toISOString() };
    localStorage.setItem(`${OFFLINE_TENANTS_PREFIX}${userId}`, JSON.stringify(payload));
  } catch {
    // Silencia falha de quota do storage
  }
}

export function lerTenantsOffline(userId: string): OfflineTenantsSnapshot | null {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const raw = localStorage.getItem(`${OFFLINE_TENANTS_PREFIX}${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OfflineTenantsSnapshot;
    if (!Array.isArray(parsed?.tenants)) return null;
    return parsed;
  } catch {
    return null;
  }
}
