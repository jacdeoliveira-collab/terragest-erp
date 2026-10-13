import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DailyBulletin } from '../types/bde.types';
import { getEmpresaAtivaCache } from './empresaAtivaService';
import { SITE_TERRAGEST } from '../utils/pdf/pdfEmpresaLayout';
import { desenharLogoNoPdf } from '../utils/pdf/pdfLogoHelper';

export function exportBDEToPDF(bulletins: DailyBulletin[]): void {
  const doc = new jsPDF('landscape');
  const empresa = getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'TERRAGEST GESTÃO DE EQUIPAMENTOS';

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 297, 5, 'F');

  let textX = 14;
  if (desenharLogoNoPdf(doc, 14, 8, 32, 14, empresa)) {
    textX = 50;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textX, 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`RELATÓRIO GERAL DE BOLETINS DIÁRIOS (BDE)  •  Emissão: ${new Date().toLocaleString('pt-BR')}`, textX, 18);

  const head = [['Data', 'Equipamento', 'Operador', 'Cliente / Obra', 'H. Inicial', 'H. Final', 'Total Horas', 'Diesel (L)', 'Status']];
  const body = bulletins.map(b => [
    b.date,
    b.equipment_code ? `${b.equipment_code} - ${b.equipment_name || ''}` : b.equipment_id,
    b.operator_name,
    `${b.client_name} (${b.work_location})`,
    b.initial_hourmeter.toFixed(1),
    b.final_hourmeter.toFixed(1),
    b.total_hours.toFixed(1),
    b.fuel_liters.toFixed(1),
    b.status
  ]);

  autoTable(doc, {
    startY: 25,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' }
  });

  // Rodapé Propaganda TerraGest (landscape: altura 210mm)
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 200, 283, 200);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('TerraGest ERP Linha Amarela', 14, 205);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(` • ${SITE_TERRAGEST}`, 56, 205);

  doc.save(`BDE_TerraGest_${new Date().toISOString().slice(0, 10)}.pdf`);
}
