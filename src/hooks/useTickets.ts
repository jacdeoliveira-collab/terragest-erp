import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import type { ApontamentoViagemItem } from '../types/producao.types';

interface UseTicketsOptions {
  obraId?: string;
  dataFiltro?: string;
  dataInicio?: string;
  dataFim?: string;
}

export function useTickets(options?: UseTicketsOptions) {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [data, setData] = useState<ApontamentoViagemItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const targetObraId = options?.obraId || obraSelecionada?.id;

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let qTickets = supabase
        .from('apontamentos_viagens_producao')
        .select('*')
        .order('data_hora', { ascending: false });

      if (tenantId) qTickets = qTickets.eq('tenant_id', tenantId);
      if (targetObraId) qTickets = qTickets.eq('obra_id', targetObraId);
      if (options?.dataFiltro) {
        qTickets = qTickets.gte('data_hora', `${options.dataFiltro}T00:00:00`).lte('data_hora', `${options.dataFiltro}T23:59:59`);
      } else {
        if (options?.dataInicio) qTickets = qTickets.gte('data_hora', `${options.dataInicio}T00:00:00`);
        if (options?.dataFim) qTickets = qTickets.lte('data_hora', `${options.dataFim}T23:59:59`);
      }

      const [ticketsRes, equipsRes, funcsRes, obrasRes] = await Promise.all([
        qTickets,
        supabase.from('equipment').select('id, code, name, placa'),
        supabase.from('rh_funcionarios').select('id, nome'),
        supabase.from('obras').select('id, nome')
      ]);

      if (ticketsRes.error) throw new Error(ticketsRes.error.message);

      const equipsMap = new Map((equipsRes.data || []).map((e) => [e.id, e]));
      const funcsMap = new Map((funcsRes.data || []).map((f) => [f.id, f.nome]));
      const obrasMap = new Map((obrasRes.data || []).map((o) => [o.id, o.nome]));

      const lista: ApontamentoViagemItem[] = (ticketsRes.data || []).map((item) => {
        const caminhao = equipsMap.get(item.caminhao_id);
        const escavadeira = equipsMap.get(item.escavadeira_id);

        return {
          ...item,
          obra_nome: obrasMap.get(item.obra_id) || 'Canteiro Principal',
          caminhao_codigo: caminhao?.code || '-',
          caminhao_nome: caminhao?.name || '-',
          caminhao_placa: caminhao?.placa,
          escavadeira_codigo: escavadeira?.code || '-',
          escavadeira_nome: escavadeira?.name || '-',
          operador_caminhao_nome: item.operador_caminhao_id ? funcsMap.get(item.operador_caminhao_id) : undefined,
          apontador_nome: item.apontador_id ? funcsMap.get(item.apontador_id) : undefined
        };
      });

      setData(lista);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar tickets de viagem';
      setError(msg);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId, targetObraId, options?.dataFiltro, options?.dataInicio, options?.dataFim]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { data, isLoading, error, refetch: fetchTickets };
}
