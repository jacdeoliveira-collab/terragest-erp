import * as XLSX from 'xlsx';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export function exportarServicosHorimetroExcel(servicos: ServicoHorimetro[], nomeArquivoCustom?: string): void {
  if (!servicos || servicos.length === 0) return;

  const dadosFormatados = servicos.map((s, idx) => {
    const hist = Array.isArray(s.adiantamentos_historico)
      ? s.adiantamentos_historico.reduce((acc, h) => acc + (Number(h.valor) || 0), 0)
      : 0;
    const adiantamentoTotal = Math.max(Number(s.valor_adiantamento || 0), hist);
    const fatBruto = Number(s.faturamento_bruto || 0);
    const saldoPendente = Math.max(0, fatBruto - adiantamentoTotal);

    return {
      '#': idx + 1,
      'Cliente': s.cliente_nome || '',
      'Descrição / Obra': s.descricao_servico || s.obra_nome || '',
      'Centro de Custo': s.obra_nome || '',
      'Máquina / Equipamento': s.maquina_nome || '',
      'Operador': s.operador_nome || '',
      'Data Início': s.data_inicio || '',
      'Data Fim': s.data_fim || '',
      'Horímetro Inicial': Number(s.horimetro_inicial || 0),
      'Horímetro Final': s.horimetro_final !== undefined ? Number(s.horimetro_final) : '',
      'Horas Trabalhadas': Number(s.horas_trabalhadas || 0),
      'Valor Hora (R$)': Number(s.valor_hora || 0),
      'Faturamento Bruto (R$)': fatBruto,
      'Adiantamento Recebido (R$)': adiantamentoTotal,
      'Saldo a Receber (R$)': saldoPendente,
      'Status Pagamento': s.status_pagamento_cliente || (saldoPendente <= 0 ? 'QUITADO' : 'PENDENTE'),
      'Diesel Máquina (L)': Number(s.combustivel_maquina_litros || 0),
      'Diesel Máquina (R$)': Number(s.combustivel_maquina_valor || 0),
      'Diesel Apoio (L)': Number(s.combustivel_apoio_litros || 0),
      'Diesel Apoio (R$)': Number(s.combustivel_apoio_valor || 0),
      'Total Combustível (R$)': Number(s.combustivel_total_valor || 0),
      'Despesa Operador (R$)': Number(s.despesa_operador || 0),
      'Total Despesas (R$)': Number(s.despesas_total || 0),
      'Lucro Líquido (R$)': Number(s.lucro_liquido || 0),
      'Margem de Lucro (%)': Number(s.margem_lucro || 0),
      'Status Operacional': s.status === 'FINALIZADO' ? 'Concluído' : 'Em Andamento',
      'Observações': s.observacoes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

  worksheet['!cols'] = [
    { wch: 4 },  // #
    { wch: 28 }, // Cliente
    { wch: 26 }, // Descrição
    { wch: 22 }, // Obra
    { wch: 28 }, // Máquina
    { wch: 22 }, // Operador
    { wch: 12 }, // Início
    { wch: 12 }, // Fim
    { wch: 16 }, // H. Inicial
    { wch: 16 }, // H. Final
    { wch: 16 }, // Horas
    { wch: 16 }, // R$/h
    { wch: 22 }, // Faturamento
    { wch: 22 }, // Adiantamento
    { wch: 20 }, // Saldo
    { wch: 16 }, // Status Pgto
    { wch: 16 }, // Diesel L
    { wch: 18 }, // Diesel R$
    { wch: 16 }, // Apoio L
    { wch: 18 }, // Apoio R$
    { wch: 20 }, // Total Diesel
    { wch: 20 }, // Desp Op
    { wch: 18 }, // Total Desp
    { wch: 18 }, // Lucro Liq
    { wch: 16 }, // Margem
    { wch: 18 }, // Status Op
    { wch: 30 }  // Observações
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Locação e Serviços');
  const baseNome = nomeArquivoCustom || 'Relatorio_Servicos_Horimetro';
  const dataHoje = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${baseNome}_${dataHoje}.xlsx`);
}
