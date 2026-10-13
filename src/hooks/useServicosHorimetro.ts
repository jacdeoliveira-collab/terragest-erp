import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { garantirClienteCadastrado, sincronizarClientesDeServicosPendentes } from '../services/servicoDbSync';
import { deduplicarServicos, sincronizarAdiantamentosServicos } from '../services/servicoDeduplicacaoHelper';
import { persistirServicoSupabase, mesclarServicosLocaisERemotos } from '../services/servicoPersistenciaService';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';
import { gerarUuidV4 } from '../utils/uuid';
import { calcularTotaisListaServicos } from '../utils/servicoCalculos';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

function obterKeyStorage(tId: string | null): string {
  return `terragest_servicos_horimetro_${tId || DEFAULT_LEGACY_TENANT}`;
}

function obterServicosCache(tId: string | null): ServicoHorimetro[] {
  try {
    const r = localStorage.getItem(obterKeyStorage(tId)) || localStorage.getItem('terragest_servicos_horimetro');
    const parsed = r ? JSON.parse(r) : [];
    if (Array.isArray(parsed)) {
      sincronizarAdiantamentosServicos(parsed);
      return deduplicarServicos(parsed).lista;
    }
  } catch {}
  return [];
}

export function useServicosHorimetro() {
  const { tenantAtivoId } = useTenantContext();
  const [servicos, setServicos] = useState<ServicoHorimetro[]>(() => obterServicosCache(tenantAtivoId));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarServicos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      const tId = tenantAtivoId || (userData?.user?.user_metadata?.tenant_id as string | undefined) || DEFAULT_LEGACY_TENANT;

      const q = aplicarFiltroTenant(supabase.from('servicos_horimetro').select('*'), tId);
      const { data, error: err } = await q.order('created_at', { ascending: false });

      if (!err && Array.isArray(data)) {
        const locais = obterServicosCache(tId);
        const mesclados = mesclarServicosLocaisERemotos(data, locais);
        const { lista } = deduplicarServicos(mesclados);
        sincronizarAdiantamentosServicos(lista);
        setServicos(lista);
        localStorage.setItem(obterKeyStorage(tId), JSON.stringify(lista));

        const idsRemotos = new Set(data.map((r) => r.id));
        locais.filter((l) => !idsRemotos.has(l.id)).forEach((p) => persistirServicoSupabase({ ...p, tenant_id: p.tenant_id || tId }).catch(() => {}));
        if (lista.length > 0) sincronizarClientesDeServicosPendentes(lista, tId).catch(() => {});
      }
    } catch (err: unknown) {
      console.warn('Aviso ao carregar serviços por horímetro:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantAtivoId]);

  const salvarServico = async (servico: Partial<ServicoHorimetro>) => {
    try {
      const now = new Date().toISOString();
      const currentList = [...servicos];
      const tId = tenantAtivoId || '00000000-0000-0000-0000-000000000001';

      if (servico.cliente_nome) {
        const cliId = await garantirClienteCadastrado(servico.cliente_nome, servico.cliente_documento, servico.cliente_telefone, tId);
        if (cliId) servico.cliente_id = cliId;
      }

      let updated: ServicoHorimetro;
      if (servico.id) {
        const idx = currentList.findIndex((s) => s.id === servico.id);
        updated = { ...(idx >= 0 ? currentList[idx] : {}), ...servico, tenant_id: tId, updated_at: now } as ServicoHorimetro;
        if (idx >= 0) currentList[idx] = updated;
        else currentList.unshift(updated);
      } else {
        const newId = gerarUuidV4();
        updated = { ...servico, id: newId, tenant_id: tId, created_at: now, updated_at: now } as ServicoHorimetro;
        currentList.unshift(updated);
      }

      const persistRes = await persistirServicoSupabase(updated);
      if (!persistRes.success) {
        return { success: false, error: persistRes.error || 'Erro ao persistir no Supabase' };
      }
      const finalUpdated = persistRes.data || updated;
      const finalIdx = currentList.findIndex((s) => s.id === finalUpdated.id);
      if (finalIdx >= 0) currentList[finalIdx] = finalUpdated;
      const { lista } = deduplicarServicos(currentList);
      setServicos(lista);
      localStorage.setItem(obterKeyStorage(tId), JSON.stringify(lista));
      return { success: true, data: finalUpdated };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao salvar serviço' };
    }
  };

  const excluirServico = async (id: string) => {
    try {
      const tId = tenantAtivoId || DEFAULT_LEGACY_TENANT;
      const filtered = servicos.filter((s) => s.id !== id);
      setServicos(filtered);
      localStorage.setItem(obterKeyStorage(tId), JSON.stringify(filtered));

      await supabase.from('servicos_horimetro').delete().eq('id', id);
      await supabase.from('medicoes').delete().ilike('observacoes', `%[REF:${id}]%`);
      await supabase.from('contas_pagar').delete().ilike('observacoes', `%[REF:${id}]%`);
      await supabase.from('abastecimentos').delete().ilike('numero_requisicao_nf', `%[REF:${id}%`);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao excluir' };
    }
  };

  useEffect(() => {
    setServicos(obterServicosCache(tenantAtivoId));
    carregarServicos();

    const handleFocus = () => carregarServicos();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') carregarServicos();
    });

    const ch = supabase.channel(`rt_servicos_${tenantAtivoId || 'global'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'servicos_horimetro' }, () => {
        carregarServicos();
      })
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(ch);
    };
  }, [tenantAtivoId, carregarServicos]);

  const metricas = calcularTotaisListaServicos(servicos);

  return {
    servicos, isLoading, error, salvarServico, excluirServico, refetch: carregarServicos,
    metricas
  };
}
