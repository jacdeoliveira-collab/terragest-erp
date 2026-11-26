import { supabase } from '../lib/supabase';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export interface ReconciliarOperadorParams {
  tenantId?: string | null;
  operadorNome: string;
  operadorId?: string;
  dataReferencia?: string;
}

export interface ReconciliarOperadorResult {
  servicosQuitados: number;
  servicosParciais: number;
  contasBaixadas: number;
  totalRepassado: number;
}

function calcularRemuneracaoServico(s: ServicoHorimetro): number {
  const h = Number(s.horas_trabalhadas) || 0;
  const vHora = Number(s.valor_hora_operador) || 0;
  return vHora > 0 ? Number((h * vHora).toFixed(2)) : Number((Number(s.despesa_operador) || 0).toFixed(2));
}

/**
 * Reconcilia em ordem cronológica (FIFO - mais antigos primeiro) todos os repasses/vales
 * já pagos a um operador específico, dando baixa em servicos_horimetro e contas_pagar.
 */
export async function reconciliarBaixasOperador({
  tenantId,
  operadorNome,
  operadorId,
  dataReferencia = new Date().toISOString().slice(0, 10)
}: ReconciliarOperadorParams): Promise<ReconciliarOperadorResult> {
  const nomeLimpo = (operadorNome || '').trim();
  const tId = tenantId || (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null);
  if (!nomeLimpo && !operadorId) {
    return { servicosQuitados: 0, servicosParciais: 0, contasBaixadas: 0, totalRepassado: 0 };
  }

  let qSrv = supabase.from('servicos_horimetro').select('*').order('data_inicio', { ascending: true }).order('created_at', { ascending: true });
  if (operadorId && nomeLimpo) qSrv = qSrv.or(`operador_id.eq.${operadorId},operador_nome.ilike.%${nomeLimpo}%`);
  else if (operadorId) qSrv = qSrv.eq('operador_id', operadorId);
  else qSrv = qSrv.ilike('operador_nome', `%${nomeLimpo}%`);
  if (tId) qSrv = qSrv.eq('tenant_id', tId);

  let qCp = supabase.from('contas_pagar').select('*').eq('categoria', 'FOLHA_RH').order('data_vencimento', { ascending: true });
  if (operadorId && nomeLimpo) qCp = qCp.or(`fornecedor.ilike.%${nomeLimpo}%,descricao.ilike.%${nomeLimpo}%,observacoes.ilike.%[COLAB_ID:${operadorId}]%`);
  else if (operadorId) qCp = qCp.ilike('observacoes', `%[COLAB_ID:${operadorId}]%`);
  else qCp = qCp.or(`fornecedor.ilike.%${nomeLimpo}%,descricao.ilike.%${nomeLimpo}%`);
  if (tId) qCp = qCp.eq('tenant_id', tId);

  const [resSrv, resCp] = await Promise.all([qSrv, qCp]);
  const servicos = (resSrv.data || []) as ServicoHorimetro[];
  const contasFolha = (resCp.data || []) as any[];

  const valesPagos = contasFolha.filter((cp) => {
    const obs = cp.observacoes || '';
    const desc = (cp.descricao || '').toLowerCase();
    return (obs.includes('[VALE_RH]') || desc.includes('vale') || desc.includes('repasse')) && cp.status === 'PAGO';
  });

  const contasComissao = contasFolha.filter((cp) => {
    const obs = cp.observacoes || '';
    const desc = (cp.descricao || '').toLowerCase();
    return !obs.includes('[VALE_RH]') && !desc.includes('vale') && !desc.includes('repasse');
  });

  const totalRepassado = Number(valesPagos.reduce((acc, v) => acc + (Number(v.valor) || 0), 0).toFixed(2));
  let creditoRestante = totalRepassado;
  let servicosQuitados = 0;
  let servicosParciais = 0;
  let contasBaixadas = 0;

  for (const s of servicos) {
    const remun = calcularRemuneracaoServico(s);
    if (remun <= 0) continue;

    const aplicado = Number(Math.min(remun, Math.max(0, creditoRestante)).toFixed(2));
    creditoRestante = Number(Math.max(0, creditoRestante - aplicado).toFixed(2));
    const saldo = Number(Math.max(0, remun - aplicado).toFixed(2));
    const status = saldo <= 0.01 ? 'PAGO' : aplicado > 0 ? 'PARCIAL' : 'PENDENTE';

    if (status === 'PAGO') servicosQuitados++;
    else if (status === 'PARCIAL') servicosParciais++;

    await supabase.from('servicos_horimetro').update({
      adiantamento_operador_valor: aplicado,
      saldo_pagar_operador: saldo,
      status_pagamento_operador: status,
      data_pagamento_operador: status === 'PAGO' ? (s.data_pagamento_operador || dataReferencia) : null
    }).eq('id', s.id);

    const cpRef = contasComissao.find((cp) => (cp.observacoes || '').includes(`[REF:${s.id}]`));
    if (cpRef) {
      await supabase.from('contas_pagar').update({
        status: status === 'PAGO' ? 'PAGO' : 'PENDENTE',
        data_pagamento: status === 'PAGO' ? dataReferencia : null,
        valor: status === 'PAGO' ? remun : saldo,
        observacoes: `[REF:${s.id}] Remuneração: R$ ${remun.toFixed(2)} | Abatido por Repasses: R$ ${aplicado.toFixed(2)} | Saldo: R$ ${saldo.toFixed(2)}`
      }).eq('id', cpRef.id);
      if (status === 'PAGO') contasBaixadas++;
    }
  }

  // Também dá baixa em contas_pagar pendentes avulsas do operador sem [REF:...] usando eventual saldo de repasses
  let creditoAvulso = totalRepassado - servicos.reduce((acc, s) => {
    const remun = calcularRemuneracaoServico(s);
    return acc + (remun > 0 ? Math.min(remun, Number(s.adiantamento_operador_valor) || 0) : 0);
  }, 0);
  const avulsasPendentes = contasComissao.filter((cp) => cp.status !== 'PAGO' && !(cp.observacoes || '').includes('[REF:'));
  for (const cp of avulsasPendentes) {
    const val = Number(cp.valor) || 0;
    if (val > 0 && creditoAvulso >= val - 0.01) {
      creditoAvulso = Number((creditoAvulso - val).toFixed(2));
      await supabase.from('contas_pagar').update({ status: 'PAGO', data_pagamento: dataReferencia }).eq('id', cp.id);
      contasBaixadas++;
    }
  }

  return { servicosQuitados, servicosParciais, contasBaixadas, totalRepassado };
}
