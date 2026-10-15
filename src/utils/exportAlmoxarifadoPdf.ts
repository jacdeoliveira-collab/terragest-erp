import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MovimentacaoAlmoxarifadoItem } from '../types/almoxarifado.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function exportarAlmoxarifadoMovimentacoesPDF(itens: MovimentacaoAlmoxarifadoItem[], obraNome?: string): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const totalEntradas = itens.filter((i) => i.tipo_movimentacao === 'ENTRADA').length;
  const totalSaidas = itens.filter((i) => i.tipo_movimentacao === 'SAIDA').length;
  const valorTotalGeral = itens.reduce((acc, i) => acc + (Number(i.valor_total) || 0), 0);

  const subtitulo = `${obraNome ? `Obra: ${obraNome}  •  ` : ''}Total: ${itens.length}  •  Entradas: ${totalEntradas}  •  Saídas: ${totalSaidas}${valorTotalGeral > 0 ? `  •  Valor: R$ ${valorTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}  •  Emissão: ${new Date().toLocaleString('pt-BR')}`;

  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO DE MOVIMENTAÇÕES DE ALMOXARIFADO & INSUMOS',
    subtitulo
  );

  const colunas = ['Tipo', 'Data', 'Material / Insumo', 'Quantidade', 'Fornecedor / Destino', 'NF', 'Ticket Balança', 'Peso Líq. (kg)', 'Valor R$'];
  const linhas = itens.map((i) => [
    i.tipo_movimentacao,
    new Date(i.data + 'T00:00:00').toLocaleDateString('pt-BR'),
    i.material_nome || '-',
    `${i.quantidade.toLocaleString('pt-BR')} ${i.unidade_medida}`,
    i.fornecedor_nome || i.obra_nome || '-',
    i.numero_nf || '-',
    i.ticket_balanca_numero ? `#${i.ticket_balanca_numero}` : '-',
    i.peso_liquido_kg ? i.peso_liquido_kg.toLocaleString('pt-BR') : '-',
    i.valor_total ? `R$ ${Number(i.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'
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
  doc.save(`almoxarifado_${new Date().toISOString().slice(0, 10)}.pdf`);
}
