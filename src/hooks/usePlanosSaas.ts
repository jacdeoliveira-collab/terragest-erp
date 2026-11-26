import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PlanoSaasRecord, CreatePlanoSaasDTO, UpdatePlanoSaasDTO } from '../types/planos.types';

function normalizarPlano(row: any): PlanoSaasRecord {
  return {
    id: row.id,
    codigo: String(row.codigo || '').toUpperCase(),
    nome: row.nome || row.codigo,
    descricao: row.descricao || '',
    valor_mensal: Number(row.valor_mensal || 0),
    limite_usuarios: Number(row.limite_usuarios || 5),
    ativo: row.ativo !== false,
    destaque: Boolean(row.destaque),
    ordem: Number(row.ordem || 0),
    modulos_habilitados: Array.isArray(row.modulos_habilitados) ? row.modulos_habilitados : [],
    termo_titulo: row.termo_titulo || null,
    termo_aceite_texto: row.termo_aceite_texto || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export function usePlanosSaas() {
  const [planos, setPlanos] = useState<PlanoSaasRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarPlanos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('saas_planos')
        .select('*')
        .order('ordem', { ascending: true })
        .order('valor_mensal', { ascending: true });
      if (err) throw err;
      setPlanos((data || []).map(normalizarPlano));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar planos do banco de dados.');
      setPlanos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { carregarPlanos(); }, [carregarPlanos]);

  const criarPlano = async (dto: CreatePlanoSaasDTO) => {
    try {
      const payload = { ...dto, codigo: dto.codigo.trim().toUpperCase().replace(/\s+/g, '_') };
      const { data, error: err } = await supabase.from('saas_planos').insert([payload]).select().single();
      if (err) throw err;
      const criado = normalizarPlano(data);
      setPlanos((prev) => [...prev, criado].sort((a, b) => a.ordem - b.ordem));
      return { success: true, data: criado };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar plano' };
    }
  };

  const atualizarPlano = async (id: string, dto: UpdatePlanoSaasDTO) => {
    try {
      const { data, error: err } = await supabase
        .from('saas_planos')
        .update({ ...dto, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      const atualizado = normalizarPlano(data);
      setPlanos((prev) => prev.map((p) => (p.id === id ? atualizado : p)));
      return { success: true, data: atualizado };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar plano' };
    }
  };

  const alternarModuloPlano = async (plano: PlanoSaasRecord, rota: string) => {
    const existe = plano.modulos_habilitados.includes(rota);
    const novos = existe
      ? plano.modulos_habilitados.filter((r) => r !== rota)
      : [...plano.modulos_habilitados, rota];
    return await atualizarPlano(plano.id, { modulos_habilitados: novos });
  };

  const excluirPlano = async (id: string, codigo: string) => {
    try {
      const { count } = await supabase
        .from('tenants')
        .select('id', { count: 'exact', head: true })
        .eq('plano', codigo.toUpperCase());
      if (count && count > 0) {
        return { success: false, error: `Não é possível excluir: existem ${count} empresa(s) ativa(s) vinculadas ao plano ${codigo}.` };
      }
      const { error: err } = await supabase.from('saas_planos').delete().eq('id', id);
      if (err) throw err;
      setPlanos((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Erro ao excluir plano' };
    }
  };

  return { planos, isLoading, error, refetch: carregarPlanos, criarPlano, atualizarPlano, alternarModuloPlano, excluirPlano };
}
