import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import { useObraContext } from '../contexts/ObraContext';
import type { CreateTicketDTO } from '../types/producao.types';

export function gerarNumeroTicketPadrao(): string {
  const agora = new Date();
  const yyyymmdd = agora.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TCK-${yyyymmdd}-${rand}`;
}

export function useCreateTicket() {
  const { tenantAtivoId } = useTenantContext();
  const { obraSelecionada } = useObraContext();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = async (input: CreateTicketDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const tenantId =
        tenantAtivoId ||
        (user.user_metadata?.tenant_id as string | undefined) ||
        (user.app_metadata?.tenant_id as string | undefined);

      const obraIdFinal = input.obra_id || obraSelecionada?.id;
      if (!obraIdFinal) {
        throw new Error('Selecione uma obra ou centro de custo ativo para emitir o ticket.');
      }

      const volume = Number(input.volume_m3);
      const dmt = Number(input.dmt_km);
      if (!(volume > 0)) throw new Error('Informe o volume (m³) transportado.');
      if (!(dmt > 0)) throw new Error('Informe a DMT (km) do trecho.');

      const numTicketFinal = input.numero_ticket?.trim() || gerarNumeroTicketPadrao();

      const payload = {
        tenant_id: tenantId || null,
        obra_id: obraIdFinal,
        data_hora: input.data_hora || new Date().toISOString(),
        caminhao_id: input.caminhao_id,
        escavadeira_id: input.escavadeira_id,
        operador_caminhao_id: input.operador_caminhao_id || null,
        apontador_id: input.apontador_id || null,
        material_tipo: input.material_tipo || 'SOLO_COMUM',
        volume_m3: volume,
        origem_estaca: input.origem_estaca?.trim() || null,
        destino_estaca: input.destino_estaca?.trim() || null,
        dmt_km: dmt,
        numero_ticket: numTicketFinal,
        observacoes: input.observacoes?.trim() || null
      };

      const { data, error: insertError } = await supabase
        .from('apontamentos_viagens_producao')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao emitir ticket de viagem';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createTicket,
    isSubmitting,
    error,
    limparErro: () => setError(null)
  };
}
