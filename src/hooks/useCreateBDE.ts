import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CreateBDEDTO } from '../types/bde.types';

export function useCreateBDE() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createBDE = async (input: CreateBDEDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para salvar registros.');
      }

      // Cálculo líquido da jornada do operador (hora_fim - hora_inicio)
      let calculatedHours = Number(input.total_hours);
      if (isNaN(calculatedHours) || calculatedHours <= 0) {
        if (input.hora_inicio_jornada && input.hora_fim_jornada) {
          const [h1, m1] = input.hora_inicio_jornada.split(':').map(Number);
          const [h2, m2] = input.hora_fim_jornada.split(':').map(Number);
          if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
            calculatedHours = Math.max(0, Number((((h2 * 60 + m2) - (h1 * 60 + m1)) / 60).toFixed(1)));
          }
        }
      }
      if (isNaN(calculatedHours) || calculatedHours <= 0) {
        calculatedHours = Math.max(0, Number(input.final_hourmeter) - Number(input.initial_hourmeter));
      }

      const payload = {
        obra_id: input.obra_id,
        equipment_id: input.equipment_id,
        operador_id: input.operador_id || null,
        date: input.date,
        hora_inicio_jornada: input.hora_inicio_jornada || null,
        hora_fim_jornada: input.hora_fim_jornada || null,
        motivo_parada: input.motivo_parada || null,
        operator_name: input.operator_name.trim(),
        client_name: input.client_name.trim(),
        work_location: input.work_location.trim(),
        initial_hourmeter: Number(input.initial_hourmeter),
        final_hourmeter: Number(input.final_hourmeter),
        total_hours: calculatedHours,
        fuel_liters: Number(input.fuel_liters) || 0,
        service_description: input.service_description.trim(),
        notes: input.notes?.trim() || null,
        status: input.status || 'SUBMITTED',
        tenant_id: user.id
      };

      const { data, error: insertError } = await supabase
        .from('daily_bulletins')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (input.final_hourmeter > input.initial_hourmeter) {
        await supabase
          .from('equipment')
          .update({ current_hourmeter: input.final_hourmeter })
          .eq('id', input.equipment_id);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar boletim BDE';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createBDE,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
