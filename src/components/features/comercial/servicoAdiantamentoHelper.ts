import { supabase } from '../../../lib/supabase';
import type { ServicoHorimetro, AdiantamentoItem } from '../../../types/servicoHorimetro.types';

export async function processarNovoAdiantamentoServico(
  servico: ServicoHorimetro,
  valor: number,
  forma: string,
  data: string,
  salvarServico: (s: Partial<ServicoHorimetro>) => Promise<{ success: boolean; data?: ServicoHorimetro }>
) {
  const historicoAtual: AdiantamentoItem[] = Array.isArray(servico.adiantamentos_historico) && servico.adiantamentos_historico.length > 0
    ? [...servico.adiantamentos_historico]
    : (servico.valor_adiantamento && Number(servico.valor_adiantamento) > 0
        ? [{
            id: 'ad_init_1',
            valor: Number(servico.valor_adiantamento),
            data: servico.data_adiantamento || data,
            forma_pagamento: servico.forma_pagamento_adiantamento || forma,
            observacao: 'Sinal / 1º Haver'
          }]
        : []);

  const novoItem: AdiantamentoItem = {
    id: `ad_${Date.now()}`,
    valor,
    data,
    forma_pagamento: forma,
    observacao: `Haver recebido (${forma})`
  };
  const novoHistorico = [...historicoAtual, novoItem];
  const totalRecebido = Number(novoHistorico.reduce((acc, h) => acc + (Number(h.valor) || 0), 0).toFixed(2));
  const saldo = Math.max(0, Number((Number(servico.faturamento_bruto || 0) - totalRecebido).toFixed(2)));

  await salvarServico({
    id: servico.id,
    valor_adiantamento: totalRecebido,
    data_adiantamento: data,
    forma_pagamento_adiantamento: forma,
    adiantamentos_historico: novoHistorico,
    saldo_restante: saldo,
    status_pagamento_cliente: saldo <= 0 ? 'QUITADO' : 'PARCIAL'
  });

  try {
    await supabase.from('contas_receber').insert([{
      cliente_id: servico.cliente_id || null,
      valor_total: valor,
      data_vencimento: data,
      data_pagamento: data,
      forma_pagamento: forma,
      status_pagamento: 'PAGO',
      observacoes: `[SINAL_SERVICO:${servico.id}] Haver / Adiantamento de serviço por horímetro`,
      competencia: data.slice(0, 7)
    }]);
  } catch {}
}
