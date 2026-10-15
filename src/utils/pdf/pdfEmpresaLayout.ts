import type jsPDF from 'jspdf';
import type { TenantMaster } from '../../types/tenant.types';
import { getEmpresaAtivaCache } from '../../services/empresaAtivaService';
import { desenharLogoNoPdf } from './pdfLogoHelper';

export const SITE_TERRAGEST = 'https://terragest.agrodronesma.com.br/';

export function desenharCabecalhoPdf(
  doc: jsPDF,
  tituloDocumento: string,
  subtitulo?: string,
  empresaParam?: Partial<TenantMaster> | null
): number {
  const empresa = empresaParam || getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'CONSTRUTORA & LOCAÇÃO DE MÁQUINAS';
  const cnpj = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
  const contato = [empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');

  // Faixa decorativa topo
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 5, 'F');

  let textStartX = 14;
  let startContentY = 32;

  if (desenharLogoNoPdf(doc, 14, 9, 36, 16, empresa)) {
    textStartX = 54;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textStartX, 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const infoLinha1 = [cnpj, contato].filter(Boolean).join('  |  ');
  if (infoLinha1) doc.text(infoLinha1, textStartX, 19);
  if (empresa.endereco) doc.text(empresa.endereco, textStartX, 23);

  doc.setDrawColor(229, 231, 235);
  doc.line(14, 27, pageWidth - 14, 27);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(tituloDocumento.toUpperCase(), 14, 34);

  if (subtitulo) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(subtitulo, 14, 39);
    startContentY = 44;
  } else {
    startContentY = 38;
  }

  return startContentY;
}

import { TERRAGEST_LOGO_ICON_BASE64 } from './terragestLogoBase64';

export function desenharRodapeTerraGest(doc: jsPDF, pageNumber: number = 1, totalPages?: number | string): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const lineY = pageHeight - 12;

  doc.setDrawColor(226, 232, 240);
  doc.line(14, lineY, pageWidth - 14, lineY);

  try {
    doc.addImage(TERRAGEST_LOGO_ICON_BASE64, 'PNG', 14, lineY + 1.2, 5, 5);
  } catch {}

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('TerraGest ERP Linha Amarela', 20.5, lineY + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(` • ${SITE_TERRAGEST}`, 62.5, lineY + 4.8);

  const paginacao = totalPages ? `Página ${pageNumber} de ${totalPages}` : `Página ${pageNumber}`;
  doc.text(paginacao, pageWidth - 14, lineY + 4.8, { align: 'right' });
}
