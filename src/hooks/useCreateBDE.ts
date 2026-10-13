import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { CreateBDEDTO } from '../types/bde.types';

export function useCreateBDE() {
  const { tenantAtivoId } = useTenantContext();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createBDE = async (input: CreateBDEDTO) => {
    if (isSubmitting) return { data: null, error: null };
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente para salvar registros.');
      }
      const tenantId = tenantAtivoId || (user.user_metadata?.tenant_id as string | undefined);

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

      const productiveHours = input.horas_produtivas !== undefined && !isNaN(Number(input.horas_produtivas))
        ? Number(input.horas_produtivas)
        : Math.max(0, Number(input.final_hourmeter) - Number(input.initial_hourmeter));

      const payload = {
        tenant_id: tenantId || null,
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
        horas_produtivas: productiveHours,
        horas_ociosas: Number(input.horas_ociosas) || 0,
        estaca_inicial: input.estaca_inicial?.trim() || null,
        estaca_final: input.estaca_final?.trim() || null,
        status_aprovacao: input.status_aprovacao || 'PENDENTE',
        fuel_liters: Number(input.fuel_liters) || 0,
        service_description: input.service_description.trim(),
        notes: input.notes?.trim() || null,
        status: input.status || 'SUBMITTED',
        assinado_por_pin: input.assinado_por_pin ?? true
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
