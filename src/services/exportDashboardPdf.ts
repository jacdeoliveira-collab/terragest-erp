import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DashboardMetrics } from '../types/dashboard.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from '../utils/pdf/pdfEmpresaLayout';

export function exportDashboardPDF(metrics: DashboardMetrics, obraNome = 'Geral'): void {
  const doc = new jsPDF();
  
  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO EXECUTIVO DE PRODUTIVIDADE',
    `Obra / Canteiro: ${obraNome}  •  Emissão: ${new Date().toLocaleString('pt-BR')}`
  );

  const dadosKpis = [
    ['Horas Totais Apontadas', `${metrics.totalHoras.toFixed(1)} h`],
    ['Máquinas Ativas / Disponíveis', `${metrics.maquinasAtivas}`],
    ['Consumo Total de Diesel', `${metrics.combustivelTotalLitros.toFixed(1)} L`],
    ['Custo Operacional Estimado', `R$ ${metrics.custoEstimadoTotal.toFixed(2)}`]
  ];

  autoTable(doc, {
    startY,
    head: [['Indicador Operacional', 'Valor Atual']],
    body: dadosKpis,
    styles: { fontSize: 9.5, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129] }
  });

  const posY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  if (metrics.dadosGraficoHoras.length > 0) {
    const dadosGrafico = metrics.dadosGraficoHoras.map((p) => [p.data, `${p.horas} h`]);
    autoTable(doc, {
      startY: posY,
      head: [['Data de Operação', 'Horas Realizadas']],
      body: dadosGrafico,
      styles: { fontSize: 8.5, cellPadding: 2.5 },
      headStyles: { fillColor: [15, 23, 42] }
    });
  } else {
    doc.setFontSize(8.5);
    doc.setTextColor(120);
    doc.text('Nenhuma operação com horímetro registrada para o período selecionado.', 14, posY);
  }

  desenharRodapeTerraGest(doc, 1, 1);
  doc.save(`Relatorio_Executivo_${new Date().toISOString().slice(0, 10)}.pdf`);
}
