import jsPDF from 'jspdf';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { numeroParaExtenso } from './numeroParaExtenso';
import { desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';
import { desenharLogoNoPdf } from './pdf/pdfLogoHelper';
import { obterDadosAssinaturaEmpresa, desenharAssinaturaDigital } from './pdf/pdfAssinaturaEmpresaHelper';

export interface ReciboPayload {
  numeroRecibo: string; valor: number; clienteNome: string;
  clienteDocumento?: string; clienteTelefone?: string;
  dataPagamento: string; formaPagamento: string; referente: string;
  observacoes?: string;
}

export function gerarReciboPDF(recibo: ReciboPayload): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'J A C DE OLIVEIRA';
  const cnpj = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
  const contato = [empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');

  // Moldura externa elegante
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.5);
  doc.roundedRect(12, 12, 186, 130, 3, 3, 'D');

  // Faixa topo esmeralda
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(12, 12, 186, 6, 2, 2, 'F');

  let textX = 18;
  if (desenharLogoNoPdf(doc, 16, 20, 24, 14, empresa)) {
    textX = 43;
  }

  // Cabeçalho da Empresa
  doc.setFontSize(textX > 20 ? 11 : 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textX, 25);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  const subTexto = [cnpj, contato].filter(Boolean).join(' | ');
  if (subTexto) doc.text(subTexto, textX, 29);
  if (empresa.endereco) doc.text(empresa.endereco, textX, 33);

  // Box do Número do Recibo e Valor
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(128, 20, 64, 16, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`RECIBO N.º ${recibo.numeroRecibo}`, 132, 26);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(
    `R$ ${Number(recibo.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    132,
    33
  );

  // Linha separadora
  doc.setDrawColor(229, 231, 235);
  doc.line(18, 38, 192, 38);

  // Texto do Recibo
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(31, 41, 55);

  const valorExtenso = numeroParaExtenso(Number(recibo.valor || 0));
  const docCliente = recibo.clienteDocumento ? `, inscrito(a) sob o CPF/CNPJ n.º ${recibo.clienteDocumento}` : '';

  const corpo = `Recebemos de ${recibo.clienteNome.toUpperCase()}${docCliente}, a importância de R$ ${Number(recibo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${valorExtenso}), correspondente a ${recibo.referente}.`;

  const linhasCorpo = doc.splitTextToSize(corpo, 172);
  doc.text(linhasCorpo, 18, 47);

  // Informações de Forma de Pagamento e Quitação
  const posYInfo = 47 + linhasCorpo.length * 5.5 + 4;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Forma de Pagamento:', 18, posYInfo);
  doc.setFont('helvetica', 'normal');
  doc.text(recibo.formaPagamento, 54, posYInfo);

  doc.setFont('helvetica', 'bold');
  doc.text('Data do Recebimento:', 18, posYInfo + 5);
  doc.setFont('helvetica', 'normal');
  const dataFormatada = recibo.dataPagamento
    ? recibo.dataPagamento.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');
  doc.text(dataFormatada, 54, posYInfo + 5);

  if (recibo.observacoes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 18, posYInfo + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(recibo.observacoes, 54, posYInfo + 10);
  }

  // Declaração de Quitação
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(107, 114, 128);
  doc.text(
    'Para maior clareza e comprovação, firmamos o presente recibo dando plena, geral e rasa quitação do valor recebido.',
    18,
    posYInfo + 18
  );

  // Assinatura Digital da Empresa (se cadastrada)
  const dadosEmp = obterDadosAssinaturaEmpresa(empresa);
  desenharAssinaturaDigital(doc, 130, posYInfo + 18, 36, 12, empresa);

  // Campo de Assinatura
  doc.setDrawColor(156, 163, 175);
  doc.line(110, posYInfo + 32, 186, posYInfo + 32);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(dadosEmp.razaoSocial.toUpperCase(), 148, posYInfo + 36, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  if (dadosEmp.textoResponsavel) {
    doc.text(dadosEmp.textoResponsavel, 148, posYInfo + 39.5, { align: 'center' });
    doc.text(cnpj || 'EMITENTE RESPONSÁVEL', 148, posYInfo + 43, { align: 'center' });
  } else {
    doc.text(cnpj || 'EMITENTE RESPONSÁVEL', 148, posYInfo + 40, { align: 'center' });
  }

  // Rodapé com propaganda e marca oficial TerraGest
  desenharRodapeTerraGest(doc, 1, 1);

  // Nome do arquivo e download
  const nomeClienteLimpo = (recibo.clienteNome || 'Cliente').replace(/\s+/g, '_');
  doc.save(`Recibo_${recibo.numeroRecibo}_${nomeClienteLimpo}.pdf`);
}
