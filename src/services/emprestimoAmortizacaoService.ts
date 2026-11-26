import { supabase } from '../lib/supabase';
import type { ContaPagarItem } from '../types/contasPagar.types';
import {
  extrairAmortizacoesEmprestimo,
  montarObservacoesComAmortizacoes,
  type AmortizacaoEmprestimoItem
} from '../utils/emprestimoAmortizacaoHelper';

export interface NovaAmortizacaoParams {
  emprestimo: ContaPagarItem;
  valor: number;
  data: string;
  forma: string;
  descricao: string;
  contaBancariaId?: string;
  lancarSaidaCaixa: boolean;
  credorNome: string;
}

export async function registrarAmortizacaoEmprestimo(
  params: NovaAmortizacaoParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const { emprestimo, data, forma, descricao, contaBancariaId, lancarSaidaCaixa, credorNome } = params;
    const resumo = extrairAmortizacoesEmprestimo(emprestimo);
    const val = Number(Math.min(Number(params.valor) || 0, resumo.saldoRestante).toFixed(2));
    if (val <= 0) return { success: false, error: 'Informe um valor maior que zero.' };

    let contaPagarGeradaId: string | null = null;
    if (lancarSaidaCaixa) {
      const { data: inserted, error: insErr } = await supabase
        .from('contas_pagar')
        .insert([{
          tenant_id: emprestimo.tenant_id || null,
          obra_id: emprestimo.obra_id || null,
          descricao: `Abatimento Empréstimo (${credorNome}): ${descricao.trim() || 'Parcela parcial'}`,
          fornecedor: credorNome,
          categoria: 'OUTROS',
          valor: val,
          data_vencimento: data,
          data_pagamento: data,
          forma_pagamento: forma === 'DESPESA_ABATIDA' ? 'OUTROS' : forma,
          conta_bancaria_id: contaBancariaId || null,
          status: 'PAGO',
          observacoes: `[ABAT_EMP:${emprestimo.id}] ${descricao.trim()}`
        }])
        .select('id')
        .single();
      if (insErr) throw new Error(insErr.message);
      contaPagarGeradaId = inserted?.id || null;
    }

    const novaParcela: AmortizacaoEmprestimoItem = {
      id: crypto.randomUUID(),
      data,
      valor: val,
      forma,
      descricao: descricao.trim() || 'Abatimento parcial',
      contaBancariaId: contaBancariaId || null,
      contaPagarGeradaId
    };

    const novoHistorico = [novaParcela, ...resumo.historico];
    const novoTotalAmortizado = Number(novoHistorico.reduce((a, b) => a + (Number(b.valor) || 0), 0).toFixed(2));
    const novoSaldo = Number(Math.max(0, resumo.valorOriginal - novoTotalAmortizado).toFixed(2));
    const quitado = novoSaldo <= 0.01;

    const novasObs = montarObservacoesComAmortizacoes(emprestimo.observacoes, resumo.valorOriginal, novoHistorico);
    const { error: updErr } = await supabase
      .from('contas_pagar')
      .update({
        valor: quitado ? resumo.valorOriginal : novoSaldo,
        status: quitado ? 'PAGO' : 'PENDENTE',
        data_pagamento: quitado ? data : null,
        observacoes: novasObs
      })
      .eq('id', emprestimo.id);

    if (updErr) throw new Error(updErr.message);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao registrar abatimento' };
  }
}

export async function estornarAmortizacaoEmprestimo(
  emprestimo: ContaPagarItem,
  amortizacaoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resumo = extrairAmortizacoesEmprestimo(emprestimo);
    const alvo = resumo.historico.find((h) => h.id === amortizacaoId);
    if (!alvo) return { success: false, error: 'Abatimento não encontrado.' };

    if (alvo.contaPagarGeradaId) {
      await supabase.from('contas_pagar').delete().eq('id', alvo.contaPagarGeradaId);
    }

    const novoHistorico = resumo.historico.filter((h) => h.id !== amortizacaoId);
    const novoTotalAmortizado = Number(novoHistorico.reduce((a, b) => a + (Number(b.valor) || 0), 0).toFixed(2));
    const novoSaldo = Number(Math.max(0, resumo.valorOriginal - novoTotalAmortizado).toFixed(2));
    const novasObs = montarObservacoesComAmortizacoes(emprestimo.observacoes, resumo.valorOriginal, novoHistorico);

    const { error: updErr } = await supabase
      .from('contas_pagar')
      .update({
        valor: novoSaldo,
        status: novoSaldo <= 0.01 ? 'PAGO' : 'PENDENTE',
        data_pagamento: novoSaldo <= 0.01 ? emprestimo.data_pagamento : null,
        observacoes: novasObs
      })
      .eq('id', emprestimo.id);

    if (updErr) throw new Error(updErr.message);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao estornar abatimento' };
  }
}
