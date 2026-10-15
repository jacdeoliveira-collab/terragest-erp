import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Cliente } from '../types/comercial.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function exportarClientesPDF(clientes: Cliente[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = desenharCabecalhoPdf(
    doc,
    'CARTEIRA DE CLIENTES & CONTRATANTES',
    `Total de Clientes: ${clientes.length}  •  Emissão: ${new Date().toLocaleString('pt-BR')}`
  );

  const colunas = ['Nome / Razão Social', 'CPF / CNPJ', 'Telefone / WhatsApp', 'Endereço / Localização'];
  const linhas = clientes.map((c) => [
    c.nome || '-',
    c.documento || '-',
    c.telefone || '-',
    c.endereco || '-'
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
  doc.save(`clientes_${new Date().toISOString().slice(0, 10)}.pdf`);
}
