export interface ServicoCalculosInput {
  horimetroInicial: number;
  horimetroFinal?: number;
  valorHora: number;
  combustivelMaquinaValor: number;
  combustivelApoioValor: number;
  despesaOperador: number;
  despesaApoio: number;
  despesaManutencao: number;
  valorHoraOperador?: number;
  adiantamentoOperadorValor?: number;
  valorAdiantamentoCliente?: number;
}

export function calcularMetricasServico(input: ServicoCalculosInput) {
  const horasTrabalhadas = input.horimetroFinal !== undefined
    ? Math.max(0, Number((input.horimetroFinal - input.horimetroInicial).toFixed(1)))
    : 0;
  const faturamentoBruto = Number((horasTrabalhadas * input.valorHora).toFixed(2));
  const combustivelTotalValor = Number((input.combustivelMaquinaValor + input.combustivelApoioValor).toFixed(2));

  // Remuneração do operador: calculada por hora caso fornecida e > 0, ou diária manual
  const valorHoraOp = input.valorHoraOperador || 0;
  const despesaOperadorCalculada = valorHoraOp > 0
    ? Number((horasTrabalhadas * valorHoraOp).toFixed(2))
    : input.despesaOperador;

  const despesasTotal = Number(
    (combustivelTotalValor + despesaOperadorCalculada + input.despesaApoio + input.despesaManutencao).toFixed(2)
  );
  const lucroLiquido = Number((faturamentoBruto - despesasTotal).toFixed(2));
  const margemLucro = faturamentoBruto > 0 ? Number(((lucroLiquido / faturamentoBruto) * 100).toFixed(1)) : 0;

  // Cálculos do Operador
  const adiantamentoOp = input.adiantamentoOperadorValor || 0;
  const saldoPagarOperador = Number(Math.max(0, despesaOperadorCalculada - adiantamentoOp).toFixed(2));
  const statusPagamentoOperador: 'PENDENTE' | 'PAGO' | 'PARCIAL' = despesaOperadorCalculada === 0
    ? 'PENDENTE'
    : (adiantamentoOp >= despesaOperadorCalculada ? 'PAGO' : (adiantamentoOp > 0 ? 'PARCIAL' : 'PENDENTE'));

  // Cálculos do Cliente
  const adiantamentoCli = input.valorAdiantamentoCliente || 0;
  const saldoRestanteCliente = Number(Math.max(0, faturamentoBruto - adiantamentoCli).toFixed(2));
  const statusPagamentoCliente: 'PENDENTE' | 'PARCIAL' | 'QUITADO' = faturamentoBruto === 0
    ? 'PENDENTE'
    : (adiantamentoCli >= faturamentoBruto ? 'QUITADO' : (adiantamentoCli > 0 ? 'PARCIAL' : 'PENDENTE'));

  return {
    horasTrabalhadas,
    faturamentoBruto,
    combustivelTotalValor,
    despesaOperadorCalculada,
    despesasTotal,
    lucroLiquido,
    margemLucro,
    saldoPagarOperador,
    statusPagamentoOperador,
    saldoRestanteCliente,
    statusPagamentoCliente
  };
}

export function calcularTotaisListaServicos(lista: any[]) {
  const totalHoras = lista.reduce((acc, s) => acc + (Number(s.horas_trabalhadas) || 0), 0);
  const faturamentoTotal = lista.reduce((acc, s) => acc + (Number(s.faturamento_bruto) || 0), 0);
  const combustivelTotal = lista.reduce((acc, s) => acc + (Number(s.combustivel_total_valor || s.combustivel_valor) || 0), 0);
  const despesasTotal = lista.reduce((acc, s) => acc + (Number(s.despesas_total) || 0), 0);
  const lucroLiquidoTotal = lista.reduce((acc, s) => acc + (Number(s.lucro_liquido) || 0), 0);
  const totalRecebido = lista.reduce((acc, s) => {
    const hist = Array.isArray(s.adiantamentos_historico) && s.adiantamentos_historico.length > 0
      ? s.adiantamentos_historico.reduce((sum: number, h: any) => sum + (Number(h.valor) || 0), 0) : 0;
    return acc + Math.max(Number(s.valor_adiantamento || 0), hist);
  }, 0);
  const saldoAReceberTotal = Math.max(0, Number((faturamentoTotal - totalRecebido).toFixed(2)));

  return { totalHoras, faturamentoTotal, combustivelTotal, despesasTotal, lucroLiquidoTotal, totalRecebido, saldoAReceberTotal };
}

