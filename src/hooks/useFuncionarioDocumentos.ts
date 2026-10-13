import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { FuncionarioDocumentoItem, CreateFuncionarioDocumentoDTO } from '../types/funcionarioDocumentos.types';

export function useFuncionarioDocumentos(funcionarioId?: string) {
  const { tenantAtivoId } = useTenantContext();
  const [documentos, setDocumentos] = useState<FuncionarioDocumentoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = useCallback(async () => {
    if (!funcionarioId) {
      setDocumentos([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let q = supabase
        .from('funcionario_documentos')
        .select('*')
        .eq('funcionario_id', funcionarioId)
        .order('data_validade', { ascending: true, nullsFirst: false });

      if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: fetchErr } = await q;
      if (fetchErr) throw new Error(fetchErr.message);

      setDocumentos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar documentos do colaborador';
      setError(msg);
      setDocumentos([]);
    } finally {
      setIsLoading(false);
    }
  }, [funcionarioId, tenantAtivoId]);

  const adicionarDocumento = async (
    dto: Omit<CreateFuncionarioDocumentoDTO, 'funcionario_id'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!funcionarioId) return { success: false, error: 'Colaborador não identificado' };

    try {
      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      const payload = {
        tenant_id: tenantId || null,
        funcionario_id: funcionarioId,
        nome: dto.nome.trim(),
        tipo: dto.tipo,
        orgao_emissor: dto.orgao_emissor?.trim() || null,
        data_validade: dto.data_validade || null,
        drive_url: dto.drive_url.trim(),
        observacoes: dto.observacoes?.trim() || null
      };

      const { error: insErr } = await supabase.from('funcionario_documentos').insert([payload]);
      if (insErr) throw new Error(insErr.message);

      await fetchDocumentos();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar documento do colaborador';
      return { success: false, error: msg };
    }
  };

  const excluirDocumento = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: delErr } = await supabase.from('funcionario_documentos').delete().eq('id', id);
      if (delErr) throw new Error(delErr.message);

      await fetchDocumentos();
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao excluir documento';
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
