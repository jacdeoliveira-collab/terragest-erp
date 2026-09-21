import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SipeagroReport } from '../types/regulatory.types';

export function exportSipeagroToPDF(reports: SipeagroReport[], monthFilter?: string): void {
  const doc = new jsPDF('landscape');
  doc.setFontSize(15);
  doc.text('TerraGest - Relatório Mensal de Operação Aeroagrícola (MAPA / SIPEAGRO)', 14, 15);
  doc.setFontSize(10);
  doc.text(`Período / Mês: ${monthFilter || 'Geral'} | Emissão: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

  const head = [['Mês', 'Drone', 'Receita N°', 'CREA/ART', 'Produtor / Fazenda', 'Cultura', 'Alvo', 'Produto', 'Dose/ha', 'Área (ha)', 'Calda (L/ha)']];
  const body = reports.map(r => [
    r.report_month,
    r.equipment_code || r.equipment_id,
    r.recipe_number,
    r.agronomist_crea,
    `${r.farmer_name} - ${r.farm_name}`,
    r.target_crop,
    r.target_pest,
    r.product_commercial_name,
    r.dosage_per_ha,
    r.applied_area_ha.toFixed(1),
    r.spray_volume_l_ha.toFixed(1)
  ]);

  autoTable(doc, {
    startY: 26,
    head,
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 76, 129] }
  });

  doc.save(`SIPEAGRO_MAPA_${monthFilter || 'Relatorio'}.pdf`);
}
