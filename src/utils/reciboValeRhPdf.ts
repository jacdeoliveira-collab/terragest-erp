import jsPDF from 'jspdf';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { numeroParaExtenso } from './numeroParaExtenso';
import { desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';
import { desenharLogoNoPdf } from './pdf/pdfLogoHelper';
import { obterDadosAssinaturaEmpresa, desenharAssinaturaDigital } from './pdf/pdfAssinaturaEmpresaHelper';

export interface ReciboValeRhPayload {
  colaboradorNome: string;
  colaboradorCargo?: string;
  colaboradorCpf?: string;
  valorVale: number;
  dataVale: string;
  formaPagamento: string;
  motivo?: string;
}

export function gerarReciboValeRhPDF(payload: ReciboValeRhPayload): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'TERRAGEST LOCAÇÕES';
  const cnpj = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';

  // Moldura externa
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.5);
  doc.roundedRect(12, 12, 186, 128, 3, 3, 'D');

  // Faixa topo esmeralda/verde (padrão RH oficial)
  doc.setFillColor(5, 150, 105);
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
  doc.setDrawColor(5, 150, 105);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(120, 20, 72, 16, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text('RECIBO DE ADIANTAMENTO / VALE', 123, 25);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 78, 59);
  doc.text(`R$ ${Number(payload.valorVale || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 123, 33);

  // Linha divisória
  doc.setDrawColor(229, 231, 235);
  doc.line(18, 39, 192, 39);

  // Texto declaratório
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);

  const valorExtenso = numeroParaExtenso(Number(payload.valorVale || 0));
  const docCpf = payload.colaboradorCpf ? ` (CPF: ${payload.colaboradorCpf})` : '';
  const cargoStr = payload.colaboradorCargo ? `, função ${payload.colaboradorCargo}` : '';
  const formaStr = payload.formaPagamento ? ` via ${payload.formaPagamento.toUpperCase()}` : '';
  const motivoStr = payload.motivo ? ` referente a: ${payload.motivo}.` : '.';

  const declaracao = `Eu, ${payload.colaboradorNome.toUpperCase()}${docCpf}${cargoStr}, declaro ter recebido da empresa ${razaoSocial.toUpperCase()} a quantia líquida de R$ ${Number(payload.valorVale).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${valorExtenso})${formaStr}, a título de ADIANTAMENTO / HAVER SALARIAL${motivoStr}`;

  const linhasCorpo = doc.splitTextToSize(declaracao, 172);
  doc.text(linhasCorpo, 18, 48);

  const avisoDesconto = 'Autorizo expressamente o abatimento do referido valor no próximo fechamento de folha de pagamento, comissões de horímetro ou acerto final de contas.';
  const linhasDesconto = doc.splitTextToSize(avisoDesconto, 172);
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  doc.text(linhasDesconto, 18, 48 + linhasCorpo.length * 5 + 4);

  // Data
  const posYInfo = 48 + (linhasCorpo.length + linhasDesconto.length) * 5 + 8;
  const dataFormatada = payload.dataVale
    ? payload.dataVale.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(`Data do Pagamento do Adiantamento: ${dataFormatada}`, 18, posYInfo);

  // Assinaturas
  const posYAss = 118;
  doc.setDrawColor(156, 163, 175);
  doc.setLineWidth(0.5);

  // Linha 1: Colaborador
  doc.line(22, posYAss, 95, posYAss);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(payload.colaboradorNome.toUpperCase(), 22, posYAss + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Assinatura do Colaborador / Beneficiário', 22, posYAss + 8);

  // Linha 2: Responsável RH
  const dadosEmp = obterDadosAssinaturaEmpresa(empresa);
  desenharAssinaturaDigital(doc, 135, posYAss - 14, 34, 12, empresa);
  doc.line(115, posYAss, 188, posYAss);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(dadosEmp.razaoSocial.toUpperCase(), 115, posYAss + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Departamento de Recursos Humanos (RH)', 115, posYAss + 8);

  desenharRodapeTerraGest(doc, 1, 1);

  const nomeSanitizado = payload.colaboradorNome.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Recibo_Vale_${nomeSanitizado}_${dataFormatada.replace(/\//g, '-')}.pdf`);
}

