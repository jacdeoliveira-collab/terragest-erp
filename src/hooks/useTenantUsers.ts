import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { isMasterEmail, isUserSuperAdmin } from '../services/adminService';
import type { TenantUserItem } from '../types/tenant.types';

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
      const isMasterByEmail = isMasterEmail(user.email);
      const isMasterByDb = await isUserSuperAdmin(user.id);
      const userIsMaster = isMasterByEmail || isMasterByDb;
      setIsMaster(userIsMaster);

      if (userIsMaster) {
        const { data, error: err } = await supabase
          .from('tenants')
          .select('id, nome, razao_social, status_conta, logo_url')
          .neq('status_conta', 'bloqueado')
          .order('nome', { ascending: true });

        if (err) throw err;
        setTenants((data || []).map((t) => ({
          id: t.id,
          nome: t.nome || t.razao_social || 'Empresa',
          razao_social: t.razao_social || t.nome || 'Empresa',
          status_conta: t.status_conta,
          role: 'master',
          perfil_acesso: 'ADMIN',
          logo_url: t.logo_url
        })));
        return;
      }

      let rows: TenantUserItem[] = [];
      const { data: utData } = await supabase
        .from('tenant_users')
        .select('tenant_id, role, perfil_acesso')
        .eq('user_id', user.id);

      if (utData && utData.length > 0) {
        const tIds = utData.map((u) => u.tenant_id);
        const { data: tList } = await supabase
          .from('tenants')
          .select('id, nome, razao_social, status_conta, logo_url')
          .in('id', tIds)
          .neq('status_conta', 'bloqueado');

        if (tList) {
          rows = tList.map((t) => {
            const ut = utData.find((u) => u.tenant_id === t.id);
            return {
              id: t.id,
              nome: t.nome || t.razao_social || 'Empresa',
              razao_social: t.razao_social || t.nome || 'Empresa',
              status_conta: t.status_conta as any,
              role: ut?.role || 'membro',
              perfil_acesso: (ut?.perfil_acesso as any) || 'OPERADOR',
              logo_url: t.logo_url
            };
          });
        }
      }

      if (rows.length === 0 && user.email) {
        const { data: byEmail } = await supabase
          .from('tenants')
          .select('id, nome, razao_social, status_conta, logo_url')
          .or(`admin_email.eq.${user.email},contato_email.eq.${user.email}`)
          .neq('status_conta', 'bloqueado');

        if (byEmail && byEmail.length > 0) {
          rows = byEmail.map((t) => ({
            id: t.id,
            nome: t.nome || t.razao_social || 'Empresa',
            razao_social: t.razao_social || t.nome || 'Empresa',
            status_conta: t.status_conta,
            role: 'admin',
            perfil_acesso: 'ADMIN',
            logo_url: t.logo_url
          }));
        }
      }

      if (user.user_metadata?.tenant_id) {
        const designated = rows.filter((r) => r.id === user.user_metadata.tenant_id);
        if (designated.length > 0) {
          rows = designated;
        } else if (rows.length === 0) {
          const { data: byMeta } = await supabase
            .from('tenants')
            .select('id, nome, razao_social, status_conta, logo_url')
            .eq('id', user.user_metadata.tenant_id)
            .neq('status_conta', 'bloqueado');
          if (byMeta && byMeta.length > 0) {
            rows = byMeta.map((t) => ({
              id: t.id,
              nome: t.nome || t.razao_social || 'Empresa',
              razao_social: t.razao_social || t.nome || 'Empresa',
              status_conta: t.status_conta as any,
              role: (user.user_metadata?.role as string) || 'membro',
              perfil_acesso: (user.user_metadata?.perfil_acesso as any) || 'OPERADOR',
              logo_url: t.logo_url
            }));
          }
        }
      }

      setTenants(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar empresas');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserTenants();
  }, [fetchUserTenants]);

  return { tenants, loading, error, isMaster, recarregarTenants: fetchUserTenants };
}
