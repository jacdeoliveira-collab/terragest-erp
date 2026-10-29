import type jsPDF from 'jspdf';
import { desenharImagemProporcional } from './pdfImageHelper';

export function desenharCardFoto(
  doc: jsPDF,
  imgBase64: string,
  titulo: string,
  legenda: string,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  try {
    doc.setDrawColor(209, 213, 219);
    doc.setFillColor(248, 250, 252);
    doc.rect(x, y, w, h + 8, 'FD');
    desenharImagemProporcional(doc, imgBase64, x + 1, y + 1, w - 2, h - 2);

    doc.setFillColor(243, 244, 246);
    doc.rect(x, y + h, w, 8, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.line(x, y + h, x + w, y + h);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(titulo, x + 2, y + h + 3.5);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const splitLegenda = doc.splitTextToSize(legenda, w - 4);
    doc.text(splitLegenda[0] || '', x + 2, y + h + 6.8);
  } catch (e) {
    console.warn('Erro ao desenhar card de foto no PDF:', e);
  }
}
