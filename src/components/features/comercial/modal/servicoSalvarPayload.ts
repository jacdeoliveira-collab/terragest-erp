import type { ServicoHorimetro, FotoTrabalhoItem, ServicoMaquinaItem } from '../../../../types/servicoHorimetro.types';

export function montarPayloadServico(
  servicoId: string | undefined,
  finalizar: boolean,
  dados: {
    clienteId?: string;
    clienteNome: string;
    clienteDocumento?: string;
    clienteTelefone?: string;
    obraId?: string;
    obraNome?: string;
    maquinaId?: string;
    maquinaNome: string;
    operadorId?: string;
    operadorNome: string;
    descricaoServico: string;
    dataInicio: string;
    dataFim?: string;
    horimetroInicial: number;
    horimetroFinal?: number;
    fotoHorimetroInicial?: string;
    fotoHorimetroFinal?: string;
    alertaPainel?: string;
    valorHora: number;
    combustivelMaquinaLitros: number;
    combustivelMaquinaValor: number;
    combustivelApoioLitros: number;
    combustivelApoioValor: number;
    fotoCupom?: string;
    despesaOperador: number;
    despesaApoio: number;
    despesaManutencao: number;
    observacoes?: string;
    valorAdiantamento?: number;
    dataAdiantamento?: string;
    formaPagamentoAdiantamento?: string;
    adiantamentosHistorico?: import('../../../../types/servicoHorimetro.types').AdiantamentoItem[];
    fotosTrabalho?: FotoTrabalhoItem[];
    fotos_trabalho?: FotoTrabalhoItem[];
    despesasItens?: import('../../../../types/servicoHorimetro.types').DespesaItemServico[];
    valorHoraOperador?: number;
    adiantamentoOperadorValor?: number;
    adiantamentoOperadorData?: string;
    dataPagamentoOperador?: string;
    maquinasItens?: ServicoMaquinaItem[];
    abastecimentosIds?: string[];
    formaPagamento?: string;
    condicaoPagamento?: string;
    contaBancariaId?: string;
    prazoDescricao?: string;
    dataVencimento?: string;
    parcelas?: import('../../../../types/servicoHorimetro.types').ParcelaItem[];
  },
  metricas: {
    horasTrabalhadas: number;
    faturamentoBruto: number;
    combustivelTotalValor: number;
    despesaOperadorCalculada?: number;
    despesasTotal: number;
    lucroLiquido: number;
    margemLucro: number;
    saldoPagarOperador?: number;
    statusPagamentoOperador?: 'PENDENTE' | 'PAGO' | 'PARCIAL';
    saldoRestanteCliente?: number;
    statusPagamentoCliente?: 'PENDENTE' | 'PARCIAL' | 'QUITADO';
  }
): Partial<ServicoHorimetro> {
  const adiantamento = Number(dados.valorAdiantamento || 0);
  const saldo = metricas.saldoRestanteCliente !== undefined
    ? metricas.saldoRestanteCliente
    : Math.max(0, metricas.faturamentoBruto - adiantamento);

  return {
    ...(servicoId ? { id: servicoId } : {}),
    cliente_id: dados.clienteId || undefined,
    cliente_nome: dados.clienteNome.trim(),
    cliente_documento: dados.clienteDocumento?.trim() || undefined,
    cliente_telefone: dados.clienteTelefone?.trim() || undefined,
    obra_id: dados.obraId || undefined,
    obra_nome: dados.obraNome?.trim() || undefined,
    maquina_id: dados.maquinaId || undefined,
    maquina_nome: dados.maquinaNome.trim(),
    operador_id: dados.operadorId || undefined,
    operador_nome: dados.operadorNome.trim(),
    descricao_servico: dados.descricaoServico.trim(),
    data_inicio: dados.dataInicio,
    data_fim: dados.dataFim ? dados.dataFim : (finalizar ? new Date().toISOString().split('T')[0] : undefined),
    horimetro_inicial: Number(dados.horimetroInicial),
    horimetro_final: dados.horimetroFinal !== undefined ? Number(dados.horimetroFinal) : undefined,
    foto_horimetro_inicial: dados.fotoHorimetroInicial,
    foto_horimetro_final: dados.fotoHorimetroFinal,
    alerta_painel: dados.alertaPainel?.trim() || undefined,
    valor_hora: Number(dados.valorHora),
    horas_trabalhadas: metricas.horasTrabalhadas,
    faturamento_bruto: metricas.faturamentoBruto,
    combustivel_maquina_litros: Number(dados.combustivelMaquinaLitros),
    combustivel_maquina_valor: Number(dados.combustivelMaquinaValor),
    combustivel_apoio_litros: Number(dados.combustivelApoioLitros),
    combustivel_apoio_valor: Number(dados.combustivelApoioValor),
    combustivel_total_valor: metricas.combustivelTotalValor,
    foto_cupom_combustivel: dados.fotoCupom,
    despesa_operador: metricas.despesaOperadorCalculada !== undefined ? metricas.despesaOperadorCalculada : Number(dados.despesaOperador),
    despesa_apoio: Number(dados.despesaApoio),
    despesa_manutencao: Number(dados.despesaManutencao),
    despesas_itens: dados.despesasItens || [],
    despesas_total: metricas.despesasTotal,
    lucro_liquido: metricas.lucroLiquido,
    margem_lucro: metricas.margemLucro,
    valor_hora_operador: Number(dados.valorHoraOperador || 0),
    adiantamento_operador_valor: Number(dados.adiantamentoOperadorValor || 0),
    adiantamento_operador_data: dados.adiantamentoOperadorData || undefined,
    saldo_pagar_operador: metricas.saldoPagarOperador || 0,
    data_pagamento_operador: dados.dataPagamentoOperador || undefined,
    status_pagamento_operador: metricas.statusPagamentoOperador || 'PENDENTE',
    valor_adiantamento: adiantamento,
    data_adiantamento: dados.dataAdiantamento || undefined,
    forma_pagamento_adiantamento: dados.formaPagamentoAdiantamento || undefined,
    adiantamentos_historico: dados.adiantamentosHistorico || [],
    saldo_restante: saldo,
    status_pagamento_cliente: metricas.statusPagamentoCliente || 'PENDENTE',
    forma_pagamento: dados.formaPagamento || undefined,
    condicao_pagamento: dados.condicaoPagamento || undefined,
    conta_bancaria_id: dados.contaBancariaId || undefined,
    prazo_descricao: dados.prazoDescricao?.trim() || undefined,
    data_vencimento: dados.dataVencimento || undefined,
    parcelas: dados.parcelas || [],
    fotos_trabalho: dados.fotosTrabalho || [],
    maquinas_itens: dados.maquinasItens || [],
    abastecimentos_ids: dados.abastecimentosIds || [],
    status: (finalizar || !!dados.dataFim) ? 'FINALIZADO' : 'EM_ANDAMENTO',
    observacoes: dados.observacoes?.trim() || undefined
  };
}
