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

export function exportarRemuneracoesOperadorPDF(
  operadorNome: string,
  itens: FuncionarioRemuneracaoItem[]
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const totalGanho = itens.reduce((acc, i) => acc + i.totalGanho, 0);
  const totalPago = itens.reduce((acc, i) => acc + i.valorAdiantado, 0);
  const totalSaldo = itens.reduce((acc, i) => acc + i.saldoRestante, 0);

  const startY = desenharCabecalhoPdf(
    doc,
    `EXTRATO FINANCEIRO DO OPERADOR: ${operadorNome.toUpperCase()}`,
    `Ganhos: R$ ${totalGanho.toFixed(2)} | Já Pago: R$ ${totalPago.toFixed(2)} | Saldo: R$ ${totalSaldo.toFixed(2)} | Emissão: ${new Date().toLocaleDateString('pt-BR')}`
  );

  const colunas = ['Data', 'Cliente / Serviço', 'Máquina', 'Horas', 'R$/h', 'Ganho Total', 'Já Pago', 'Saldo', 'Status'];
  const linhas = itens.map((i) => [
    i.data || '-',
    i.clienteNome,
    i.maquinaNome,
    `${i.horasTrabalhadas.toFixed(1)}h`,
    `R$ ${i.valorHora.toFixed(2)}`,
    `R$ ${i.totalGanho.toFixed(2)}`,
    `R$ ${i.valorAdiantado.toFixed(2)}`,
    `R$ ${i.saldoRestante.toFixed(2)}`,
    i.status === 'PAGO' ? 'PAGO' : 'PENDENTE'
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  const nomeLimpo = operadorNome.replace(/\s+/g, '_');
  doc.save(`Extrato_${nomeLimpo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

