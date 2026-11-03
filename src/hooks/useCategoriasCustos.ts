import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { CategoriaCusto } from '../types/manutencao.types';

const SEEDS_CATEGORIAS_MANUTENCAO = [
  { nome: 'Peças de Reposição & Desgaste', modulo: 'MANUTENCAO', tipo: 'DESPESA' as const },
  { nome: 'Óleos, Filtros e Lubrificantes', modulo: 'MANUTENCAO', tipo: 'DESPESA' as const },
  { nome: 'Mão de Obra Externa / Terceirizada', modulo: 'MANUTENCAO', tipo: 'DESPESA' as const },
  { nome: 'Pneus e Material Rodante', modulo: 'MANUTENCAO', tipo: 'DESPESA' as const },
  { nome: 'Revisão Preventiva Concessionária', modulo: 'MANUTENCAO', tipo: 'DESPESA' as const }
];

export function isUuidValido(valor?: string | null): boolean {
  if (!valor) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor.trim());
}

export function useCategoriasCustos(modulo: string = 'MANUTENCAO') {
  const { tenantAtivoId } = useTenantContext();
  const [categorias, setCategorias] = useState<CategoriaCusto[]>([]);
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
      if (!err && data && data.length > 0) {
        setCategorias(data as CategoriaCusto[]);
        return;
      }

      const seeds = SEEDS_CATEGORIAS_MANUTENCAO.filter((c) => c.modulo === modulo).map((c) => ({
        tenant_id: tenantAtivoId || null,
        nome: c.nome,
        modulo: c.modulo,
        tipo: c.tipo
      }));

      if (seeds.length > 0) {
        const { data: inserted, error: insErr } = await supabase
          .from('categorias_custos')
          .insert(seeds)
          .select('*');

        if (!insErr && inserted && inserted.length > 0) {
          setCategorias(inserted as CategoriaCusto[]);
          return;
        }
      }

      setCategorias(
        SEEDS_CATEGORIAS_MANUTENCAO.map((c, idx) => ({
          id: `00000000-0000-4000-8000-00000000000${idx + 1}`,
          nome: c.nome,
          modulo: c.modulo,
          tipo: c.tipo
        }))
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [modulo, tenantAtivoId]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return { categorias, loading, error, refetch: fetchCategorias };
}
