import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { desenharFotosTrabalho } from './pdf/pdfFotosTrabalhoAnexo';
import { desenharLogoNoPdf, calcularLarguraLogo } from './pdf/pdfLogoHelper';
import { desenharTabelaParcelasConclusao, desenharAssinaturasConclusao } from './pdf/pdfConclusaoParcelasEAssinatura';
import { obterServicoCompleto } from './pdf/pdfServicoDataHelper';
import { aplicarRodapeTodasPaginas } from './pdf/pdfHeaderFooter';

export async function gerarRelatorioConclusaoClientePDF(servicoParam: ServicoHorimetro): Promise<void> {
  const servico = obterServicoCompleto(servicoParam);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'J A C DE OLIVEIRA';
  const cnpj = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
  const contato = [empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');

  // Topo Verde e Cabeçalho
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 6, 'F');
  let textStartX = 14;
  if (desenharLogoNoPdf(doc, 14, 8.5, 22, 16, empresa)) {
    textStartX = Math.max(38, 14 + calcularLarguraLogo(doc, 22, 16, empresa) + 3.5);
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textStartX, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const infoLinha = [cnpj, contato].filter(Boolean).join(' | ');
  if (infoLinha) doc.text(infoLinha, textStartX, 20);
  if (empresa.endereco) doc.text(empresa.endereco, textStartX, 24);

  doc.setDrawColor(209, 213, 219);
  doc.line(14, 28, 196, 28);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('RELATÓRIO DE ENCERRAMENTO & ENTREGA DE SERVIÇO', 14, 34);

  // Box Cliente
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 38, 182, 22, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Cliente Contratante:', 18, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(servico.cliente_nome, 54, 44);

  doc.setFont('helvetica', 'bold');
  doc.text('Documento / CPF / CNPJ:', 18, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(servico.cliente_documento || 'Não informado', 60, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('Período de Execução:', 18, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(`${servico.data_inicio} até ${servico.data_fim || 'Conclusão'}`, 54, 56);

  // Tabela de Horímetro & Produção com Dados Completos
  const horas = Number(servico.horas_trabalhadas || 0);
  const vlrHora = Number(servico.valor_hora || 0);
  const totalBruto = Number(servico.faturamento_bruto || horas * vlrHora);
  const adiantamento = Number(servico.valor_adiantamento || 0);
  const saldoFinal = Math.max(0, totalBruto - adiantamento);
  const pMaq = servico.maquinas_itens?.[0];
  const hIni = Number(servico.horimetro_inicial || pMaq?.horimetro_inicial || 0);
  const hFim = servico.horimetro_final !== undefined
    ? Number(servico.horimetro_final)
    : (pMaq?.horimetro_final !== undefined ? Number(pMaq.horimetro_final) : undefined);

  autoTable(doc, {
    startY: 64,
    head: [['Descrição do Trabalho', 'Equipamento', 'Operador', 'H. Inicial', 'H. Final', 'Horas', 'R$ / Hora', 'Total Bruto']],
    body: [[
      servico.descricao_servico,
      servico.maquina_nome,
      servico.operador_nome,
      `${hIni.toFixed(1)} h`,
      hFim !== undefined ? `${hFim.toFixed(1)} h` : 'Em curso',
      `${horas.toFixed(1)} h`,
      `R$ ${vlrHora.toFixed(2)}`,
      `R$ ${totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]],
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 1.5, right: 1.5 },
      valign: 'middle',
      minCellHeight: 10,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      valign: 'middle',
      minCellHeight: 8
    },
    columnStyles: {
      0: { cellWidth: 32, overflow: 'linebreak' },
      1: { cellWidth: 32, overflow: 'linebreak' },
      2: { cellWidth: 26, overflow: 'linebreak' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' }
    }
  });

  // Tabela Financeira com Adiantamento e Saldo
  const finalTableY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: finalTableY,
    head: [['Demonstrativo Financeiro do Serviço', 'Valor (R$)']],
    body: [
      ['Valor Total dos Serviços Executados', `R$ ${totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['(-) Adiantamento / Sinal Recebido', `R$ ${adiantamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['(=) SALDO RESTANTE A LIQUIDAR', `R$ ${saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]
    ],
    theme: 'striped',
    styles: { fontSize: 8.5, cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }, minCellHeight: 7.5, valign: 'middle' },
    headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold', valign: 'middle' }
  });

  // Cronograma de Parcelas Acordadas (se houver)
  desenharTabelaParcelasConclusao(doc, servico);

  // Termo de Encerramento e Assinaturas (com suporte a assinatura digital)
  desenharAssinaturasConclusao(doc, servico, empresa, razaoSocial);

  await desenharFotosTrabalho(doc, servico);
  aplicarRodapeTodasPaginas(doc);
  const nomeArquivo = `Relatorio_Entrega_${servico.cliente_nome.replace(/\s+/g, '_')}.pdf`;
  doc.save(nomeArquivo);
}
