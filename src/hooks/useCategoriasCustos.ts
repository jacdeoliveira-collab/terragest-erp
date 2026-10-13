import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { CategoriaCusto } from '../types/manutencao.types';

const CATEGORIAS_PADRAO_MANUTENCAO: CategoriaCusto[] = [
  { id: 'cat-manut-pecas', nome: 'Peças de Reposição & Desgaste', modulo: 'MANUTENCAO', tipo: 'DESPESA' },
  { id: 'cat-manut-lubrificantes', nome: 'Óleos, Filtros e Lubrificantes', modulo: 'MANUTENCAO', tipo: 'DESPESA' },
  { id: 'cat-manut-mao-obra', nome: 'Mão de Obra Externa / Terceirizada', modulo: 'MANUTENCAO', tipo: 'DESPESA' },
  { id: 'cat-manut-rodante', nome: 'Pneus e Material Rodante', modulo: 'MANUTENCAO', tipo: 'DESPESA' },
  { id: 'cat-manut-revisao', nome: 'Revisão Preventiva Concessionária', modulo: 'MANUTENCAO', tipo: 'DESPESA' }
];

export function useCategoriasCustos(modulo: string = 'MANUTENCAO') {
  const { tenantAtivoId } = useTenantContext();
  const [categorias, setCategorias] = useState<CategoriaCusto[]>(CATEGORIAS_PADRAO_MANUTENCAO);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('categorias_custos').select('*').eq('modulo', modulo);
      if (tenantAtivoId) {
        query = query.or(`tenant_id.eq.${tenantAtivoId},tenant_id.is.null`);
      }

      const { data, error: err } = await query;
      if (err) {
        // Fallback gracioso para categorias padrão caso a tabela ainda não exista no schema local
        setCategorias(CATEGORIAS_PADRAO_MANUTENCAO.filter((c) => c.modulo === modulo));
        return;
      }

      if (data && data.length > 0) {
        setCategorias(data as CategoriaCusto[]);
      } else {
        setCategorias(CATEGORIAS_PADRAO_MANUTENCAO.filter((c) => c.modulo === modulo));
      }
    } catch {
      setCategorias(CATEGORIAS_PADRAO_MANUTENCAO.filter((c) => c.modulo === modulo));
    } finally {
      setLoading(false);
    }
  }, [modulo, tenantAtivoId]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return { categorias, loading, error, refetch: fetchCategorias };
}
