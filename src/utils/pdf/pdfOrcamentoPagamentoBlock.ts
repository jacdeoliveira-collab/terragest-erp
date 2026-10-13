import type jsPDF from 'jspdf';
import type { Orcamento } from '../../types/comercial.types';

export interface DadosPagamentoPdf {
  prazo?: string;
  forma?: string;
  banco?: string;
  titular?: string;
  chavePix?: string;
}

/** Desenha o quadro de pagamento usando apenas dados reais; linhas sem dado são omitidas. */
export function desenharBlocoPagamentoPix(doc: jsPDF, dados: DadosPagamentoPdf, startY: number): number {
  const linhas: Array<[string, string]> = [];
  const condicao = [dados.prazo, dados.forma ? `(${dados.forma})` : ''].filter(Boolean).join(' ');
  if (condicao) linhas.push(['Condição / Prazo:', condicao]);
  const conta = [dados.banco, dados.titular ? `Titular: ${dados.titular}` : ''].filter(Boolean).join(' • ');
  if (conta) linhas.push(['Banco / Conta:', conta]);
  if (linhas.length === 0 && !dados.chavePix) return startY;

  const boxHeight = 12 + linhas.length * 5 + (dados.chavePix ? 7 : 0);
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, startY, 182, boxHeight, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text('DADOS BANCÁRIOS, PRAZO & CHAVE PIX PARA PAGAMENTO', 18, startY + 6);

  doc.setFontSize(7.5);
  let y = startY + 12;
  linhas.forEach(([rotulo, valor]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(rotulo, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.text(valor, 48, y);
    y += 5;
  });

  if (dados.chavePix) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(18, y - 2.5, 174, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`CHAVE PIX PARA TRANSFERÊNCIA: ${dados.chavePix}`, 22, y + 1);
  }
  return startY + boxHeight + 4;
}

export function desenharBlocoPagamentoPixOrcamento(doc: jsPDF, orc: Orcamento, startY: number): number {
  return desenharBlocoPagamentoPix(doc, {
    prazo: orc.prazo_descricao,
    forma: orc.forma_pagamento,
    banco: orc.conta_bancaria_banco,
    titular: orc.conta_bancaria_nome,
    chavePix: orc.conta_bancaria_pix || orc.chave_pix_manual
  }, startY);
}
