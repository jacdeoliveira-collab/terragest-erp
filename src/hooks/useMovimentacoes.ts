import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import type { MovimentacaoAlmoxarifadoItem } from '../types/almoxarifado.types';

interface UseMovimentacoesOptions {
  obraId?: string;
  tipoFiltro?: 'TODOS' | 'ENTRADA' | 'SAIDA';
}

export function useMovimentacoes(options?: UseMovimentacoesOptions) {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [data, setData] = useState<MovimentacaoAlmoxarifadoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const targetObraId = options?.obraId || obraSelecionada?.id;

  const fetchMovimentacoes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let qMovs = supabase
        .from('almoxarifado_movimentacoes')
        .select('*')
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (tenantId) qMovs = qMovs.eq('tenant_id', tenantId);
      if (targetObraId) qMovs = qMovs.eq('obra_id', targetObraId);
      if (options?.tipoFiltro && options.tipoFiltro !== 'TODOS') {
        qMovs = qMovs.eq('tipo_movimentacao', options.tipoFiltro);
      }

      const [movsRes, obrasRes] = await Promise.all([
        qMovs,
        supabase.from('obras').select('id, nome')
      ]);

      if (movsRes.error) throw new Error(movsRes.error.message);

      const obrasMap = new Map((obrasRes.data || []).map((o) => [o.id, o.nome]));

      const formatados: MovimentacaoAlmoxarifadoItem[] = (movsRes.data || []).map((item) => ({
        ...item,
        obra_nome: obrasMap.get(item.obra_id) || 'Canteiro Central'
      }));

      setData(formatados);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar movimentações de materiais';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, targetObraId, options?.tipoFiltro]);

  useEffect(() => {
    fetchMovimentacoes();
  }, [fetchMovimentacoes]);

  return { data, isLoading, error, refetch: fetchMovimentacoes };
}
