import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { EquipmentDocumentoItem, CreateEquipmentDocumentoDTO } from '../types/equipmentDocumentos.types';

export function useEquipmentDocumentos(equipamentoId?: string) {
  const { tenantAtivoId } = useTenantContext();
  const [documentos, setDocumentos] = useState<EquipmentDocumentoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = useCallback(async () => {
    if (!equipamentoId) {
      setDocumentos([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let q = supabase
        .from('equipamento_documentos')
        .select('*')
        .eq('equipamento_id', equipamentoId)
        .order('data_validade', { ascending: true, nullsFirst: false });

      if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: fetchErr } = await q;
      if (fetchErr) throw new Error(fetchErr.message);

      setDocumentos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar documentos do equipamento';
      setError(msg);
      setDocumentos([]);
    } finally {
      setIsLoading(false);
    }
  }, [equipamentoId, tenantAtivoId]);

  const adicionarDocumento = async (
    dto: Omit<CreateEquipmentDocumentoDTO, 'equipamento_id'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!equipamentoId) return { success: false, error: 'Equipamento não informado' };

    try {
      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      const payload = {
        tenant_id: tenantId || null,
        equipamento_id: equipamentoId,
        nome: dto.nome.trim(),
        tipo: dto.tipo,
        orgao_emissor: dto.orgao_emissor?.trim() || null,
        data_validade: dto.data_validade || null,
        drive_url: dto.drive_url.trim(),
        observacoes: dto.observacoes?.trim() || null
      };

      const { error: insErr } = await supabase.from('equipamento_documentos').insert([payload]);
      if (insErr) throw new Error(insErr.message);

      await fetchDocumentos();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar documento da máquina';
      return { success: false, error: msg };
    }
  };

  const excluirDocumento = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: delErr } = await supabase.from('equipamento_documentos').delete().eq('id', id);
      if (delErr) throw new Error(delErr.message);

      await fetchDocumentos();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao remover documento';
      return { success: false, error: msg };
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  return {
    documentos,
    isLoading,
    error,
    refetch: fetchDocumentos,
    adicionarDocumento,
    excluirDocumento
  };
}
