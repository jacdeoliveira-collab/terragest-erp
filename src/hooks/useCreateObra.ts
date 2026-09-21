import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CreateObraDTO } from '../types/obras.types';

export function useCreateObra() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createObra = async (input: CreateObraDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para salvar registros.');
      }

      const payload = {
        nome: input.nome.trim(),
        cliente: input.cliente?.trim() || null,
        localizacao: input.localizacao?.trim() || null,
        status: input.status || 'ATIVA',
        tenant_id: user.id
      };

      const { data, error: insertError } = await supabase
        .from('obras')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar centro de custo / obra';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createObra,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
