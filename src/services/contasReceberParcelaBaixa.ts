import { supabase } from '../lib/supabase';
import type { FormaPagamentoTitulo } from '../types/faturamento.types';
import type { AdiantamentoItem, ParcelaItem } from '../types/servicoHorimetro.types';

export function parseParcelaRef(id: string): { servId: string; numParc: number } | null {
  const m = id.match(/^serv_([^_]+(?:-[^_]+)*)_p(\d+)$/);
  if (!m) return null;
  return { servId: m[1], numParc: parseInt(m[2], 10) };
}

export async function liquidarParcelaReceber(
  servId: string,
  numParc: number,
  dataPagamento: string,
  formaPagamento: FormaPagamentoTitulo | string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: serv, error: sErr } = await supabase
      .from('servicos_horimetro')
      .select('*')
      .eq('id', servId)
      .maybeSingle();

    if (sErr || !serv) throw new Error('Serviço não encontrado para baixar parcela.');

    const parcelas: ParcelaItem[] = Array.isArray(serv.parcelas) ? [...serv.parcelas] : [];
    const targetIdx = parcelas.findIndex((p) => p.numero === numParc);
    if (targetIdx === -1) throw new Error(`Parcela #${numParc} não encontrada no serviço.`);

    const parcela = parcelas[targetIdx];
    parcelas[targetIdx] = { ...parcela, status: 'PAGO' };

    const historico: AdiantamentoItem[] = Array.isArray(serv.adiantamentos_historico)
      ? [...serv.adiantamentos_historico]
      : [];

    historico.push({
      id: 'REC_' + Date.now().toString(36).toUpperCase(),
      valor: Number(parcela.valor),
      data: dataPagamento,
      forma_pagamento: formaPagamento,
      observacao: `Recebimento Parcela ${numParc}/${parcelas.length} (${parcela.forma || 'A Prazo'})`
    });

    const todasPagas = parcelas.every((p) => p.status === 'PAGO');
    const totRecebido = historico.reduce((acc, h) => acc + (Number(h.valor) || 0), 0);
    const bruto = Number(serv.faturamento_bruto || 0);
    const saldo = Math.max(0, Number((bruto - totRecebido).toFixed(2)));
    const statusCli = todasPagas || saldo <= 0 ? 'QUITADO' : 'PARCIAL';

    await supabase.from('servicos_horimetro').update({
      parcelas,
      valor_adiantamento: totRecebido,
      adiantamentos_historico: historico,
      saldo_restante: todasPagas ? 0 : saldo,
      status_pagamento_cliente: statusCli,
      updated_at: new Date().toISOString()
    }).eq('id', servId);

    const medStatus = todasPagas || saldo <= 0 ? 'PAGO' : 'PAGO_PARCIAL';
    await supabase.from('medicoes').update({
      status_pagamento: medStatus,
      data_pagamento: dataPagamento,
      forma_pagamento: formaPagamento
    }).ilike('observacoes', `%[REF:${servId}]%`);

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao baixar parcela' };
  }
}
