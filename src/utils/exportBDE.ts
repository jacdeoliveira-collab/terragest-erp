import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DailyBulletin } from '../types/bde.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function gerarRelatorioBDE(dadosBDE: DailyBulletin[], nomeObra?: string): void {
  const doc = new jsPDF();

  const obraTexto = nomeObra ? `Obra: ${nomeObra}` : 'Obra: Todas / Geral';
  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO DE BOLETIM DIÁRIO DE EQUIPAMENTO (BDE)',
    `${obraTexto}  •  Emissão: ${new Date().toLocaleString('pt-BR')}  •  Total: ${dadosBDE.length} registro(s)`
  );

  const colunas = ['Data', 'Máquina', 'Operador', 'H. Inicial', 'H. Final', 'Total Horas'];
  const linhas = dadosBDE.map((b) => [
    b.date || '-',
    b.equipment_code ? `${b.equipment_code}` : b.equipment_name || b.equipment_id.slice(0, 8),
    b.operador_nome || b.operator_name || '-',
    `${Number(b.initial_hourmeter).toFixed(1)}h`,
    `${Number(b.final_hourmeter).toFixed(1)}h`,
    `${Number(b.total_hours).toFixed(1)}h`
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  doc.save('bde_relatorio_obra.pdf');
}

export function gerarExcelBDE(dadosBDE: DailyBulletin[], _nomeObra?: string): void {
  const cabecalho = 'Data;Máquina;Operador;Horímetro Inicial;Horímetro Final;Total de Horas;Descrição';

  const linhas = dadosBDE.map((b) => {
    const data = b.date || '';
    const maquina = b.equipment_code || b.equipment_name || b.equipment_id.slice(0, 8);
    const operador = (b.operador_nome || b.operator_name || '').replace(/;/g, ' ');
    const hInicial = Number(b.initial_hourmeter).toFixed(1).replace('.', ',');
    const hFinal = Number(b.final_hourmeter).toFixed(1).replace('.', ',');
    const totalHoras = Number(b.total_hours).toFixed(1).replace('.', ',');
    const descricao = (b.service_description || '').replace(/;/g, ' ').replace(/\n/g, ' ');

    return `${data};${maquina};${operador};${hInicial};${hFinal};${totalHoras};${descricao}`;
  });

  const csvContent = '\uFEFF' + [cabecalho, ...linhas].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'bde_relatorio_obra.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
