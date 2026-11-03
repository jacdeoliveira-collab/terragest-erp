import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MedicaoItem } from '../types/faturamento.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function exportarContasReceberExcel(titulos: MedicaoItem[]): void {
  if (!titulos || titulos.length === 0) return;

  const dados = titulos.map((t, idx) => {
    const isPago = t.status_pagamento === 'PAGO';
    const saldo = t.saldo_restante !== undefined ? Number(t.saldo_restante) : (isPago ? 0 : Number(t.valor_total));
    return {
      '#': idx + 1,
      'Nº Fatura / BM': t.numero_medicao || '-',
      'Cliente': t.cliente_nome || '-',
      'Obra / Canteiro': t.obra_nome || '-',
      'Mês Ref.': t.competencia || '-',
      'Emissão': t.data_emissao || '-',
      'Vencimento': t.data_vencimento,
      'Valor Total (R$)': Number(t.valor_total || 0),
      'Já Recebido (R$)': Number(t.valor_adiantamento || (isPago ? t.valor_total : 0)),
      'Saldo a Receber (R$)': saldo,
      'Status': isPago ? 'PAGO' : (t.status_pagamento === 'PAGO_PARCIAL' ? 'PARCIAL' : 'PENDENTE')
    };
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contas a Receber');
  XLSX.writeFile(wb, `Contas_Receber_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportarContasReceberPDF(titulos: MedicaoItem[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const totalGeral = titulos.reduce((acc, t) => acc + Number(t.valor_total || 0), 0);
  const totalRecebido = titulos.reduce((acc, t) => {
    if (t.status_pagamento === 'PAGO') return acc + Number(t.valor_total);
    return acc + Number(t.valor_adiantamento || 0);
  }, 0);
  const saldoTotal = Math.max(0, totalGeral - totalRecebido);

  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO DE CONTAS A RECEBER & FATURAMENTO',
    `Total: R$ ${totalGeral.toFixed(2)} | Recebido: R$ ${totalRecebido.toFixed(2)} | Saldo em Aberto: R$ ${saldoTotal.toFixed(2)}`
  );

  const colunas = ['Nº Medição', 'Cliente', 'Obra', 'Competência', 'Vencimento', 'Total (R$)', 'Recebido (R$)', 'Saldo (R$)', 'Status'];
  const linhas: string[][] = titulos.map((t) => {
    const isPago = t.status_pagamento === 'PAGO';
    const saldo = t.saldo_restante !== undefined ? Number(t.saldo_restante) : (isPago ? 0 : Number(t.valor_total));
    const recebido = Number(t.valor_adiantamento || (isPago ? t.valor_total : 0));
    return [
      t.numero_medicao || '-',
      t.cliente_nome || '-',
      t.obra_nome || '-',
      t.competencia || '-',
      t.data_vencimento ? new Date(t.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR') : '-',
      `R$ ${Number(t.valor_total || 0).toFixed(2)}`,
      `R$ ${recebido.toFixed(2)}`,
      `R$ ${saldo.toFixed(2)}`,
      isPago ? 'PAGO' : (t.status_pagamento === 'PAGO_PARCIAL' ? 'PARCIAL' : 'PENDENTE')
    ];
  });

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
  doc.save(`Contas_Receber_${new Date().toISOString().slice(0, 10)}.pdf`);
}
