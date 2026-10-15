import type jsPDF from 'jspdf';
import type { ServicoHorimetro } from '../../types/servicoHorimetro.types';
import { getEmpresaAtivaCache } from '../../services/empresaAtivaService';
import { SITE_TERRAGEST } from './pdfEmpresaLayout';
import { desenharLogoNoPdf } from './pdfLogoHelper';

export const TOTAL_PAGES_EXP = '{total_pages_count_string}';

export function desenharCabecalhoPrincipal(doc: jsPDF): void {
  const empresa = getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'TERRAGEST OPERAÇÕES DE MÁQUINAS PESADAS';
  const cnpj = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
  const contato = [empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 6, 'F');

  let textStartX = 14;
  if (desenharLogoNoPdf(doc, 14, 9, 36, 16, empresa)) {
    textStartX = 54;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textStartX, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const infoLinha = [cnpj, contato].filter(Boolean).join(' | ');
  if (infoLinha) doc.text(infoLinha, textStartX, 20);
  if (empresa.endereco) doc.text(empresa.endereco, textStartX, 24);

  doc.setDrawColor(209, 213, 219);
  doc.line(14, 28, 196, 28);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('BOLETIM DE MEDIÇÃO & PRESTAÇÃO DE SERVIÇOS POR HORÍMETRO', 14, 32);
}

export function desenharBoxIdentificacao(doc: jsPDF, servico: ServicoHorimetro): void {
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 35, 182, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Cliente Contratante:', 18, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(servico.cliente_nome || 'Cliente Geral', 52, 41);

  doc.setFont('helvetica', 'bold');
  doc.text('Máquina / Equipamento:', 18, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(servico.maquina_nome || 'Equipamento', 56, 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Operador Responsável:', 18, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(servico.operador_nome || 'Operador', 54, 51);

  doc.setFont('helvetica', 'bold');
  doc.text('Período do Serviço:', 18, 56);
  doc.setFont('helvetica', 'normal');
  const periodo = servico.data_fim ? `${servico.data_inicio} até ${servico.data_fim}` : `Início em ${servico.data_inicio} (Em aberto)`;
  doc.text(periodo, 48, 56);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 125, 41);
  if (servico.status === 'FINALIZADO') {
    doc.setTextColor(5, 150, 105);
    doc.text('CONCLUÍDO', 140, 41);
  } else {
    doc.setTextColor(217, 119, 6);
    doc.text('EM ANDAMENTO', 140, 41);
  }
}

import { TERRAGEST_LOGO_ICON_BASE64 } from './terragestLogoBase64';

export function adicionarRodape(doc: jsPDF, pageNumber: number): void {
  const pageHeight = 297;
  const lineY = pageHeight - 12;

  doc.setDrawColor(229, 231, 235);
  doc.line(14, lineY, 196, lineY);

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

  const paginacao = `Página ${pageNumber} de ${TOTAL_PAGES_EXP}`;
  doc.text(paginacao, 196, lineY + 4.8, { align: 'right' });
}

export function aplicarRodapeTodasPaginas(doc: jsPDF): void {
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    adicionarRodape(doc, i);
  }
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(TOTAL_PAGES_EXP);
  }
}

