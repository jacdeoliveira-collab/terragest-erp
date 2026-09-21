import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DailyBulletin } from '../types/bde.types';

export function exportBDEToPDF(bulletins: DailyBulletin[]): void {
  const doc = new jsPDF('landscape');
  doc.setFontSize(16);
  doc.text('TerraGest - Relatório de Boletins Diários de Equipamento (BDE)', 14, 15);
  doc.setFontSize(10);
  doc.text(`Data de Emissão: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

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
    startY: 26,
    head,
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [20, 83, 45] }
  });

  doc.save(`BDE_TerraGest_${new Date().toISOString().slice(0, 10)}.pdf`);
}
