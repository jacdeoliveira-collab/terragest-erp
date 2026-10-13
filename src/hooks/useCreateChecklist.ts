import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { abrirOsCorretivaDeChecklist } from '../services/checklistManutencaoSync';
import type { CreateChecklistDTO } from '../types/checklist.types';

export function useCreateChecklist() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createChecklist = async (input: CreateChecklistDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para salvar registros.');
      }

      const basePayload = {
        maquina_id: input.maquina_id,
        operador_id: input.operador_id || null,
        data: input.data,
        horimetro_atual: input.horimetro_atual ? Number(input.horimetro_atual) : null,
        nivel_oleo: input.nivel_oleo !== undefined ? input.nivel_oleo : (input.nivel_oleo_ok ?? true),
        nivel_oleo_ok: input.nivel_oleo_ok ?? true,
        vazamentos: input.vazamentos !== undefined ? input.vazamentos : (!input.vazamentos_ok),
        vazamentos_ok: input.vazamentos_ok ?? true,
        status_geral: input.status_geral || (input.status_geral_aprovado ? 'APROVADO' : 'REPROVADO'),
        status_geral_aprovado: input.status_geral_aprovado ?? true,
        observacoes: input.observacoes?.trim() || null,
        assinado_por_pin: input.assinado_por_pin ?? true
      };

      // 1. Inserção sem tenant_id para que o trigger do Postgres injete o tenant correto da sessão
      let { data, error: insertError } = await supabase
        .from('checklists_diarios')
        .insert([basePayload])
        .select()
        .single();

      // 2. Se houver restrição de RLS, tentar com tenant_id do usuário
      if (insertError && (insertError.message.includes('row-level security') || insertError.code === '42501')) {
        const userTenant = user.user_metadata?.tenant_id || user.id;
        const resUser = await supabase
          .from('checklists_diarios')
          .insert([{ ...basePayload, tenant_id: userTenant }])
          .select()
          .single();
        if (!resUser.error) {
          data = resUser.data;
          insertError = null;
        }
      }

      // 3. Fallback adicional com tenant ativo
      if (insertError && (insertError.message.includes('row-level security') || insertError.code === '42501')) {
        const activeTenant = typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null;
        if (activeTenant) {
          const resTenant = await supabase
            .from('checklists_diarios')
            .insert([{ ...basePayload, tenant_id: activeTenant }])
            .select()
            .single();
          if (!resTenant.error) {
            data = resTenant.data;
            insertError = null;
          }
        }
      }

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Atualiza horímetro do equipamento se apontado
      if (input.horimetro_atual && Number(input.horimetro_atual) > 0) {
        await supabase
          .from('equipment')
          .update({ current_hourmeter: Number(input.horimetro_atual) })
          .eq('id', input.maquina_id);
      }

      // Se reprovada na inspeção: máquina vai para manutenção e abre OS corretiva pendente
      if (!input.status_geral_aprovado) {
        await supabase
          .from('equipment')
          .update({ status: 'MAINTENANCE' })
          .eq('id', input.maquina_id);
        await abrirOsCorretivaDeChecklist(
          { ...data, maquina_id: input.maquina_id, data: input.data, horimetro_atual: input.horimetro_atual },
          user.user_metadata?.tenant_id as string | undefined
        );
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao registrar checklist';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createChecklist,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
