import React, { createContext, useContext, useCallback } from 'react';
import { usePlanosSaas } from '../hooks/usePlanosSaas';
import { ROTAS_SEMPRE_LIBERADAS, type PlanoSaasRecord, type CreatePlanoSaasDTO, type UpdatePlanoSaasDTO } from '../types/planos.types';

interface PlanosContextType {
  planos: PlanoSaasRecord[];
  planosAtivos: PlanoSaasRecord[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  criarPlano: (dto: CreatePlanoSaasDTO) => Promise<{ success: boolean; data?: PlanoSaasRecord; error?: string }>;
  atualizarPlano: (id: string, dto: UpdatePlanoSaasDTO) => Promise<{ success: boolean; data?: PlanoSaasRecord; error?: string }>;
  alternarModuloPlano: (plano: PlanoSaasRecord, rota: string) => Promise<{ success: boolean; data?: PlanoSaasRecord; error?: string }>;
  excluirPlano: (id: string, codigo: string) => Promise<{ success: boolean; error?: string }>;
  temAcessoModulo: (planoCodigo: string | undefined, rota: string, isMaster: boolean) => boolean;
}

const PlanosContext = createContext<PlanosContextType | undefined>(undefined);

const ALIAS_ROTAS: Record<string, string> = {
  '/dashboard': '/',
  '/obras': '/centros-custo',
  '/faturamento': '/financeiro',
  '/receber': '/financeiro',
  '/pagar': '/financeiro',
  '/asaas': '/minha-empresa'
};

export const PlanosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hook = usePlanosSaas();
  const planosAtivos = hook.planos.filter((p) => p.ativo);

  const temAcessoModulo = useCallback((planoCodigo: string | undefined, rota: string, isMaster: boolean): boolean => {
    if (isMaster) return true;
    const pathLimpo = rota.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
    if (ROTAS_SEMPRE_LIBERADAS.some((r) => pathLimpo === r || pathLimpo.startsWith(`${r}/`))) return true;

    const rotaCanonica = ALIAS_ROTAS[pathLimpo] || pathLimpo;
    if (!planoCodigo || hook.planos.length === 0) return true;

    const plano = hook.planos.find((p) => p.codigo.toUpperCase() === planoCodigo.toUpperCase());
    if (!plano) return true;
    if (rotaCanonica === '/') return true;

    return plano.modulos_habilitados.some((m) => rotaCanonica === m || rotaCanonica.startsWith(`${m}/`));
  }, [hook.planos]);

  return (
    <PlanosContext.Provider value={{ ...hook, planosAtivos, temAcessoModulo }}>
      {children}
    </PlanosContext.Provider>
  );
};

export function usePlanosContext(): PlanosContextType {
  const ctx = useContext(PlanosContext);
  if (!ctx) throw new Error('usePlanosContext deve ser usado dentro de PlanosProvider');
  return ctx;
}
