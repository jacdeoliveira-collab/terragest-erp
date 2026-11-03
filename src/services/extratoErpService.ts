import { supabase } from '../lib/supabase';

export interface MovimentoErp {
  id: string; data: string; desc: string; banco: string; valor: number; tipo: 'ENTRADA' | 'SAIDA';
}

/** Monta o extrato ERP (entradas e saídas liquidadas) com o banco/caixa de cada movimentação. */
export async function carregarMovimentosErp(bancoPadrao: string): Promise<MovimentoErp[]> {
  const [{ data: rec }, { data: pag }, { data: srv }, { data: cts }] = await Promise.all([
    supabase.from('medicoes').select('id, numero_medicao, valor_total, data_pagamento, conta_bancaria_id, observacoes').eq('status_pagamento', 'PAGO').limit(40),
    supabase.from('contas_pagar').select('id, descricao, fornecedor, valor, data_pagamento, conta_bancaria_id').eq('status', 'PAGO').limit(40),
    supabase.from('servicos_horimetro').select('id, cliente_nome, maquina_nome, valor_adiantamento, data_adiantamento, conta_bancaria_id, adiantamentos_historico').gt('valor_adiantamento', 0).limit(25),
    supabase.from('contas_bancarias').select('id, nome_conta, banco')
  ]);
  const bancos = new Map<string, string>((cts || []).map((c: any) => [c.id, `${c.nome_conta} (${c.banco})`]));
  const movs: MovimentoErp[] = [];

  (rec || []).forEach((r: any) => movs.push({
    id: `r_${r.id}`, data: r.data_pagamento || '',
    desc: `Recebimento Fatura ${r.numero_medicao || ''} ${r.observacoes ? `• ${String(r.observacoes).slice(0, 45)}` : ''}`,
    banco: bancos.get(r.conta_bancaria_id) || bancoPadrao, valor: Number(r.valor_total || 0), tipo: 'ENTRADA'
  }));
  (srv || []).forEach((s: any) => {
    const itens = Array.isArray(s.adiantamentos_historico) && s.adiantamentos_historico.length > 0
      ? s.adiantamentos_historico.filter((i: any) => i.forma_pagamento !== 'DESCONTO')
      : [{ id: 'sinal', valor: s.valor_adiantamento, data: s.data_adiantamento, conta_bancaria_id: s.conta_bancaria_id }];
    itens.forEach((i: any, idx: number) => movs.push({
      id: `s_${s.id}_${i.id || idx}`, data: i.data || '', desc: `Sinal / Haver: ${s.cliente_nome || ''} (${s.maquina_nome || ''})`,
      banco: bancos.get(i.conta_bancaria_id || s.conta_bancaria_id) || bancoPadrao, valor: Number(i.valor || 0), tipo: 'ENTRADA'
    }));
  });
  (pag || []).forEach((p: any) => movs.push({
    id: `p_${p.id}`, data: p.data_pagamento || '', desc: `Pagamento: ${p.descricao || ''} (${p.fornecedor || ''})`,
    banco: bancos.get(p.conta_bancaria_id) || bancoPadrao, valor: Number(p.valor || 0), tipo: 'SAIDA'
  }));
  return movs.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
}

