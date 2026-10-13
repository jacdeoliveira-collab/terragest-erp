import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Obra } from '../types/obras.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function gerarRelatorioObrasPDF(obras: Obra[]): void {
  const doc = new jsPDF();

  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO DE CENTROS DE CUSTO & CANTEIROS DE OBRAS',
    `Total de Obras Cadastradas: ${obras.length}  •  Emissão: ${new Date().toLocaleString('pt-BR')}`
  );

  const colunas = ['Nome da Obra', 'Cliente / Contratante', 'Localização', 'Status'];
  const linhas = obras.map((o) => [
    o.nome,
    o.cliente || '-',
    o.localizacao || '-',
    o.status
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  doc.save('terragest_obras.pdf');
}

export function gerarExcelObras(obras: Obra[]): void {
  const cabecalho = 'Nome da Obra;Cliente / Contratante;Localização;Status';
  const linhas = obras.map((o) => {
    const nome = (o.nome || '').replace(/;/g, ' ');
    const cliente = (o.cliente || '').replace(/;/g, ' ');
    const local = (o.localizacao || '').replace(/;/g, ' ');
    const status = o.status || 'ATIVA';
    return `${nome};${cliente};${local};${status}`;
  });

  const csvContent = '\uFEFF' + [cabecalho, ...linhas].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'terragest_obras.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
