import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';
import type {
  AgendaOperacionalItem,
  CreateAgendaDTO,
  ParametrosOperacionaisEmpresa
} from '../types/agenda.types';

export function useAgendaOperacional() {
  const { tenantAtivoId } = useTenantContext();
  const activeTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
  const [itens, setItens] = useState<AgendaOperacionalItem[]>([]);
  const [parametros, setParametros] = useState<ParametrosOperacionaisEmpresa>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarAgenda = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [{ data: rows, error: errAgenda }, { data: tenantRow }] = await Promise.all([
        supabase
          .from('agenda_operacional')
          .select('*')
          .eq('tenant_id', activeTenant)
          .order('ordem_fila', { ascending: true })
          .order('created_at', { ascending: true }),
        supabase
          .from('tenants')
          .select('parametros_operacionais')
          .eq('id', activeTenant)
          .maybeSingle()
      ]);

      if (errAgenda) throw errAgenda;
      setItens((rows || []) as AgendaOperacionalItem[]);
      setParametros((tenantRow?.parametros_operacionais as ParametrosOperacionaisEmpresa) || {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar agenda operacional');
    } finally {
      setIsLoading(false);
    }
  }, [activeTenant]);

  useEffect(() => { carregarAgenda(); }, [carregarAgenda]);

  const criarAgendamento = async (dto: CreateAgendaDTO) => {
    const payload = { ...dto, tenant_id: activeTenant };
    const { data, error: err } = await supabase.from('agenda_operacional').insert([payload]).select().single();
    if (err) throw err;
    await carregarAgenda();
    return data as AgendaOperacionalItem;
  };

  const atualizarAgendamento = async (id: string, updates: Partial<AgendaOperacionalItem>) => {
    const { error: err } = await supabase
      .from('agenda_operacional')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) throw err;
    await carregarAgenda();
  };

  const excluirAgendamento = async (id: string) => {
    const { error: err } = await supabase.from('agenda_operacional').delete().eq('id', id);
    if (err) throw err;
    setItens((prev) => prev.filter((x) => x.id !== id));
  };

  const registrarWhatsapp = async (id: string) => {
    await atualizarAgendamento(id, { ultimo_contato_whatsapp: new Date().toISOString() });
  };

  const moverNaFila = async (item: AgendaOperacionalItem, direcao: 'subir' | 'descer', filaMaquina: AgendaOperacionalItem[]) => {
    const idx = filaMaquina.findIndex((x) => x.id === item.id);
    const alvoIdx = direcao === 'subir' ? idx - 1 : idx + 1;
    if (idx < 0 || alvoIdx < 0 || alvoIdx >= filaMaquina.length) return;
    const outro = filaMaquina[alvoIdx];
    await Promise.all([
      supabase.from('agenda_operacional').update({ ordem_fila: outro.ordem_fila }).eq('id', item.id),
      supabase.from('agenda_operacional').update({ ordem_fila: item.ordem_fila }).eq('id', outro.id)
    ]);
    await carregarAgenda();
  };

  return {
    itens, parametros, isLoading, error,
    refetch: carregarAgenda, criarAgendamento, atualizarAgendamento,
    excluirAgendamento, registrarWhatsapp, moverNaFila
  };
}

