import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { BDEItemMedicao, CreateMedicaoDTO, MedicaoItem } from '../types/faturamento.types';

export function useFaturamento() {
  const { tenantAtivoId } = useTenantContext();
  const [bdesElegiveis, setBdesElegiveis] = useState<BDEItemMedicao[]>([]);
  const [carregandoBDEs, setCarregandoBDEs] = useState<boolean>(false);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarBDEsParaMedicao = useCallback(async (obraId: string, competencia: string) => {
    if (!obraId || !competencia) {
      setBdesElegiveis([]);
      return [];
    }

    try {
      setCarregandoBDEs(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let q = supabase
        .from('daily_bulletins')
        .select('id, date, equipment_id, total_hours, horas_produtivas, status_aprovacao, medicao_id')
        .eq('obra_id', obraId)
        .eq('status_aprovacao', 'APROVADO')
        .is('medicao_id', null)
        .like('date', `${competencia}%`)
        .order('date', { ascending: true });

      if (tenantId) q = q.eq('tenant_id', tenantId);

      const [bdeRes, eqRes] = await Promise.all([
        q,
        supabase.from('equipment').select('id, code, name, custo_hora_estimado')
      ]);

      if (bdeRes.error) throw new Error(bdeRes.error.message);

      const equipMap = new Map((eqRes.data || []).map((e) => [e.id, e]));

      const formatados: BDEItemMedicao[] = (bdeRes.data || []).map((bde) => {
        const eq = equipMap.get(bde.equipment_id);
        const horas = Number(bde.horas_produtivas) || Number(bde.total_hours) || 0;
        const vHora = Number(eq?.custo_hora_estimado) > 0 ? Number(eq?.custo_hora_estimado) : 0;
        return {
          id: bde.id,
          date: bde.date,
          equipment_id: bde.equipment_id,
          equipment_code: eq?.code,
          equipment_name: eq?.name || 'Equipamento',
          horas_produtivas: horas,
          valor_hora_equipamento: vHora,
          subtotal_calculado: Number((horas * vHora).toFixed(2))
        };
      });

      setBdesElegiveis(formatados);
      return formatados;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar BDEs aprovados';
      setError(msg);
      setBdesElegiveis([]);
      return [];
    } finally {
      setCarregandoBDEs(false);
    }
  }, [tenantAtivoId]);

  const criarMedicao = async (dto: CreateMedicaoDTO): Promise<{ success: boolean; data?: MedicaoItem; error?: string }> => {
    try {
      setSalvando(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      const numero = dto.numero_medicao || `MED-${dto.competencia.replace('-', '')}-${Date.now().toString().slice(-4)}`;

      const payload = {
        tenant_id: tenantId || null,
        obra_id: dto.obra_id,
        competencia: dto.competencia,
        numero_medicao: numero,
        data_emissao: dto.data_emissao,
        data_vencimento: dto.data_vencimento,
        total_horas_produtivas: Number(dto.total_horas_produtivas) || 0,
        valor_total: Number(dto.valor_total) || 0,
        status_pagamento: dto.status_pagamento || 'AGUARDANDO_PAGAMENTO',
        observacoes: dto.observacoes || null
      };

      const { data: medicao, error: medError } = await supabase
        .from('medicoes')
        .insert([payload])
        .select()
        .single();

      if (medError) throw new Error(medError.message);

      if (dto.bde_ids && dto.bde_ids.length > 0) {
        const { error: updError } = await supabase
          .from('daily_bulletins')
          .update({ medicao_id: medicao.id })
          .in('id', dto.bde_ids);

        if (updError) throw new Error(updError.message);
      }

      setBdesElegiveis([]);
      return { success: true, data: medicao as MedicaoItem };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao gerar medição';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSalvando(false);
    }
  };

  return {
    bdesElegiveis,
    carregandoBDEs,
    salvando,
    error,
    limparErro: () => setError(null),
    buscarBDEsParaMedicao,
    criarMedicao
  };
}
