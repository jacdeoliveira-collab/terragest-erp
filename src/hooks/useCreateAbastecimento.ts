import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CreateAbastecimentoDTO } from '../types/abastecimento.types';

export function useCreateAbastecimento() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createAbastecimento = async (input: CreateAbastecimentoDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para salvar registros.');
      }

      const payload = {
        obra_id: input.obra_id,
        maquina_id: input.maquina_id,
        operador_id: input.operador_id || null,
        data: input.data,
        tipo_combustivel: input.tipo_combustivel,
        quantidade_litros: Number(input.quantidade_litros),
        horimetro_momento: Number(input.horimetro_momento),
        valor_total: Number(input.valor_total),
        valor_unitario: input.valor_unitario ? Number(input.valor_unitario) : Number((Number(input.valor_total) / (Number(input.quantidade_litros) || 1)).toFixed(3)),
        posto_fornecedor: input.posto_fornecedor?.trim() || null,
        numero_requisicao_nf: input.numero_requisicao_nf?.trim() || null,
        tenant_id: user.id
      };

      const { data, error: insertError } = await supabase
        .from('abastecimentos')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Atualiza o horímetro da máquina se o horímetro no abastecimento for maior
      if (payload.horimetro_momento > 0) {
        await supabase
          .from('equipment')
          .update({ current_hourmeter: payload.horimetro_momento })
          .eq('id', input.maquina_id)
          .lt('current_hourmeter', payload.horimetro_momento);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao registrar abastecimento';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createAbastecimento,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
