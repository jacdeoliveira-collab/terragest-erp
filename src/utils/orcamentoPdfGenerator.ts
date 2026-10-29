import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Orcamento } from '../types/comercial.types';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { desenharBlocoPagamentoPixOrcamento } from './pdf/pdfOrcamentoPagamentoBlock';
import { desenharLogoNoPdf } from './pdf/pdfLogoHelper';
import { obterDadosAssinaturaEmpresa } from './pdf/pdfAssinaturaEmpresaHelper';
import { desenharFichaTecnicaMaquinaNoPdf } from './pdf/pdfOrcamentoFichaTecnica';
import { desenharTermosEAssinaturasOrcamento } from './pdf/pdfOrcamentoTermos';

export function gerarOrcamentoPDF(orc: Orcamento): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const dadosEmp = obterDadosAssinaturaEmpresa(empresa);
  const razaoSocial = dadosEmp.razaoSocial;
  const cnpj = dadosEmp.cnpj;
  const contato = [empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');

  // Faixa topo decorativa
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 6, 'F');
  const textX = desenharLogoNoPdf(doc, 14, 9, 36, 16, empresa) ? 54 : 14;

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
  doc.text('PROPOSTA COMERCIAL & LOCAÇÃO DE MÁQUINAS PESADAS', 14, 35);

  // Box Cliente & Proposta
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 39, 182, 21, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Cliente Contratante:', 18, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.cliente_nome || 'Cliente', 54, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Contato / Tel:', 18, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.cliente_telefone || 'Não informado', 42, 52);

  doc.setFont('helvetica', 'bold');
  doc.text('Proposta Nº:', 120, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.id ? `#ORC-${orc.id.slice(0, 6).toUpperCase()}` : '#ORC-001', 142, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Data Emissão:', 120, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.data_proposta || new Date().toISOString().slice(0, 10), 144, 52);

  doc.setFont('helvetica', 'bold');
  doc.text('Validade:', 168, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.validade_dias ? `${orc.validade_dias}d` : '15d', 183, 52);

  // Ficha técnica da máquina (se vinculada)
  const yAposFicha = desenharFichaTecnicaMaquinaNoPdf(doc, orc, 64);

  // Tabela Itens
  const descLinha = [
    orc.maquina_nome || 'Locação de Equipamento Linha Amarela',
    orc.maquina_modelo ? `Modelo: ${orc.maquina_modelo}` : null,
    orc.descricao_servico ? `Escopo: ${orc.descricao_servico}` : null
  ].filter(Boolean).join(' - ');

  const body = [
    [
      descLinha,
      `${orc.horas_estimadas || 0} h`,
      `R$ ${Number(orc.valor_hora || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'Horímetro',
      `R$ ${Number(orc.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]
  ];

  autoTable(doc, {
    startY: yAposFicha,
    head: [['Equipamento / Escopo dos Serviços', 'Horas Estimadas', 'Valor / Hora', 'Medição', 'Total Estimado']],
    body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.8, textColor: [31, 41, 55] },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' }
  });

  const lastTable = doc as unknown as { lastAutoTable: { finalY: number } };
  const finalY = lastTable.lastAutoTable.finalY || (yAposFicha + 25);

  // Box Totais
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(120, finalY + 3, 76, 12, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('TOTAL DA PROPOSTA:', 124, finalY + 11);
  doc.setFontSize(10.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`R$ ${Number(orc.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 160, finalY + 11);

  // Bloco de Pagamento, Prazo e Chave PIX
  const posPagY = desenharBlocoPagamentoPixOrcamento(doc, orc, finalY + 17);

  // Termos e Assinaturas
  desenharTermosEAssinaturasOrcamento(doc, orc, posPagY + 3, empresa, dadosEmp);

  const cleanName = (orc.cliente_nome || 'cliente').toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`proposta_comercial_${cleanName}.pdf`);
}
