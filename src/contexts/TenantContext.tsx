import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTenantUsers } from '../hooks/useTenantUsers';
import type { TenantUserItem } from '../types/tenant.types';

export interface TenantContextType {
  tenantAtivoId: string | null;
  tenantAtivo: TenantUserItem | null;
  tenants: TenantUserItem[];
  setTenantAtivoId: (id: string) => void;
  setTenantAtivo: (id: string) => void;
  loading: boolean;
  isMaster: boolean;
  recarregarTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);
const STORAGE_KEY = 'terragest_tenant_ativo_id';

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenants, loading, isMaster, recarregarTenants } = useTenantUsers();
  const [tenantAtivoId, setTenantAtivoIdState] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  });

  useEffect(() => {
    if (tenants.length > 0) {
      setTenantAtivoIdState((prev) => {
        if (prev && tenants.some((t) => t.id === prev)) {
          return prev;
        }
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved && tenants.some((t) => t.id === saved)) {
          return saved;
        }
        const primeiro = tenants[0].id;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, primeiro);
        }
        return primeiro;
      });
    } else if (!loading) {
      setTenantAtivoIdState(null);
    }
  }, [tenants, loading]);

  const setTenantAtivo = useCallback((id: string) => {
    if (tenants.length > 0 && !tenants.some((t) => t.id === id)) {
      console.warn(`[TenantContext] Acesso bloqueado à empresa não cadastrada para o usuário: ${id}`);
      return;
    }
    setTenantAtivoIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, id);
      window.dispatchEvent(new CustomEvent('terragest:tenant_changed', { detail: { tenantId: id } }));
    }
  }, [tenants]);

  const tenantAtivo = tenants.find((t) => t.id === tenantAtivoId) || null;

  return (
    <TenantContext.Provider
      value={{
        tenantAtivoId,
        tenantAtivo,
        tenants,
        setTenantAtivoId: setTenantAtivo,
        setTenantAtivo,
        loading,
        isMaster,
        recarregarTenants
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext deve ser utilizado dentro de um TenantProvider');
  }
  return context;
};
