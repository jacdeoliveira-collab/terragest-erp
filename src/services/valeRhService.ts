import { supabase } from '../lib/supabase';
import type { ValeColaboradorItem, LancarValePayload } from '../types/valeRh.types';

export function parseValeObservacoes(rawObs?: string | null, fallbackDesc?: string): {
  colaboradorId?: string;
  comprovanteUrl?: string;
  observacaoLimpa: string;
} {
  const obs = rawObs || '';
  const matchColab = obs.match(/\[COLAB_ID:([^\]]+)\]/);
  const matchComp = obs.match(/\[COMPROVANTE:([^\]]+)\]/);
  const observacaoLimpa = obs
    .replace(/\[VALE_RH\]/g, '')
    .replace(/\[COLAB_ID:[^\]]+\]/g, '')
    .replace(/\[COMPROVANTE:[^\]]+\]/g, '')
    .trim() || fallbackDesc || '';

  return {
    colaboradorId: matchColab?.[1],
    comprovanteUrl: matchComp?.[1],
    observacaoLimpa
  };
}

export function mapContaPagarToVale(cp: any, fallbackColabId?: string, fallbackNome?: string): ValeColaboradorItem {
  const { colaboradorId, comprovanteUrl, observacaoLimpa } = parseValeObservacoes(cp.observacoes, cp.descricao);
  return {
    id: cp.id,
    tenant_id: cp.tenant_id,
    colaboradorId: colaboradorId || fallbackColabId,
    colaboradorNome: cp.favorecido_nome || cp.fornecedor || fallbackNome || 'Colaborador',
    valor: Number(cp.valor) || 0,
    data: cp.data_pagamento || cp.data_vencimento || '',
    formaPagamento: cp.forma_pagamento || 'PIX',
    contaBancariaId: cp.conta_bancaria_id,
    contaBancariaNome: cp.contas_bancarias?.nome_conta || 'Caixa Geral',
    observacao: observacaoLimpa,
    comprovanteUrl,
    status: cp.status === 'PAGO' ? 'PAGO' : 'PENDENTE',
    created_at: cp.created_at
  };
}

export async function lancarValeColaborador(payload: LancarValePayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const tagColab = payload.colaboradorId ? ` [COLAB_ID:${payload.colaboradorId}]` : '';
    const tagComp = payload.comprovanteUrl ? ` [COMPROVANTE:${payload.comprovanteUrl}]` : '';
    const obsIdentificada = `[VALE_RH]${tagColab} ${payload.observacao?.trim() || 'Adiantamento de salário / Vale'}${tagComp}`;

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

export async function anexarComprovanteVale(id: string, comprovanteUrl: string): Promise<boolean> {
  try {
    const { data } = await supabase.from('contas_pagar').select('observacoes').eq('id', id).maybeSingle();
    const baseObs = (data?.observacoes || '[VALE_RH]').replace(/\s*\[COMPROVANTE:[^\]]+\]/g, '').trim();
    const novaObs = `${baseObs} [COMPROVANTE:${comprovanteUrl}]`;
    const { error } = await supabase.from('contas_pagar').update({ observacoes: novaObs }).eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

export async function carregarValesColaboradores(tenantId?: string | null): Promise<ValeColaboradorItem[]> {
  try {
    let q = supabase
      .from('contas_pagar')
      .select('*, contas_bancarias(nome_conta)')
      .eq('categoria', 'FOLHA_RH')
      .order('data_pagamento', { ascending: false });

    if (tenantId) q = q.eq('tenant_id', tenantAtivoOrDefault(tenantId));

    const { data, error } = await q;
    if (error || !data) return [];

    return data
      .filter((cp: any) => {
        const obs = cp.observacoes || '';
        const desc = cp.descricao || '';
        return obs.includes('[VALE_RH]') || desc.toLowerCase().includes('vale');
      })
      .map((cp: any) => mapContaPagarToVale(cp));
  } catch {
    return [];
  }
}

function tenantAtivoOrDefault(t: string): string {
  return t;
}

export async function excluirValeColaborador(id: string): Promise<boolean> {
  const { error } = await supabase.from('contas_pagar').delete().eq('id', id);
  return !error;
}
