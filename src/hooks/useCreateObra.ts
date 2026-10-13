import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { CreateObraDTO } from '../types/obras.types';
export function useCreateObra() {
  const { tenantAtivoId } = useTenantContext();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createObra = async (input: CreateObraDTO, obraId?: string) => {
    if (isSubmitting) return { data: null, error: null };
    try {
      setIsSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      const clientName = input.cliente_nome?.trim() || input.cliente?.trim() || null;
      const address = input.endereco_completo?.trim() || input.localizacao?.trim() || null;
      const tenantId = tenantAtivoId || user?.user_metadata?.tenant_id || user?.id || '00000000-0000-0000-0000-000000000001';

      const targetId = obraId || '00000000-0000-0000-0000-000000000002';

      const payload = {
        nome: input.nome.trim(),
        cliente: clientName,
        cliente_nome: clientName,
        cliente_cnpj: input.cliente_cnpj?.trim() || null,
        cno: input.cno?.trim() || null,
        art_crea: input.art_crea?.trim() || null,
        localizacao: address,
        endereco_completo: address,
        data_inicio: input.data_inicio || new Date().toISOString().slice(0, 10),
        previsao_termino: input.previsao_termino || null,
        status: input.status || 'EM_ANDAMENTO',
        tenant_id: tenantId
      };

      const storageKey = `terragest_obras_cache_${tenantId}`;
      try {
        const raw = localStorage.getItem(storageKey);
        const cachedList: any[] = raw ? JSON.parse(raw) : [];
        const updatedObra = { id: targetId, ...payload, updated_at: new Date().toISOString() };
        const updatedList = [updatedObra, ...cachedList.filter((o) => o.id !== targetId)];
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch {
        // ignore
      }

      // 2. Gravar no Supabase
      try {
        if (obraId) {
          await supabase
            .from('obras')
            .update(payload)
            .eq('id', obraId);
        } else {
          await supabase
            .from('obras')
            .insert([payload]);
        }
      } catch (err: unknown) {
        console.warn('[useCreateObra] Sincronização em nuvem avisou:', err);
      }

      return { success: true, data: { id: targetId, ...payload } };
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
