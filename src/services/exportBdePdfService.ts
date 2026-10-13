import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DailyBulletin } from '../types/bde.types';
import type { TenantMaster } from '../types/tenant.types';
import { getEmpresaAtivaCache } from './empresaAtivaService';
import { SITE_TERRAGEST } from '../utils/pdf/pdfEmpresaLayout';
import { desenharLogoNoPdf, obterLogoEmpresa } from '../utils/pdf/pdfLogoHelper';

export interface ExportBdePdfOptions {
  bde: DailyBulletin;
  equipamentoNome?: string;
  operadorNome?: string;
  empresa?: TenantMaster | null;
  obraNome?: string;
}

export function exportBdePdf({ bde, equipamentoNome, operadorNome, empresa: empParam, obraNome }: ExportBdePdfOptions): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = empParam || getEmpresaAtivaCache() || {};
  const razaoSocial = empresa?.razao_social || empresa?.nome || 'TERRAGEST ENGENHARIA & CONSTRUÇÕES';
  const cnpj = empresa?.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
  const contato = [empresa?.contato_telefone, empresa?.contato_email].filter(Boolean).join(' • ');

  // 1. Cabeçalho Corporativo
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 26, 'F');

  let textX = 14;
  if (obterLogoEmpresa(empresa)) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, 4, 34, 18, 1, 1, 'F');
    if (desenharLogoNoPdf(doc, 13, 5, 32, 16, empresa)) {
      textX = 50;
    }
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(razaoSocial.toUpperCase(), textX, 10);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const infoLinha = [cnpj, contato].filter(Boolean).join('  |  ');
  if (infoLinha) doc.text(infoLinha, textX, 15);
  if (empresa?.endereco) doc.text(empresa.endereco, textX, 20);

  // 2. Título do Documento
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BOLETIM DIÁRIO DE EQUIPAMENTO - BDE', 14, 34);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Identificador: #${bde.id.slice(0, 8).toUpperCase()}  •  Data Operacional: ${bde.date}`, 14, 39);

  // 3. Informações da Máquina, Operador e Obra
  autoTable(doc, {
    startY: 43,
    head: [['DADOS DO EQUIPAMENTO & OPERAÇÃO', 'DADOS DO OPERADOR & LOCAL']],
    body: [
      [
        `Equipamento: ${equipamentoNome || bde.equipment_code || bde.equipment_name || 'N/A'}\nStatus: ${bde.status}`,
        `Operador: ${operadorNome || bde.operador_nome || bde.operator_name || 'N/A'}\nObra: ${obraNome || bde.work_location || 'Canteiro Geral'}`
      ],
      [
        `Cliente: ${bde.client_name || 'Geral'}\nLocal de Aplicação: ${bde.work_location || 'Frente de Obra'}`,
        `Jornada: ${bde.hora_inicio_jornada || '--:--'} às ${bde.hora_fim_jornada || '--:--'}\nCombustível: ${bde.fuel_liters ? `${bde.fuel_liters} L` : 'Nenhum'}`
      ]
    ],
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
  });

  const lastTable = doc as unknown as { lastAutoTable: { finalY: number } };
  const finalY1 = lastTable.lastAutoTable.finalY || 75;

  autoTable(doc, {
    startY: finalY1 + 3,
    head: [['Horímetro Inicial', 'Horímetro Final', 'Total Horas Máquina', 'Status Ociosidade']],
    body: [[
      `${Number(bde.initial_hourmeter).toFixed(1)} h`,
      `${Number(bde.final_hourmeter).toFixed(1)} h`,
      `${Number(bde.total_hours).toFixed(1)} h`,
      bde.motivo_parada ? `Parada: ${bde.motivo_parada}` : 'Operação Normal'
    ]],
    theme: 'grid',
    styles: { fontSize: 8.5, halign: 'center', cellPadding: 3 },
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' }
  });

  const finalY2 = lastTable.lastAutoTable.finalY || 110;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DESCRIÇÃO DOS SERVIÇOS EXECUTADOS:', 14, finalY2 + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const desc = bde.service_description || 'Serviços operacionais rotineiros de terraplenagem e movimentação.';
  const splitDesc = doc.splitTextToSize(desc, 182);
  doc.text(splitDesc, 14, finalY2 + 12);

  let nextY = finalY2 + 14 + (splitDesc.length * 4);
  if (bde.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Observações Adicionais:', 14, nextY);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(bde.notes, 182);
    doc.text(splitNotes, 14, nextY + 4);
    nextY += (splitNotes.length * 4) + 5;
  }

  // Rodapé Assinatura Eletrônica
  const boxY = Math.max(nextY + 4, 238);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, boxY, 182, 24, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ASSINATURA ELETRÔNICA & CONFORMIDADE OPERACIONAL (PIN)', 18, boxY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.text(`Operador: ${operadorNome || bde.operador_nome || bde.operator_name || 'Validado via PIN'}  •  Emitido em: ${new Date().toLocaleString('pt-BR')}`, 18, boxY + 13);
  doc.text('Documento com fé pública operacional gerado pelo TerraGest ERP.', 18, boxY + 18);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 285, 196, 285);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('TerraGest ERP Linha Amarela', 14, 290);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(` • ${SITE_TERRAGEST}`, 56, 290);

  const safeCod = (bde.equipment_code || 'MAQ').replace(/\s+/g, '_');
  doc.save(`BDE_${bde.date}_${safeCod}.pdf`);
}
