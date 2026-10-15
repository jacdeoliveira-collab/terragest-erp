import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AbastecimentoItem } from '../types/abastecimento.types';
import { desenharCabecalhoPdf } from './pdf/pdfEmpresaLayout';
import { aplicarRodapeTodasPaginas } from './pdf/pdfHeaderFooter';

export function exportarAbastecimentosPDF(abastecimentos: AbastecimentoItem[]): void {
  if (!abastecimentos || abastecimentos.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const dataHoje = new Date().toLocaleString('pt-BR');

  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO DE ABASTECIMENTOS & CONSUMO DE DIESEL',
    `Total de Registros: ${abastecimentos.length}  •  Emissão: ${dataHoje}`
  );

  // Totais Consolidados
  const totalLitros = abastecimentos.reduce((acc, a) => acc + (Number(a.quantidade_litros) || 0), 0);
  const totalValor = abastecimentos.reduce((acc, a) => acc + (Number(a.valor_total) || 0), 0);
  const precoMedioLitro = totalLitros > 0 ? totalValor / totalLitros : 0;

  // Caixa de Totais KPI (Topo)
  const boxWidth = doc.internal.pageSize.getWidth() - 28;
  doc.setDrawColor(209, 213, 219);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY, boxWidth, 16, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL REGISTROS', 22, startY + 5.5);
  doc.text('TOTAL LITROS DIESEL', 85, startY + 5.5);
  doc.text('TOTAL INVESTIDO (R$)', 155, startY + 5.5);
  doc.text('PREÇO MÉDIO POR LITRO', 225, startY + 5.5);

  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(`${abastecimentos.length} abastecimentos`, 22, startY + 11.5);
  doc.setTextColor(16, 185, 129);
  doc.text(`${totalLitros.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} L`, 85, startY + 11.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 155, startY + 11.5);
  doc.setTextColor(13, 148, 136);
  doc.text(`R$ ${precoMedioLitro.toFixed(2)} / L`, 225, startY + 11.5);

  const colunas = [
    'Data',
    'Máquina / Equipamento',
    'Operador / Motorista',
    'Horímetro / KM',
    'Litros',
    'Total (R$)',
    'Posto / Fornecedor',
    'Doc / NF / Ref'
  ];

  const linhas = abastecimentos.map((a) => {
    const maquina = a.maquina_codigo
      ? `${a.maquina_codigo} - ${a.maquina_nome || ''}`
      : (a.maquina_nome || '-');

    const horim = a.horimetro_momento
      ? (String(a.horimetro_momento).length > 5 ? `${a.horimetro_momento} km` : `${Number(a.horimetro_momento).toFixed(1)} h`)
      : '-';

    const refDoc = [
      a.numero_requisicao_nf ? `NF: ${a.numero_requisicao_nf}` : null,
      a.cliente_nome ? `Cli: ${a.cliente_nome}` : null
    ].filter(Boolean).join(' | ') || (a.origem || '-');

    return [
      a.data || '-',
      maquina,
      a.operador_nome || '-',
      horim,
      `${(Number(a.quantidade_litros) || 0).toFixed(1)} L`,
      `R$ ${(Number(a.valor_total) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      a.posto_fornecedor || a.origem || '-',
      refDoc
    ];
  });

  autoTable(doc, {
    startY: startY + 20,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, overflow: 'linebreak' },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 58, fontStyle: 'bold' },
      2: { cellWidth: 36 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 20, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 44 },
      7: { cellWidth: 43 }
    }
  });

  aplicarRodapeTodasPaginas(doc);
  doc.save(`abastecimentos_${new Date().toISOString().slice(0, 10)}.pdf`);
}
