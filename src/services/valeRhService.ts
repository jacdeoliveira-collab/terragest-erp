import { supabase } from '../lib/supabase';
import type { ValeColaboradorItem, LancarValePayload } from '../types/valeRh.types';

export async function lancarValeColaborador(payload: LancarValePayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const obsIdentificada = `[VALE_RH]${payload.colaboradorId ? ` [COLAB_ID:${payload.colaboradorId}]` : ''} ${payload.observacao?.trim() || 'Adiantamento de salário / Vale'}`;

    const tId = payload.tenantId || (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) || '00000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase.from('contas_pagar').insert([{
      tenant_id: tId,
      obra_id: payload.obraId || null,
      descricao: `Vale / Adiantamento: ${payload.colaboradorNome}`,
      fornecedor: payload.colaboradorNome,
      categoria: 'FOLHA_RH',
      valor: Number(payload.valor),
      data_vencimento: payload.data,
      data_pagamento: payload.data,
      forma_pagamento: payload.formaPagamento,
      status: 'PAGO',
      conta_bancaria_id: payload.contaBancariaId || null,
      observacoes: obsIdentificada
    }]).select('id').single();

    if (error) throw new Error(error.message);
    return { success: true, id: data.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao gravar vale no banco' };
  }
}

export async function carregarValesColaboradores(tenantId?: string | null): Promise<ValeColaboradorItem[]> {
  try {
    let q = supabase
      .from('contas_pagar')
      .select('*, contas_bancarias(nome_conta)')
      .eq('categoria', 'FOLHA_RH')
      .order('data_pagamento', { ascending: false });

    if (tenantId) q = q.eq('tenant_id', tenantId);

    const { data, error } = await q;
    if (error || !data) return [];

    const valesFiltrados = data.filter((cp: any) => {
      const obs = cp.observacoes || '';
      const desc = cp.descricao || '';
      return obs.includes('[VALE_RH]') || desc.toLowerCase().includes('vale');
    });

    return valesFiltrados.map((cp: any) => {
      let colabId: string | undefined;
      const matchColab = cp.observacoes?.match(/\[COLAB_ID:([^\]]+)\]/);
      if (matchColab) colabId = matchColab[1];

      const limpaObs = cp.observacoes
        ?.replace(/\[VALE_RH\]/g, '')
        ?.replace(/\[COLAB_ID:[^\]]+\]/g, '')
        ?.trim() || cp.descricao;

      return {
        id: cp.id,
        tenant_id: cp.tenant_id,
        colaboradorId: colabId,
        colaboradorNome: cp.favorecido_nome || cp.fornecedor || 'Colaborador',
        valor: Number(cp.valor) || 0,
        data: cp.data_pagamento || cp.data_vencimento || '',
        formaPagamento: cp.forma_pagamento || 'PIX',
        contaBancariaId: cp.conta_bancaria_id,
        contaBancariaNome: cp.contas_bancarias?.nome_conta || 'Caixa Geral',
        observacao: limpaObs,
        status: cp.status === 'PAGO' ? 'PAGO' : 'PENDENTE',
        created_at: cp.created_at
      };
    });
  } catch {
    return [];
  }
}

export async function excluirValeColaborador(id: string): Promise<boolean> {
  const { error } = await supabase.from('contas_pagar').delete().eq('id', id);
  return !error;
}

