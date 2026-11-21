import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ValeColaboradorItem } from '../types/valeRh.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

interface ResumoOperadorPdf {
  totalGanhos?: number;
  totalPago?: number;
  saldoAPagar?: number;
}

export function exportarValesOperadorPDF(
  operadorNome: string,
  vales: ValeColaboradorItem[],
  resumo?: ResumoOperadorPdf
): void {
  if (!vales || vales.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const totalVales = vales.reduce((acc, v) => acc + (Number(v.valor) || 0), 0);
  const totalGanhos = resumo?.totalGanhos ?? 0;
  const saldoAPagar = resumo?.saldoAPagar ?? 0;

  const subtitulo = resumo
    ? `Total Vales/Haveres: R$ ${totalVales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${vales.length} lanç.) | Ganhos: R$ ${totalGanhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Saldo a Pagar: R$ ${saldoAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Emissão: ${new Date().toLocaleDateString('pt-BR')}`
    : `Total Vales/Haveres: R$ ${totalVales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${vales.length} lanç.) | Emissão: ${new Date().toLocaleDateString('pt-BR')}`;

  const startY = desenharCabecalhoPdf(
    doc,
    `EXTRATO DE VALES & HAVERES: ${operadorNome.toUpperCase()}`,
    subtitulo
  );

  const colunas = ['Data', 'Valor', 'Forma', 'Caixa / Banco', 'Motivo / Observação', 'Status'];
  const linhas = vales.map((v) => [
    v.data || '-',
    `R$ ${(Number(v.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    v.formaPagamento || '-',
    v.contaBancariaNome || '-',
    v.observacao || '-',
    v.status || 'PAGO'
  ]);

  linhas.push([
    'TOTAL',
    `R$ ${totalVales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    '',
    '',
    `${vales.length} vale(s) / haver(es) registrado(s)`,
    ''
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.2 },
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === linhas.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [239, 246, 255];
        hookData.cell.styles.textColor = [30, 58, 138];
      }
    }
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    desenharRodapeTerraGest(doc, p, totalPages);
  }

  const nomeLimpo = operadorNome.replace(/\s+/g, '_');
  doc.save(`Extrato_Vales_Haveres_${nomeLimpo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
