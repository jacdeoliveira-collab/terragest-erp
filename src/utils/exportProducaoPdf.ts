import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ApontamentoViagemItem } from '../types/producao.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function exportarProducaoViagensPDF(tickets: ApontamentoViagemItem[], obraNome?: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const volumeTotal = tickets.reduce((acc, t) => acc + (Number(t.volume_m3) || 0), 0);
  const subtitulo = `${obraNome ? `Obra: ${obraNome}  •  ` : ''}Total de Viagens: ${tickets.length}  •  Volume: ${volumeTotal.toFixed(1)} m³  •  Emissão: ${new Date().toLocaleString('pt-BR')}`;

  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO DE PRODUÇÃO & APONTAMENTO DE VIAGENS (SINALEIRO)',
    subtitulo
  );

  const colunas = ['Ticket', 'Horário', 'Caminhão', 'Escavadeira / Carga', 'Material', 'Volume (m³)', 'Estacas / DMT', 'Motorista'];
  const linhas = tickets.map((t) => [
    t.numero_ticket || '-',
    new Date(t.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    `${t.caminhao_codigo || ''} ${t.caminhao_placa ? `(${t.caminhao_placa})` : ''}`.trim() || '-',
    t.escavadeira_codigo || t.escavadeira_nome || '-',
    (t.material_tipo || '-').replace('_', ' '),
    `${Number(t.volume_m3 || 0).toFixed(1)} m³`,
    `${t.origem_estaca || 'Corte'} -> ${t.destino_estaca || 'Aterro'}${t.dmt_km ? ` (${t.dmt_km} km)` : ''}`,
    t.operador_caminhao_nome || '-'
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  doc.save(`producao_sinaleiro_${new Date().toISOString().slice(0, 10)}.pdf`);
}
