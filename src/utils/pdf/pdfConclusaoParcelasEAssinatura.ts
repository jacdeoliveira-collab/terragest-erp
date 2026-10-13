import type jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ServicoHorimetro } from '../../types/servicoHorimetro.types';
import { obterAssinaturaEmpresa } from './pdfLogoHelper';

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
  empresa: { assinatura_digital_url?: string | null; cnpj?: string },
  razaoSocial: string
): void {
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(
    'Atestamos que os serviços acima descritos foram realizados e concluídos a contento, com ciência plena dos valores e cronograma acordado.',
    14,
    finalY
  );

  const yLinha = finalY + 20;

  // Busca e desenha a assinatura digital se cadastrada
  const assinaturaImg = obterAssinaturaEmpresa(empresa);
  if (assinaturaImg && assinaturaImg.startsWith('data:image')) {
    try {
      const formato = assinaturaImg.includes('image/jpeg') || assinaturaImg.includes('image/jpg') ? 'JPEG' : 'PNG';
      doc.addImage(assinaturaImg, formato, 32, yLinha - 13, 44, 12);
    } catch (e) {
      console.warn('Erro ao inserir assinatura no PDF:', e);
    }
  }

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
  const cnpjTxt = empresa?.cnpj ? `CNPJ: ${empresa.cnpj}` : 'Emitente / Execução';
  const docCliTxt = servico.cliente_documento ? `Doc: ${servico.cliente_documento}` : 'Aceite do Contratante';

  doc.text(cnpjTxt, 54, yLinha + 7.5, { align: 'center' });
  doc.text(docCliTxt, 150, yLinha + 7.5, { align: 'center' });

  // Data preenchida automaticamente com base no período de conclusão
  const dataConclusao = servico.data_fim
    ? new Date(servico.data_fim + 'T00:00:00').toLocaleDateString('pt-BR')
    : (servico.data_inicio
      ? new Date(servico.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR'));

  doc.text(`Data: ${dataConclusao}`, 54, yLinha + 11.5, { align: 'center' });
  doc.text(`Data: ${dataConclusao}`, 150, yLinha + 11.5, { align: 'center' });
}
