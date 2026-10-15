import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ItemComissaoOperador } from '../types/rh.types';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';
import { desenharLogoNoPdf } from './pdf/pdfLogoHelper';
import { obterDadosAssinaturaEmpresa, desenharAssinaturaDigital } from './pdf/pdfAssinaturaEmpresaHelper';

export function gerarReciboPagamentoPDF(
  item: ItemComissaoOperador,
  periodo: { dataInicio: string; dataFim: string }
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const dadosEmp = obterDadosAssinaturaEmpresa(empresa);
  const razaoSocial = dadosEmp.razaoSocial;
  const cnpj = dadosEmp.cnpj;

  // Faixa topo decorativa
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 0, 210, 6, 'F');

  let textX = 14;
  if (desenharLogoNoPdf(doc, 14, 9, 36, 16, empresa)) {
    textX = 54;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textX, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const infoLinha = [cnpj, empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');
  if (infoLinha) doc.text(infoLinha, textX, 20);

  doc.setDrawColor(209, 213, 219);
  doc.line(14, 28, 196, 28);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RECIBO DE PAGAMENTO & APURAÇÃO DE HORAS DE OPERADOR', 14, 35);

  // Box Operador & Período
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 39, 182, 28, 2, 2, 'FD');

  const fData = (d: string) => d.split('-').reverse().join('/');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Operador / Colaborador:', 18, 46);
  doc.text('CPF / Documento:', 18, 52);
  doc.text('Função / Cargo:', 18, 58);
  doc.text('Período de Apuração:', 125, 46);
  doc.text('Boletins Emitidos (BDE):', 125, 52);
  doc.text('Data de Emissão:', 125, 58);

  doc.setFont('helvetica', 'normal');
  doc.text(item.operadorNome, 58, 46);
  doc.text(item.documento || 'Não informado', 58, 52);
  doc.text(item.cargo || 'Operador de Máquinas', 58, 58);
  doc.text(`${fData(periodo.dataInicio)} a ${fData(periodo.dataFim)}`, 160, 46);
  doc.text(`${item.quantidadeBoletins} boletim(ns)`, 164, 52);
  doc.text(new Date().toLocaleDateString('pt-BR'), 155, 58);

  // Tabela discriminada
  const colunas = ['Descrição da Apuração', 'Máquinas Operadas', 'Total de Horas', 'Valor / Hora', 'Total a Pagar'];
  const maquinasTexto = item.maquinasOperadas.length > 0 ? item.maquinasOperadas.join(', ') : 'Operação de Máquinas';

  autoTable(doc, {
    startY: 71,
    head: [colunas],
    body: [[
      'Horas produtivas registradas no BDE',
      maquinasTexto,
      `${item.totalHorasTrabalhadas.toFixed(2)} hrs`,
      `R$ ${item.valorHoraComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${item.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 55 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 27, halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 95) + 8;
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(120, finalY, 76, 16, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('TOTAL LÍQUIDO A RECEBER:', 124, finalY + 6);
  doc.setFontSize(13);
  doc.text(`R$ ${item.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 124, finalY + 13);

  // Termo e Assinaturas
  const posYAssinatura = finalY + 36;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(
    'Declaro para os devidos fins que recebi a importância líquida acima discriminada referente às horas trabalhadas no período indicado.',
    14,
    posYAssinatura - 8,
    { maxWidth: 182 }
  );

  doc.setDrawColor(156, 163, 175);
  desenharAssinaturaDigital(doc, 135, posYAssinatura + 4, 34, 12);
  doc.line(18, posYAssinatura + 18, 95, posYAssinatura + 18);
  doc.line(115, posYAssinatura + 18, 192, posYAssinatura + 18);

  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(55, 65, 81);
  doc.text(item.operadorNome, 18, posYAssinatura + 22);
  doc.text(razaoSocial, 115, posYAssinatura + 22);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura do Operador', 18, posYAssinatura + 26);
  if (dadosEmp.textoResponsavel) {
    doc.text(dadosEmp.textoResponsavel, 115, posYAssinatura + 25.5);
    doc.text('Responsável Financeiro / RH', 115, posYAssinatura + 29);
  } else {
    doc.text('Responsável Financeiro / RH', 115, posYAssinatura + 26);
  }

  desenharRodapeTerraGest(doc, 1, 1);

  const cleanNome = item.operadorNome.replace(/\s+/g, '_');
  doc.save(`Recibo_Comissao_${cleanNome}_${periodo.dataInicio}_a_${periodo.dataFim}.pdf`);
}
