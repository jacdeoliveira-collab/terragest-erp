import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isMasterEmail } from '../services/adminService';
import type { PerfilAcesso } from '../types/auth.types';

export async function fetchUserTenantData(user: User): Promise<{ perfil: PerfilAcesso; tenantId: string | null }> {
  const metaPerfil = user.user_metadata?.perfil_acesso as PerfilAcesso | undefined;
  const metaTenant = (user.user_metadata?.tenant_id as string | undefined) || null;

  if (isMasterEmail(user.email)) {
    return { perfil: 'ADMIN', tenantId: metaTenant };
  }

  try {
    const { data, error } = await supabase
      .from('tenant_users')
      .select('perfil_acesso, tenant_id')
      .eq('user_id', user.id);

    if (!error && data && data.length > 0) {
      const ativos = data.filter((r) => r.perfil_acesso !== 'BLOQUEADO');
      if (ativos.length > 0) {
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null;
        const escolhido = ativos.find((r) => r.tenant_id === savedId) || ativos.find((r) => r.tenant_id === metaTenant) || ativos[0];
        return {
          perfil: (escolhido.perfil_acesso as PerfilAcesso) || metaPerfil || 'ADMIN',
          tenantId: escolhido.tenant_id || metaTenant
        };
      }
      if (user.email) {
        const emailClean = user.email.trim();
        const { data: ownTenants } = await supabase
          .from('tenants')
          .select('id, status_conta')
          .or(`admin_email.ilike.${emailClean},contato_email.ilike.${emailClean}`);
        const ativa = (ownTenants || []).find((t) => t.status_conta !== 'bloqueado');
        if (ativa) {
          return { perfil: 'ADMIN', tenantId: ativa.id };
        }
      }
      if (metaTenant && !data.some((r) => r.tenant_id === metaTenant)) {
        return { perfil: metaPerfil || 'ADMIN', tenantId: metaTenant };
      }
      return { perfil: 'BLOQUEADO', tenantId: null };
    }
  } catch {
    // fallback silencioso para user_metadata
  }
  return {
    perfil: metaPerfil || 'ADMIN',
    tenantId: metaTenant
  };
}
