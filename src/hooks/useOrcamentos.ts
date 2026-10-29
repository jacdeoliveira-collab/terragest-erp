import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { Orcamento, CreateOrcamentoDTO, StatusOrcamento } from '../types/comercial.types';
import { DEFAULT_LEGACY_TENANT, obterFiltroTenantString } from '../utils/tenantFilter';

const getStorageKey = (tId: string) => `terragest_orcamentos_${tId}`;

function getCached(tId: string): Orcamento[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(tId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useOrcamentos() {
  const { tenantAtivoId } = useTenantContext();
  const activeTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => getCached(activeTenant));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrcamentos(getCached(activeTenant));
  }, [activeTenant]);

  const fetchOrcamentos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const currentTenant = tenantAtivoId || DEFAULT_LEGACY_TENANT;
      const cached = getCached(currentTenant);
      if (cached.length > 0) setOrcamentos(cached);

      let qOrc = supabase.from('orcamentos').select('*').order('created_at', { ascending: false });
      let qCli = supabase.from('clientes').select('id, nome, documento, telefone');
      let qEqp = supabase.from('equipment').select(
        'id, code, name, model, serial_number, chassi, placa, ano_fabricacao, potencia_hp, current_hourmeter, combustivel_padrao, capacidade_tanque, drive_url_foto'
      );
      let qCta = supabase.from('contas_bancarias').select('id, nome_conta, banco, chave_pix');

      const filter = obterFiltroTenantString(currentTenant);
      qOrc = qOrc.or(filter);
      qCli = qCli.or(filter);
      qEqp = qEqp.or(filter);
      qCta = qCta.or(filter);

      const [resOrc, resCli, resEqp, resCta] = await Promise.all([qOrc, qCli, qEqp, qCta]);
      if (resOrc.error) throw new Error(resOrc.error.message);

      const cliMap = new Map((resCli.data || []).map((c) => [c.id, c]));
      const eqpMap = new Map((resEqp.data || []).map((e) => [e.id, e]));
      const ctaMap = new Map((resCta.data || []).map((c) => [c.id, c]));

      const listaCruzada: Orcamento[] = (resOrc.data || []).map((item) => {
        const c = cliMap.get(item.cliente_id);
        const e = eqpMap.get(item.maquina_id);
        const cta = item.conta_bancaria_id ? ctaMap.get(item.conta_bancaria_id) : undefined;
        return {
          ...item,
          cliente_nome: c?.nome || 'Cliente Geral',
          cliente_documento: c?.documento,
          cliente_telefone: c?.telefone,
          maquina_nome: e?.name,
          maquina_codigo: e?.code,
          maquina_modelo: e?.model,
          maquina_serie: e?.serial_number || e?.chassi,
          maquina_placa: e?.placa,
          maquina_ano: e?.ano_fabricacao,
          maquina_potencia: e?.potencia_hp,
          maquina_horimetro_atual: e?.current_hourmeter,
          maquina_combustivel: e?.combustivel_padrao,
          maquina_capacidade_tanque: e?.capacidade_tanque,
          maquina_foto_url: e?.drive_url_foto,
          conta_bancaria_nome: cta?.nome_conta,
          conta_bancaria_pix: cta?.chave_pix,
          conta_bancaria_banco: cta?.banco
        };
      });

      setOrcamentos(listaCruzada);
      if (typeof window !== 'undefined') {
        localStorage.setItem(getStorageKey(currentTenant), JSON.stringify(listaCruzada));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar orçamentos');
      setOrcamentos(getCached(tenantAtivoId || DEFAULT_LEGACY_TENANT));
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId]);

  const criarOrcamento = async (dto: CreateOrcamentoDTO) => {
    try {
      const { data, error: err } = await supabase
        .from('orcamentos')
        .insert([{ ...dto, tenant_id: tenantAtivoId || DEFAULT_LEGACY_TENANT }])
        .select().single();
      if (err) throw new Error(err.message);
      await fetchOrcamentos();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar proposta' };
    }
  };

  const atualizarOrcamento = async (id: string, dto: Partial<CreateOrcamentoDTO>) => {
    try {
      const { data, error: err } = await supabase
        .from('orcamentos')
        .update({ ...dto, updated_at: new Date().toISOString() })
        .eq('id', id).select().single();
      if (err) throw new Error(err.message);
      await fetchOrcamentos();
      return { success: true, data };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar proposta' };
    }
  };

  const excluirOrcamento = async (id: string) => {
    try {
      const { error: err } = await supabase.from('orcamentos').delete().eq('id', id);
      if (err) throw new Error(err.message);
      setOrcamentos((prev) => prev.filter((o) => o.id !== id));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao excluir proposta' };
    }
  };

  const atualizarStatus = async (id: string, status: StatusOrcamento) => {
    try {
      const { error: err } = await supabase.from('orcamentos').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (err) throw new Error(err.message);
      await fetchOrcamentos();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar status' };
    }
  };

  useEffect(() => { fetchOrcamentos(); }, [fetchOrcamentos]);

  return {
    orcamentos,
    isLoading,
    error,
    refetch: fetchOrcamentos,
    criarOrcamento,
    atualizarOrcamento,
    excluirOrcamento,
    atualizarStatus,
    atualizarStatusOrcamento: atualizarStatus
  };
}
