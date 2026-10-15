import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Equipment } from '../types/equipment.types';
import type { ChecklistItem } from '../types/checklist.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export { exportarAbastecimentosPDF } from './exportAbastecimentosPdf';

export function exportarFrotaPDF(frota: Equipment[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO CONSOLIDADO DA FROTA & MAQUINÁRIO',
    `Total de Equipamentos: ${frota.length}  •  Emissão: ${new Date().toLocaleString('pt-BR')}`
  );

  const colunas = ['Código', 'Equipamento', 'Marca / Modelo', 'Tipo / Propriedade', 'Horímetro', 'Status'];
  const linhas = frota.map((e) => [
    e.code || '-',
    e.name || '-',
    [e.marca, e.model].filter(Boolean).join(' ') || '-',
    `${e.type || 'MÁQUINA'} (${e.tipo_propriedade || 'PRÓPRIO'})`,
    `${(Number(e.current_hourmeter) || 0).toFixed(1)} h`,
    e.status || 'ATIVO'
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  doc.save(`frota_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportarChecklistsPDF(checklists: ChecklistItem[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO DE INSPEÇÕES & CHECKLISTS DIÁRIOS',
    `Total de Inspeções: ${checklists.length}  •  Emissão: ${new Date().toLocaleString('pt-BR')}`
  );

  const colunas = ['Data', 'Equipamento', 'Operador', 'Horímetro', 'Status'];
  const linhas = checklists.map((c) => [
    c.data || '-',
    c.maquina_codigo ? `${c.maquina_codigo} - ${c.maquina_nome || ''}` : (c.maquina_nome || '-'),
    c.operador_nome || '-',
    c.horimetro_atual ? `${Number(c.horimetro_atual).toFixed(1)} h` : '-',
    c.status_geral || (c.status_geral_aprovado ? 'APROVADO' : 'PENDENTE')
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  doc.save(`checklists_${new Date().toISOString().slice(0, 10)}.pdf`);
}
