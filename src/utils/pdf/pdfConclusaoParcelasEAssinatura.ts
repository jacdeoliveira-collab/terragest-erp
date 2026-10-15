import type jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ServicoHorimetro } from '../../types/servicoHorimetro.types';
import type { TenantMaster } from '../../types/tenant.types';
import { obterDadosAssinaturaEmpresa, desenharAssinaturaDigital } from './pdfAssinaturaEmpresaHelper';

export function desenharTabelaAdiantamentosConclusao(doc: jsPDF, servico: ServicoHorimetro): void {
  const historico = Array.isArray(servico.adiantamentos_historico) ? servico.adiantamentos_historico : [];
  const temHist = historico.length > 0;
  const temSinal = servico.valor_adiantamento && Number(servico.valor_adiantamento) > 0;
  if (!temHist && !temSinal) return;

  const startY = (doc as any).lastAutoTable?.finalY + 4;
  const formatarData = (d?: string) => {
    if (!d) return '-';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
  };

  const rows = temHist
    ? historico.map((h, i) => [
        `Parcela ${i + 1}/${historico.length}`,
        formatarData(h.data),
        h.forma_pagamento || 'PIX',
        h.numero_recibo ? `Recibo: ${h.numero_recibo}` : (h.observacao || 'Sinal / Haver Recebido'),
        `R$ ${Number(h.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ])
    : [[
        'Sinal Único (1/1)',
        formatarData(servico.data_adiantamento || servico.data_inicio),
        servico.forma_pagamento_adiantamento || 'PIX',
        'Sinal / Entrada Antecipada',
        `R$ ${Number(servico.valor_adiantamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]];

  autoTable(doc, {
    startY,
    head: [['Parcela / Haver', 'Data Recebimento', 'Forma Pgto', 'Recibo / Referência', 'Valor (R$)']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }, minCellHeight: 6, valign: 'middle' },
    headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: 'bold', minCellHeight: 6.5 },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 26, halign: 'center' },
      2: { cellWidth: 26 },
      3: { cellWidth: 58 },
      4: { cellWidth: 34, halign: 'right', fontStyle: 'bold' }
    }
  });
}

export function desenharTabelaParcelasConclusao(doc: jsPDF, servico: ServicoHorimetro): void {
  const parcelas = Array.isArray(servico.parcelas) ? servico.parcelas : [];
  if (parcelas.length === 0) return;

  const startY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY,
    head: [['Parcela', 'Data de Vencimento', 'Forma / Observação', 'Valor (R$)', 'Situação']],
    body: parcelas.map((p, idx) => {
      const num = p.numero || idx + 1;
      const venc = p.data_vencimento
        ? new Date(p.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')
        : 'A Combinar';
      const forma = p.forma || p.forma_pagamento || p.observacao || 'A Prazo';
      const valor = `R$ ${Number(p.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      const status = p.status === 'PAGO' ? 'QUITADO' : 'A VENCER';
      return [`Parcela ${num}/${parcelas.length}`, venc, forma, valor, status];
    }),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 }, minCellHeight: 7.5, valign: 'middle' },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', valign: 'middle', minCellHeight: 7.5 }
  });
}

export function desenharAssinaturasConclusao(
  doc: jsPDF,
  servico: ServicoHorimetro,
  empresaParam?: Partial<TenantMaster> | null,
  razaoSocialCustom?: string,
  startYCustom?: number
): void {
  const finalY = startYCustom !== undefined ? startYCustom : (doc as any).lastAutoTable.finalY + 6;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(
    'Atestamos que os serviços acima descritos foram realizados e concluídos a contento, com ciência plena dos valores e cronograma acordado.',
    14,
    finalY
  );

  const yLinha = finalY + 18;
  const dadosEmp = obterDadosAssinaturaEmpresa(empresaParam);
  const razaoSocial = razaoSocialCustom || dadosEmp.razaoSocial;

  desenharAssinaturaDigital(doc, 32, yLinha - 13, 44, 12, empresaParam);

  doc.setDrawColor(156, 163, 175);
  doc.line(18, yLinha, 90, yLinha);
  doc.line(114, yLinha, 186, yLinha);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), 54, yLinha + 4, { align: 'center' });
  doc.text(servico.cliente_nome.toUpperCase(), 150, yLinha + 4, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const cnpjTxt = dadosEmp.cnpj || 'Emitente / Execução';
  const docCliTxt = servico.cliente_documento ? `Doc: ${servico.cliente_documento}` : 'Aceite do Contratante';

  const dataConclusao = servico.data_fim
    ? new Date(servico.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')
    : (servico.data_inicio
      ? new Date(servico.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR'));

  if (dadosEmp.textoResponsavel) {
    doc.text(dadosEmp.textoResponsavel, 54, yLinha + 7.5, { align: 'center' });
    doc.text(cnpjTxt, 54, yLinha + 10.5, { align: 'center' });
    doc.text(`Data: ${dataConclusao}`, 54, yLinha + 13.5, { align: 'center' });

    doc.text(docCliTxt, 150, yLinha + 7.5, { align: 'center' });
    doc.text(`Data: ${dataConclusao}`, 150, yLinha + 13.5, { align: 'center' });
  } else {
    doc.text(cnpjTxt, 54, yLinha + 7.5, { align: 'center' });
    doc.text(`Data: ${dataConclusao}`, 54, yLinha + 11.5, { align: 'center' });

    doc.text(docCliTxt, 150, yLinha + 7.5, { align: 'center' });
    doc.text(`Data: ${dataConclusao}`, 150, yLinha + 11.5, { align: 'center' });
  }
}
