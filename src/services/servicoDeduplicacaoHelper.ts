import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export function deduplicarServicos(itens: ServicoHorimetro[]): { lista: ServicoHorimetro[]; duplicadosIds: string[] } {
  const mapa = new Map<string, ServicoHorimetro>();

  for (const s of itens) {
    if (s.id && !mapa.has(s.id)) {
      mapa.set(s.id, s);
    }
  }

  // Nunca apaga serviços legítimos do banco
  return { lista: Array.from(mapa.values()), duplicadosIds: [] };
}

export function sincronizarAdiantamentosServicos(lista: ServicoHorimetro[]): boolean {
  let modificado = false;
  for (const s of lista) {
    if (Array.isArray(s.adiantamentos_historico) && s.adiantamentos_historico.length > 0) {
      const soma = s.adiantamentos_historico.reduce((acc, h) => acc + (Number(h.valor) || 0), 0);
      if (soma > Number(s.valor_adiantamento || 0)) {
        s.valor_adiantamento = soma;
        s.saldo_restante = Math.max(0, Number((Number(s.faturamento_bruto || 0) - soma).toFixed(2)));
        s.status_pagamento_cliente = s.saldo_restante <= 0 ? 'QUITADO' : 'PARCIAL';
        modificado = true;
      }
    }
  }
  return modificado;
}

