import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DashboardMetrics } from '../types/dashboard.types';

export function exportDashboardPDF(metrics: DashboardMetrics, obraNome = 'Geral'): void {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('TerraGest - Relatório Executivo de Produtividade', 14, 18);

  doc.setFontSize(10);
  doc.text(`Obra/Canteiro: ${obraNome}`, 14, 25);
  doc.text(`Emissão: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

  const dadosKpis = [
    ['Horas Totais Apontadas', `${metrics.totalHoras.toFixed(1)} h`],
    ['Máquinas Ativas / Disponíveis', `${metrics.maquinasAtivas}`],
    ['Consumo Total de Diesel', `${metrics.combustivelTotalLitros.toFixed(1)} L`],
    ['Custo Operacional Estimado', `R$ ${metrics.custoEstimadoTotal.toFixed(2)}`]
  ];

  autoTable(doc, {
    startY: 36,
    head: [['Indicador Operacional', 'Valor Atual']],
    body: dadosKpis,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [5, 150, 105] }
  });

  const posY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  if (metrics.dadosGraficoHoras.length > 0) {
    const dadosGrafico = metrics.dadosGraficoHoras.map((p) => [p.data, `${p.horas} h`]);
    autoTable(doc, {
      startY: posY,
      head: [['Data de Operação', 'Horas Realizadas']],
      body: dadosGrafico,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 23, 42] }
    });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Nenhuma operação com horímetro registrada para o período selecionado.', 14, posY);
  }

  doc.save(`Relatorio_Executivo_TerraGest_${new Date().toISOString().slice(0, 10)}.pdf`);
}
