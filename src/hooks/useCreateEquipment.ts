import { useState } from 'react';
import { supabase } from '../lib/supabase';

export interface NovoEquipamentoInput {
  code: string;
  name: string;
  category: 'HEAVY_MACHINERY' | 'AGRICULTURAL_DRONE';
  type: string;
  model: string;
  serial_number: string;
  chassi?: string;
  renavam?: string;
  ano_fabricacao?: number;
  drive_url_foto?: string;
  current_hourmeter?: number;
}

export function useCreateEquipment() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createEquipment = async (input: NovoEquipamentoInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      const payload = {
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        category: input.category,
        type: input.type,
        model: input.model.trim(),
        serial_number: input.serial_number.trim(),
        chassi: input.chassi?.trim() || null,
        renavam: input.renavam?.trim() || null,
        ano_fabricacao: input.ano_fabricacao ? Number(input.ano_fabricacao) : null,
        drive_url_foto: input.drive_url_foto?.trim() || null,
        current_hourmeter: Number(input.current_hourmeter) || 0,
        status: 'AVAILABLE',
        tenant_id: tenantId || null
      };

      const { data, error: insertError } = await supabase
        .from('equipment')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar equipamento';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createEquipment,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
