import { supabase } from '../lib/supabase';
import type { AdiantamentoItem } from '../types/servicoHorimetro.types';

export async function registrarQuitacaoIntegralServico(
  servicoId: string,
  dataPagamento: string,
  formaPagamento: string
): Promise<void> {
  const { data: serv } = await supabase
    .from('servicos_horimetro')
    .select('faturamento_bruto, adiantamentos_historico')
    .eq('id', servicoId)
    .maybeSingle();

  if (!serv) return;

  const bruto = Number(serv.faturamento_bruto || 0);
  const hist: AdiantamentoItem[] = Array.isArray(serv.adiantamentos_historico)
    ? [...serv.adiantamentos_historico]
    : [];

  const totPago = hist.reduce((acc, h) => acc + (Number(h.valor) || 0), 0);
  const pendente = Math.max(0, Number((bruto - totPago).toFixed(2)));

  if (pendente > 0) {
    hist.push({
      id: 'QUIT_' + Date.now().toString(36).toUpperCase(),
      valor: pendente,
      data: dataPagamento,
      forma_pagamento: formaPagamento,
      observacao: 'Quitação integral de saldo'
    });
  }

  await supabase.from('servicos_horimetro').update({
    status_pagamento_cliente: 'QUITADO',
    saldo_restante: 0,
    valor_adiantamento: bruto,
    data_adiantamento: dataPagamento,
    forma_pagamento_adiantamento: formaPagamento,
    adiantamentos_historico: hist,
    updated_at: new Date().toISOString()
  }).eq('id', servicoId);
}
