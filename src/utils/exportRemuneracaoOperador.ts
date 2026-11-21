import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FuncionarioRemuneracaoItem } from '../types/funcionarioHistorico.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function exportarRemuneracoesOperadorExcel(
  operadorNome: string,
  itens: FuncionarioRemuneracaoItem[]
): void {
  if (!itens || itens.length === 0) return;

  const dados = itens.map((item, idx) => ({
    '#': idx + 1,
    'Data': item.data || '-',
    'Cliente / Serviço': item.clienteNome,
    'Máquina': item.maquinaNome,
    'Horas Trabalhadas': Number(item.horasTrabalhadas.toFixed(1)),
    'Valor Hora (R$)': Number(item.valorHora.toFixed(2)),
    'Ganho Total (R$)': Number(item.totalGanho.toFixed(2)),
    'Já Pago / Vales (R$)': Number(item.valorAdiantado.toFixed(2)),
    'Saldo a Pagar (R$)': Number(item.saldoRestante.toFixed(2)),
    'Status': item.status === 'PAGO' ? 'PAGO' : 'PENDENTE'
  }));

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Extrato Financeiro');
  const nomeLimpo = operadorNome.replace(/\s+/g, '_');
  XLSX.writeFile(wb, `Extrato_${nomeLimpo}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export interface ResumoFinanceiroOperadorPdf {
  totalVales?: number;
}

const fmtBRL = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function exportarRemuneracoesOperadorPDF(
  operadorNome: string,
  itens: FuncionarioRemuneracaoItem[],
  resumo?: ResumoFinanceiroOperadorPdf
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const totalHoras = itens.reduce((acc, i) => acc + i.horasTrabalhadas, 0);
  const totalGanho = itens.reduce((acc, i) => acc + i.totalGanho, 0);
  const pagoServicos = itens.reduce((acc, i) => acc + i.valorAdiantado, 0);
  const totalVales = resumo?.totalVales ?? 0;
  const totalPago = pagoServicos + totalVales;
  const totalSaldo = Math.max(0, totalGanho - totalPago);

  const startY = desenharCabecalhoPdf(
    doc,
    `EXTRATO FINANCEIRO DO OPERADOR: ${operadorNome.toUpperCase()}`,
    `Ganhos: ${fmtBRL(totalGanho)} | Já Pago / Vales: ${fmtBRL(totalPago)} | Saldo a Pagar: ${fmtBRL(totalSaldo)} | Emissão: ${new Date().toLocaleDateString('pt-BR')}`
  );

  const colunas = ['Data', 'Cliente / Serviço', 'Máquina', 'Horas', 'R$/h', 'Ganho Total', 'Já Pago', 'Saldo', 'Status'];
  const linhas = itens.map((i) => [
    i.data || '-',
    i.clienteNome,
    i.maquinaNome,
    `${i.horasTrabalhadas.toFixed(1)}h`,
    fmtBRL(i.valorHora),
    fmtBRL(i.totalGanho),
    fmtBRL(i.valorAdiantado),
    fmtBRL(i.saldoRestante),
    i.status === 'PAGO' ? 'PAGO' : 'PENDENTE'
  ]);

  linhas.push([
    'RESUMO',
    totalVales > 0 ? `Inclui Vales / Haveres: ${fmtBRL(totalVales)}` : 'Totais Consolidados',
    `${itens.length} serviço(s)`,
    `${totalHoras.toFixed(1)}h`,
    '-',
    fmtBRL(totalGanho),
    fmtBRL(totalPago),
    fmtBRL(totalSaldo),
    totalSaldo <= 0.01 && totalGanho > 0 ? 'QUITADO' : 'EM ABERTO'
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === linhas.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [236, 253, 245];
        hookData.cell.styles.textColor = [6, 95, 70];
      }
    }
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    desenharRodapeTerraGest(doc, p, totalPages);
  }
  const nomeLimpo = operadorNome.replace(/\s+/g, '_');
  doc.save(`Extrato_${nomeLimpo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

