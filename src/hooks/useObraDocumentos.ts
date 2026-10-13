import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useTenantContext } from '../contexts/TenantContext';
import type { ObraDocumentoItem, CreateObraDocumentoDTO } from '../types/obras.types';

function getLocalDocs(obraId: string): ObraDocumentoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`terragest_obra_docs_${obraId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalDocs(obraId: string, docs: ObraDocumentoItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`terragest_obra_docs_${obraId}`, JSON.stringify(docs));
  } catch {}
}

export function useObraDocumentos(obraId?: string) {
  const { tenantAtivoId } = useTenantContext();
  const [documentos, setDocumentos] = useState<ObraDocumentoItem[]>(() => (obraId ? getLocalDocs(obraId) : []));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = useCallback(async () => {
    if (!obraId) {
      setDocumentos([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const cached = getLocalDocs(obraId);
      if (cached.length > 0) setDocumentos(cached);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      let q = supabase
        .from('obra_documentos')
        .select('*')
        .eq('obra_id', obraId)
        .order('data_validade', { ascending: true, nullsFirst: false });

      if (tenantId) q = q.eq('tenant_id', tenantId);

      const { data, error: fetchErr } = await q;
      if (!fetchErr && data) {
        setDocumentos(data);
        saveLocalDocs(obraId, data);
      }
    } catch {
      setDocumentos(getLocalDocs(obraId));
    } finally {
      setIsLoading(false);
    }
  }, [obraId, tenantAtivoId]);

  const adicionarDocumento = async (
    dto: Omit<CreateObraDocumentoDTO, 'obra_id'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!obraId) return { success: false, error: 'Obra não informada' };
    try {
      const { data: userData } = await supabase.auth.getUser();
      const tenantId = tenantAtivoId || (userData.user?.user_metadata?.tenant_id as string | undefined);

      const payload = {
        tenant_id: tenantId || null,
        obra_id: obraId,
        nome: dto.nome.trim(),
        tipo: dto.tipo,
        orgao_emissor: dto.orgao_emissor?.trim() || null,
        data_validade: dto.data_validade || null,
        drive_url: dto.drive_url.trim(),
        observacoes: dto.observacoes?.trim() || null
      };

      const { error: insErr } = await supabase.from('obra_documentos').insert([payload]);
      if (insErr) throw new Error(insErr.message);

      await fetchDocumentos();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao salvar documento' };
    }
  };

  const excluirDocumento = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: delErr } = await supabase.from('obra_documentos').delete().eq('id', id);
      if (delErr) throw new Error(delErr.message);
      await fetchDocumentos();
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao remover documento' };
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  return { documentos, isLoading, error, refetch: fetchDocumentos, adicionarDocumento, excluirDocumento };
}
