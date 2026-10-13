import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Orcamento } from '../types/comercial.types';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { SITE_TERRAGEST } from './pdf/pdfEmpresaLayout';
import { desenharBlocoPagamentoPixOrcamento } from './pdf/pdfOrcamentoPagamentoBlock';
import { desenharLogoNoPdf } from './pdf/pdfLogoHelper';

export function gerarOrcamentoPDF(orc: Orcamento): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'TERRAGEST LOCAÇÃO DE MÁQUINAS';
  const cnpj = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
  const contato = [empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');

  // Faixa topo decorativa
  doc.setFillColor(16, 185, 129);
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
  const infoLinha = [cnpj, contato].filter(Boolean).join(' | ');
  if (infoLinha) doc.text(infoLinha, textX, 20);
  if (empresa.endereco) doc.text(empresa.endereco, textX, 24);

  doc.setDrawColor(209, 213, 219);
  doc.line(14, 28, 196, 28);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PROPOSTA COMERCIAL & ORÇAMENTO DE LOCAÇÃO', 14, 35);

  // Box Cliente & Proposta
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 39, 182, 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Cliente Contratante:', 18, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.cliente_nome || 'Cliente', 54, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Contato / Tel:', 18, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.cliente_telefone || 'Não informado', 42, 51);

  doc.setFont('helvetica', 'bold');
  doc.text('Proposta Nº:', 120, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.id ? `#ORC-${orc.id.slice(0, 6).toUpperCase()}` : '#ORC-001', 142, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Data Emissão:', 120, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.data_proposta || new Date().toISOString().slice(0, 10), 144, 51);

  doc.setFont('helvetica', 'bold');
  doc.text('Validade:', 120, 57);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.validade_dias ? `${orc.validade_dias} dias` : '15 dias', 136, 57);

  // Tabela Itens
  const body = [
    [
      orc.maquina_nome || orc.descricao_servico || 'Locação de Equipamento Linha Amarela',
      `${orc.horas_estimadas || 0} h`,
      `R$ ${Number(orc.valor_hora || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Incluso',
      `R$ ${Number(orc.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]
  ];

  autoTable(doc, {
    startY: 68,
    head: [['Equipamento / Máquina', 'Qtd Horas', 'Valor/Hora', 'Combustível', 'Subtotal']],
    body,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3, textColor: [31, 41, 55] },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' }
  });

  const lastTable = doc as unknown as { lastAutoTable: { finalY: number } };
  const finalY = lastTable.lastAutoTable.finalY || 120;

  // Box Totais
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(120, finalY + 4, 76, 14, 2, 2, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('TOTAL DA PROPOSTA:', 124, finalY + 13);
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text(`R$ ${Number(orc.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 160, finalY + 13);

  // Bloco de Pagamento, Prazo e Chave PIX
  const posPagY = desenharBlocoPagamentoPixOrcamento(doc, orc, finalY + 20);

  // Termos e Assinaturas
  const termosY = posPagY + 2;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('CONDIÇÕES GERAIS DE FORNECIMENTO E LOCAÇÃO:', 14, termosY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('1. Medição via horímetro do equipamento apontado em Boletim Diário (BDE).', 14, termosY + 4.5);
  doc.text('2. Abastecimento e operador conforme acordado entre as partes no contrato formal.', 14, termosY + 8.5);
  const assY = termosY + 18;
  doc.setFontSize(8);
  doc.text('___________________________________________', 20, assY);
  doc.text('Contratante: De Acordo / Aceite da Proposta', 20, assY + 4);
  doc.text('___________________________________________', 120, assY);
  doc.text(`${razaoSocial} / Locador`, 120, assY + 4);
  // Rodapé Propaganda TerraGest
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 285, 196, 285);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('TerraGest ERP Linha Amarela', 14, 290);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(` • ${SITE_TERRAGEST}`, 56, 290);

  const cleanName = (orc.cliente_nome || 'cliente').toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`proposta_comercial_${cleanName}.pdf`);
}
