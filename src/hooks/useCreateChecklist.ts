import { useState } from 'react';
import { supabase } from '../lib/supabase';
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

      const payload = {
        maquina_id: input.maquina_id,
        operador_id: input.operador_id || null,
        data: input.data,
        nivel_oleo_ok: input.nivel_oleo_ok,
        vazamentos_ok: input.vazamentos_ok,
        nivel_arrefecimento_ok: input.nivel_arrefecimento_ok ?? true,
        freios_comandos_ok: input.freios_comandos_ok ?? true,
        pneus_esteiras_ok: input.pneus_esteiras_ok ?? true,
        iluminacao_alarme_ok: input.iluminacao_alarme_ok ?? true,
        status_geral_aprovado: input.status_geral_aprovado,
        observacoes: input.observacoes?.trim() || null,
        tenant_id: user.id
      };

      const { data, error: insertError } = await supabase
        .from('checklists_diarios')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Se reprovada na inspeção, atualiza a máquina para manutenção preventiva imediata
      if (!input.status_geral_aprovado) {
        await supabase
          .from('equipment')
          .update({ status: 'MAINTENANCE' })
          .eq('id', input.maquina_id);
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
