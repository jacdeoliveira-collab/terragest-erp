import * as XLSX from 'xlsx';
import type { AbastecimentoItem } from '../types/abastecimento.types';

export function exportarAbastecimentosExcel(abastecimentos: AbastecimentoItem[]): void {
  if (!abastecimentos || abastecimentos.length === 0) return;

  const dadosFormatados = abastecimentos.map((a, idx) => {
    const maquina = a.maquina_codigo
      ? `${a.maquina_codigo} - ${a.maquina_nome || ''}`
      : (a.maquina_nome || '-');

    const valorUnit = a.valor_unitario
      ? Number(a.valor_unitario)
      : (a.quantidade_litros && a.valor_total ? Number((a.valor_total / a.quantidade_litros).toFixed(2)) : undefined);

    return {
      '#': idx + 1,
      'Data': a.data || '',
      'Equipamento / Máquina': maquina,
      'Código': a.maquina_codigo || '',
      'Operador / Motorista': a.operador_nome || '-',
      'Horímetro / KM': a.horimetro_momento ? Number(a.horimetro_momento) : '',
      'Combustível': a.tipo_combustivel || 'DIESEL_S10',
      'Quantidade (L)': Number(a.quantidade_litros || 0),
      'Valor Unitário (R$/L)': valorUnit || '',
      'Valor Total (R$)': Number(a.valor_total || 0),
      'Posto / Fornecedor': a.posto_fornecedor || a.origem || '-',
      'Nº Cupom / NF': a.numero_requisicao_nf || '-',
      'Cliente / Serviço': a.cliente_nome || (a.servico_id ? `Serviço #${a.servico_id.slice(0, 8)}` : '-')
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

  // Definir larguras de colunas ideais
  worksheet['!cols'] = [
    { wch: 4 },  // #
    { wch: 12 }, // Data
    { wch: 32 }, // Equipamento
    { wch: 12 }, // Código
    { wch: 24 }, // Operador
    { wch: 15 }, // Horímetro
    { wch: 15 }, // Combustível
    { wch: 15 }, // Quantidade
    { wch: 20 }, // Unitário
    { wch: 18 }, // Total
    { wch: 30 }, // Posto
    { wch: 20 }, // Cupom/NF
    { wch: 25 }, // Cliente/Serviço
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Abastecimentos');
  const dataHoje = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Abastecimentos_Diesel_${dataHoje}.xlsx`);
}
