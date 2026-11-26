import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { isMasterEmail, isUserSuperAdmin } from '../services/adminService';
import { lerTenantsOffline, salvarTenantsOffline } from '../services/offlineAuthService';
import type { TenantUserItem } from '../types/tenant.types';

const TENANT_COLS = 'id, nome, razao_social, plano, plano_valor, valor_mensalidade, assinatura_inicio, assinatura_fim, asaas_subscription_id, status_conta, logo_url';

function mapTenantRow(t: any, role: string, perfil: TenantUserItem['perfil_acesso']): TenantUserItem {
  return {
    id: t.id,
    nome: t.nome || t.razao_social || 'Empresa',
    razao_social: t.razao_social || t.nome || 'Empresa',
    plano: t.plano,
    plano_valor: Number(t.plano_valor ?? t.valor_mensalidade ?? 0),
    valor_mensalidade: Number(t.valor_mensalidade ?? t.plano_valor ?? 0),
    assinatura_inicio: t.assinatura_inicio || null,
    assinatura_fim: t.assinatura_fim || null,
    asaas_subscription_id: t.asaas_subscription_id || null,
    status_conta: t.status_conta,
    role,
    perfil_acesso: perfil,
    logo_url: t.logo_url
  };
}

export function useTenantUsers() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<TenantUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMaster, setIsMaster] = useState<boolean>(false);

  const fetchUserTenants = useCallback(async () => {
    if (!user) {
      setTenants([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const cached = lerTenantsOffline(user.id);
        if (cached) { setTenants(cached.tenants); setIsMaster(cached.isMaster); return; }
      }
      const isMasterByEmail = isMasterEmail(user.email);
      const isMasterByDb = await isUserSuperAdmin(user.id);
      const userIsMaster = isMasterByEmail || isMasterByDb;
      setIsMaster(userIsMaster);

      if (userIsMaster) {
        const { data, error: err } = await supabase
          .from('tenants')
          .select(TENANT_COLS)
          .neq('status_conta', 'bloqueado')
          .order('nome', { ascending: true });

        if (err) throw err;
        const mapped = (data || []).map((t) => mapTenantRow(t, 'master', 'ADMIN'));
        setTenants(mapped);
        salvarTenantsOffline(user.id, mapped, true);
        return;
      }

      let rows: TenantUserItem[] = [];
      const { data: utData } = await supabase
        .from('tenant_users')
        .select('tenant_id, role, perfil_acesso')
        .eq('user_id', user.id)
        .neq('perfil_acesso', 'BLOQUEADO');

      if (utData && utData.length > 0) {
        const tIds = utData.map((u) => u.tenant_id);
        const { data: tList } = await supabase
          .from('tenants')
          .select(TENANT_COLS)
          .in('id', tIds)
          .neq('status_conta', 'bloqueado');

        if (tList) {
          rows = tList.map((t) => {
            const ut = utData.find((u) => u.tenant_id === t.id);
            return mapTenantRow(t, ut?.role || 'membro', (ut?.perfil_acesso as any) || 'OPERADOR');
          });
        }
      }

      if (rows.length === 0 && user.email) {
        const emailClean = user.email.trim();
        const { data: byEmail } = await supabase
          .from('tenants')
          .select(TENANT_COLS)
          .or(`admin_email.ilike.${emailClean},contato_email.ilike.${emailClean}`);

        const byEmailAtivos = (byEmail || []).filter((t) => t.status_conta !== 'bloqueado');
        if (byEmailAtivos.length > 0) {
          rows = byEmailAtivos.map((t) => mapTenantRow(t, 'admin', 'ADMIN'));
        }
      }

      if (user.user_metadata?.tenant_id) {
        const designated = rows.filter((r) => r.id === user.user_metadata.tenant_id);
        if (designated.length > 0) {
          rows = designated;
        } else if (rows.length === 0) {
          const { data: byMeta } = await supabase
            .from('tenants')
            .select(TENANT_COLS)
            .eq('id', user.user_metadata.tenant_id)
            .neq('status_conta', 'bloqueado');
          if (byMeta && byMeta.length > 0) {
            rows = byMeta.map((t) => mapTenantRow(t, (user.user_metadata?.role as string) || 'membro', (user.user_metadata?.perfil_acesso as any) || 'OPERADOR'));
          }
        }
      }

      setTenants(rows);
      if (rows.length > 0) salvarTenantsOffline(user.id, rows, false);
    } catch (err: unknown) {
      const cached = lerTenantsOffline(user.id);
      if (cached) {
        setTenants(cached.tenants);
        setIsMaster(cached.isMaster);
      } else {
        setError(err instanceof Error ? err.message : 'Falha ao buscar empresas');
        setTenants([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserTenants();
  }, [fetchUserTenants]);

  return { tenants, loading, error, isMaster, recarregarTenants: fetchUserTenants };
}
