import { useState, useEffect, useCallback } from 'react';
import { useTenantContext } from '../contexts/TenantContext';
import { carregarValesColaboradores, excluirValeColaborador } from '../services/valeRhService';
import type { ValeColaboradorItem } from '../types/valeRh.types';

export function useValesRh(colaboradorId?: string, colaboradorNome?: string) {
  const { tenantAtivoId } = useTenantContext();
  const [vales, setVales] = useState<ValeColaboradorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVales = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const todos = await carregarValesColaboradores(tenantAtivoId);
      
      let filtrados = todos;
      if (colaboradorId || colaboradorNome) {
        filtrados = todos.filter((v) => {
          if (colaboradorId && v.colaboradorId === colaboradorId) return true;
          if (colaboradorNome && v.colaboradorNome.toLowerCase().includes(colaboradorNome.toLowerCase())) return true;
          return false;
        });
      }

      setVales(filtrados);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao listar vales');
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, colaboradorId, colaboradorNome]);

  useEffect(() => {
    fetchVales();
  }, [fetchVales]);

  const excluir = async (id: string) => {
    const ok = await excluirValeColaborador(id);
    if (ok) setVales((prev) => prev.filter((v) => v.id !== id));
    return ok;
  };

  return { vales, isLoading, error, refetch: fetchVales, excluir };
}

