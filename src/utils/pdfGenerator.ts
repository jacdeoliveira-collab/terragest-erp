import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ExtratoBancoHoras } from '../types/rh.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function exportarEspelhoBancoHorasPDF(
  extratos: ExtratoBancoHoras[],
  periodoReferencia?: string
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const agora = new Date();
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mesAtualNome = meses[agora.getMonth()];
  const periodo = periodoReferencia || `${mesAtualNome} de ${agora.getFullYear()}`;

  const startY = desenharCabecalhoPdf(
    doc,
    'ESPELHO DE PONTO & BANCO DE HORAS CONSOLIDADO',
    `Mês de Referência: ${periodo}  •  Emitido em: ${agora.toLocaleString('pt-BR')}`
  );

  const colunas = [
    'Colaborador / Cargo',
    'Total Reg.',
    'Saldo',
    'H. Extras',
    'Custo Extra (R$)',
    'Assinatura do Colaborador'
  ];

  const linhas = extratos.map((item) => [
    `${item.nome}\n(${item.cargo})`,
    `${item.totalHorasMes.toFixed(1)}h`,
    item.saldoHoras > 0 ? `+${item.saldoHoras.toFixed(1)}h` : `${item.saldoHoras.toFixed(1)}h`,
    item.horasExtras > 0 ? `${item.horasExtras.toFixed(1)}h` : '0.0h',
    `R$ ${item.custoEstimadoExtra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ''
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      valign: 'middle',
      textColor: [31, 41, 55]
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 50, halign: 'left' },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 46, halign: 'center' }
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  const mesFormatado = mesAtualNome.toLowerCase();
  doc.save(`espelho_horas_${mesFormatado}.pdf`);
}
