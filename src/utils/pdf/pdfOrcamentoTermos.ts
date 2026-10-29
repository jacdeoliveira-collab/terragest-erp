import type jsPDF from 'jspdf';
import type { Orcamento } from '../../types/comercial.types';
import { desenharAssinaturaDigital } from './pdfAssinaturaEmpresaHelper';
import { desenharRodapeTerraGest } from './pdfEmpresaLayout';

export function desenharTermosEAssinaturasOrcamento(
  doc: jsPDF,
  orc: Orcamento,
  startY: number,
  empresa: any,
  dadosEmp: { razaoSocial: string; textoResponsavel?: string }
): void {
  // Termos e Condições Gerais
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('CONDIÇÕES GERAIS DE FORNECIMENTO E LOCAÇÃO:', 14, startY);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);

  const obs = orc.observacoes || '';
  const termoTexto1 = obs.includes('Termos:') ? obs : '1. Medição via horímetro do equipamento apontado em Boletim Diário (BDE).';
  doc.text(termoTexto1, 14, startY + 4.5);
  doc.text('2. Manutenção preventiva e lubrificação periódica por conta exclusiva da Locadora.', 14, startY + 8.5);
  doc.text('3. Operação e guarda do equipamento no canteiro sob responsabilidade conforme acordado.', 14, startY + 12.5);

  // Assinaturas
  const assY = startY + 23;
  desenharAssinaturaDigital(doc, 135, assY - 13, 38, 12, empresa);

  doc.setDrawColor(156, 163, 175);
  doc.line(20, assY, 90, assY);
  doc.line(120, assY, 190, assY);

  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  const clienteNome = orc.cliente_nome ? orc.cliente_nome.toUpperCase() : 'CONTRATANTE';
  doc.text(clienteNome, 55, assY + 4, { align: 'center' });
  doc.text('De Acordo / Aceite da Proposta', 55, assY + 7.5, { align: 'center' });

  doc.text(`${dadosEmp.razaoSocial} / Locador`, 155, assY + 4, { align: 'center' });
  if (dadosEmp.textoResponsavel) {
    doc.text(dadosEmp.textoResponsavel, 155, assY + 7.5, { align: 'center' });
  }

  desenharRodapeTerraGest(doc, 1, 1);
}
