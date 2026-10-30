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
  const det = orc.detalhes_proposta;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('MATRIZ DE RESPONSABILIDADES E CONDIÇÕES GERAIS DE LOCAÇÃO:', 14, startY);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);

  const opResp = det?.operador_incluso !== false ? 'Incluso pela Locadora' : 'Por conta do Contratante';
  const dieselResp = det?.combustivel_termo || 'Por conta do Contratante na obra';
  const pranchaResp = det?.mobilizacao_termo || 'Por conta do Contratante';
  const alimResp = det?.alimentacao_hospedagem_termo || 'Por conta do Contratante no local da obra';
  const guardaResp = det?.guarda_vigilancia_termo || 'Responsabilidade integral do Contratante no canteiro';

  doc.text(`1. Operador: ${opResp} | Abastecimento/Diesel: ${dieselResp} | Frete/Prancha: ${pranchaResp}.`, 14, startY + 4);
  doc.text(`2. Apoio em Obra: Alimentação/Hospedagem: ${alimResp} | Guarda do Maquinário: ${guardaResp}.`, 14, startY + 7.5);
  doc.text('3. Medição e Manutenção: Horas apuradas pelo horímetro da máquina em BDE. Manutenção preventiva por conta da Locadora.', 14, startY + 11);

  const obsExtra = det?.observacoes_livres || (!det && orc.observacoes ? orc.observacoes : '');
  if (obsExtra) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Obs. Especiais: ${obsExtra.slice(0, 125)}`, 14, startY + 14.5);
  }

  // Assinaturas
  const assY = Math.min(276, startY + (obsExtra ? 24 : 21));
  desenharAssinaturaDigital(doc, 135, assY - 12, 38, 11, empresa);

  doc.setDrawColor(156, 163, 175);
  doc.line(20, assY, 90, assY);
  doc.line(120, assY, 190, assY);

  doc.setFontSize(7.5);
  doc.setTextColor(55, 65, 81);
  const clienteNome = orc.cliente_nome ? orc.cliente_nome.toUpperCase() : 'CONTRATANTE';
  doc.text(clienteNome, 55, assY + 3.8, { align: 'center' });
  doc.text('De Acordo / Aceite da Proposta', 55, assY + 7, { align: 'center' });

  doc.text(`${dadosEmp.razaoSocial} / Locador`, 155, assY + 3.8, { align: 'center' });
  if (dadosEmp.textoResponsavel) {
    doc.text(dadosEmp.textoResponsavel, 155, assY + 7, { align: 'center' });
  }

  desenharRodapeTerraGest(doc, 1, 1);
}
