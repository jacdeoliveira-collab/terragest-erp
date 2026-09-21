import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CreatePlanoManutencaoDTO } from '../types/manutencao.types';

export function useCreateManutencao() {
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

      const payload = {
        equipment_id: input.maquina_id,
        maquina_id: input.maquina_id,
        servico: input.tipo_servico_nome.trim(),
        tipo_servico_nome: input.tipo_servico_nome.trim(),
        intervalo_horas: Number(input.intervalo_horas),
        ultimo_horimetro: Number(input.ultimo_horimetro_realizado),
        ultimo_horimetro_realizado: Number(input.ultimo_horimetro_realizado),
        data_ultima_execucao: input.data_ultima_execucao || new Date().toISOString().slice(0, 10),
        responsavel_mecanico: input.responsavel_mecanico?.trim() || null,
        status: input.status || 'EM_DIA',
        tenant_id: user.id
      };

      const { data, error: insertError } = await supabase
        .from('planos_manutencao')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao registrar plano de manutenção';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createManutencao,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
