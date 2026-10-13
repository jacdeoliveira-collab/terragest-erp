import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { sincronizarManutencaoFinanceiro } from '../services/manutencaoFinanceiroSync';
import type { CreatePlanoManutencaoDTO, UpdatePlanoManutencaoDTO } from '../types/manutencao.types';

export function useCreateManutencao() {
  const { tenantAtivoId } = useTenantContext();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createManutencao = async (input: CreatePlanoManutencaoDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para salvar registros.');
      }

      const tenantId =
        tenantAtivoId ||
        (user.user_metadata?.tenant_id as string | undefined) ||
        (user.app_metadata?.tenant_id as string | undefined);

      const ultH = Number(input.ultimo_horimetro_realizado) || 0;
      const interv = Number(input.intervalo_horas) || 250;
      const proxH = input.horimetro_proxima_troca || (ultH + interv);
      const servicoDesc = input.descricao_servico?.trim() || input.tipo_servico_nome?.trim() || 'Manutenção Preventiva';

      const payload = {
        tenant_id: tenantId || null,
        equipment_id: input.maquina_id,
        maquina_id: input.maquina_id,
        servico: servicoDesc,
        tipo_servico: input.tipo_servico?.trim() || servicoDesc,
        tipo_servico_nome: servicoDesc,
        descricao_servico: servicoDesc,
        intervalo_horas: interv,
        ultimo_horimetro: ultH,
        ultimo_horimetro_realizado: ultH,
        horimetro_proxima_troca: proxH,
        data_ultima_execucao: input.data_servico || input.data_ultima_execucao || new Date().toISOString().slice(0, 10),
        data_servico: input.data_servico || input.data_ultima_execucao || new Date().toISOString().slice(0, 10),
        responsavel_mecanico: input.responsavel_mecanico?.trim() || null,
        mecanico_id: input.mecanico_id || null,
        status: input.status || 'EM_DIA',
        obra_id: input.obra_id || null,
        categoria_custo_id: input.categoria_custo_id || null,
        tipo_manutencao: input.tipo_manutencao || 'PREVENTIVA',
        valor_pecas: Number(input.valor_pecas) || 0,
        valor_mao_obra: Number(input.valor_mao_obra) || 0
      };

      const { data, error: insertError } = await supabase
        .from('planos_manutencao')
        .insert([payload])
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      await sincronizarManutencaoFinanceiro(data);
      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao registrar manutenção';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateManutencao = async (id: string, input: UpdatePlanoManutencaoDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload: Record<string, unknown> = {};
      if (input.maquina_id) { payload.maquina_id = input.maquina_id; payload.equipment_id = input.maquina_id; }
      if (input.descricao_servico !== undefined) {
        payload.descricao_servico = input.descricao_servico;
        payload.servico = input.descricao_servico;
        payload.tipo_servico_nome = input.descricao_servico;
      }
      if (input.tipo_manutencao !== undefined) payload.tipo_manutencao = input.tipo_manutencao;
      if (input.data_servico !== undefined) {
        payload.data_servico = input.data_servico;
        payload.data_ultima_execucao = input.data_servico;
      }
      if (input.obra_id !== undefined) payload.obra_id = input.obra_id;
      if (input.categoria_custo_id !== undefined) payload.categoria_custo_id = input.categoria_custo_id;
      if (input.valor_pecas !== undefined) payload.valor_pecas = Number(input.valor_pecas) || 0;
      if (input.valor_mao_obra !== undefined) payload.valor_mao_obra = Number(input.valor_mao_obra) || 0;
      if (input.ultimo_horimetro_realizado !== undefined) {
        payload.ultimo_horimetro = Number(input.ultimo_horimetro_realizado) || 0;
        payload.ultimo_horimetro_realizado = Number(input.ultimo_horimetro_realizado) || 0;
      }
      if (input.intervalo_horas !== undefined) payload.intervalo_horas = Number(input.intervalo_horas) || 250;
      if (input.responsavel_mecanico !== undefined) payload.responsavel_mecanico = input.responsavel_mecanico;

      const { data, error: updateError } = await supabase
        .from('planos_manutencao')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);
      await sincronizarManutencaoFinanceiro(data);
      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar manutenção';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createManutencao,
    updateManutencao,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
