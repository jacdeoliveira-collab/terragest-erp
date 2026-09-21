import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Obra } from '../types/obras.types';

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraSelecionadaId, setObraSelecionadaId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const carregarObras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const tenantId = userData.user?.user_metadata?.tenant_id as string | undefined;

      let query = supabase
        .from('obras')
        .select('*')
        .order('nome', { ascending: true });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data || data.length === 0) {
        setObras([]);
        setObraSelecionadaId('');
        return;
      }

      const lista = data as Obra[];
      setObras(lista);

      setObraSelecionadaId((prev) => {
        if (prev && lista.some((o) => o.id === prev)) return prev;
        return lista[0]?.id || '';
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao buscar obras';
      setError(msg);
      setObras([]);
      setObraSelecionadaId('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarObras();
  }, [carregarObras]);

  const selecionarObra = (id: string) => {
    setObraSelecionadaId(id);
  };

  const obraAtual = obras.find((o) => o.id === obraSelecionadaId) || null;

  return {
    obras,
    obraSelecionadaId,
    obraAtual,
    loading,
    error,
    selecionarObra,
    recarregarObras: carregarObras
  };
}
