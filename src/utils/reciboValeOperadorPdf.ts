import jsPDF from 'jspdf';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { numeroParaExtenso } from './numeroParaExtenso';
import { desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';
import { desenharLogoNoPdf } from './pdf/pdfLogoHelper';
import { obterDadosAssinaturaEmpresa, desenharAssinaturaDigital } from './pdf/pdfAssinaturaEmpresaHelper';

export interface ReciboValeOperadorPayload {
  operadorNome: string;
  operadorDocumento?: string;
  maquinaNome: string;
  valorVale: number;
  dataVale: string;
  servicoId?: string;
  observacoes?: string;
}

export function gerarReciboValeOperadorPDF(payload: ReciboValeOperadorPayload): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'TERRAGEST LOCAÇÕES';
  const cnpj = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';

  // Moldura externa
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.5);
  doc.roundedRect(12, 12, 186, 125, 3, 3, 'D');

  // Faixa topo âmbar/dourada (estilo de adiantamento operacional)
  doc.setFillColor(217, 119, 6);
  doc.roundedRect(12, 12, 186, 6, 2, 2, 'F');

  let textX = 18;
  if (desenharLogoNoPdf(doc, 16, 20, 24, 14, empresa)) {
    textX = 43;
  }

  // Cabeçalho da Empresa
  doc.setFontSize(textX > 20 ? 10.5 : 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textX, 25);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  if (cnpj) doc.text(cnpj, textX, 29);

  // Box de Valor
  doc.setDrawColor(217, 119, 6);
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(125, 20, 67, 16, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('VALE / ADIANTAMENTO', 128, 25);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text(`R$ ${Number(payload.valorVale || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 128, 33);

  // Linha divisória
  doc.setDrawColor(229, 231, 235);
  doc.line(18, 38, 192, 38);

  // Texto declaratório
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);

  const valorExtenso = numeroParaExtenso(Number(payload.valorVale || 0));
  const docOp = payload.operadorDocumento ? ` (CPF/Documento: ${payload.operadorDocumento})` : '';

  const declaracao = `Eu, ${payload.operadorNome.toUpperCase()}${docOp}, declaro ter recebido da empresa ${razaoSocial.toUpperCase()} a importância líquida de R$ ${Number(payload.valorVale).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${valorExtenso}), a título de VALE / ADIANTAMENTO de horas operacionais na máquina ${payload.maquinaNome}.`;

  const linhasCorpo = doc.splitTextToSize(declaracao, 172);
  doc.text(linhasCorpo, 18, 47);

  const avisoDesconto = 'Autorizo expressamente o desconto do referido valor na apuração do acerto/fechamento das horas trabalhadas ou comissão devida.';
  const linhasDesconto = doc.splitTextToSize(avisoDesconto, 172);
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  doc.text(linhasDesconto, 18, 47 + linhasCorpo.length * 5 + 4);

  // Data
  const posYInfo = 47 + (linhasCorpo.length + linhasDesconto.length) * 5 + 8;
  const dataFormatada = payload.dataVale
    ? payload.dataVale.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`Data da Liberação do Vale: ${dataFormatada}`, 18, posYInfo);

  // Assinaturas
  const posYAss = 115;
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.5);

  // Linha 1: Operador
  doc.line(22, posYAss, 95, posYAss);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(payload.operadorNome.toUpperCase(), 22, posYAss + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Assinatura do Operador', 22, posYAss + 8);

  // Linha 2: Responsável / Empresa
  const dadosEmp = obterDadosAssinaturaEmpresa(empresa);
  desenharAssinaturaDigital(doc, 135, posYAss - 14, 34, 12, empresa);
  doc.line(115, posYAss, 188, posYAss);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(dadosEmp.razaoSocial.toUpperCase(), 115, posYAss + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  if (dadosEmp.textoResponsavel) {
    doc.text(dadosEmp.textoResponsavel, 115, posYAss + 7.5);
    doc.text('Responsável pela Liberação', 115, posYAss + 11);
  } else {
    doc.text('Responsável pela Liberação', 115, posYAss + 8);
  }

  desenharRodapeTerraGest(doc, 1, 1);

  // Download do PDF
  const nomeSanitizado = payload.operadorNome.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Recibo_Vale_${nomeSanitizado}_${dataFormatada.replace(/\//g, '-')}.pdf`);
}
