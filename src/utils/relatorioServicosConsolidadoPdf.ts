import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { desenharCabecalhoPdf } from './pdf/pdfEmpresaLayout';
import { aplicarRodapeTodasPaginas } from './pdf/pdfHeaderFooter';
import { obterDadosAssinaturaEmpresa, desenharAssinaturaDigital } from './pdf/pdfAssinaturaEmpresaHelper';

export function gerarRelatorioServicosConsolidadoPDF(
  servicos: ServicoHorimetro[],
  clienteNomeCustom?: string
): void {
  if (!servicos || servicos.length === 0) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const clientesUnicos = Array.from(
    new Set(servicos.map((s) => s.cliente_nome?.trim()).filter((c): c is string => Boolean(c)))
  );
  const clienteDetectado = clientesUnicos.length === 1
    ? clientesUnicos[0]
    : (clientesUnicos.length > 0 && clientesUnicos.length <= 2 ? clientesUnicos.join(' & ') : 'Múltiplos Clientes');
  const clienteNome = (clienteNomeCustom && clienteNomeCustom !== 'Geral_Consolidado') ? clienteNomeCustom : clienteDetectado;
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  const startY = desenharCabecalhoPdf(
    doc,
    'EXTRATO CONSOLIDADO DE SERVIÇOS & LOCAÇÃO',
    `Cliente: ${clienteNome}  •  Data de Emissão: ${dataHoje}  •  Total de Serviços: ${servicos.length}`
  );

  // Totais consolidados
  const totalHoras = servicos.reduce((acc, s) => acc + (Number(s.horas_trabalhadas) || 0), 0);
  const totalFat = servicos.reduce((acc, s) => acc + (Number(s.faturamento_bruto) || 0), 0);
  const totalAdiant = servicos.reduce((acc, s) => {
    const v = Number(s.valor_adiantamento) || 0;
    const hist = Array.isArray(s.adiantamentos_historico)
      ? s.adiantamentos_historico.reduce((hAcc, h) => hAcc + (Number(h.valor) || 0), 0) : 0;
    return acc + Math.max(v, hist);
  }, 0);
  const totalSaldo = servicos.reduce((acc, s) => {
    const fat = Number(s.faturamento_bruto) || 0;
    const hist = Array.isArray(s.adiantamentos_historico)
      ? s.adiantamentos_historico.reduce((hAcc, h) => hAcc + (Number(h.valor) || 0), 0) : 0;
    const ad = Math.max(Number(s.valor_adiantamento) || 0, hist);
    return acc + Math.max(0, fat - ad);
  }, 0);

  // Caixa de Totais
  doc.setDrawColor(209, 213, 219);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, startY, 182, 18, 2, 2, 'FD');

  doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'bold');
  doc.text('TOTAL HORAS', 20, startY + 6); doc.text('TOTAL FATURAMENTO', 65, startY + 6);
  doc.text('TOTAL RECEBIDO (SINAL)', 115, startY + 6); doc.text('SALDO PENDENTE', 160, startY + 6);

  doc.setFontSize(10.5); doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); doc.text(`${totalHoras.toFixed(1)} h`, 20, startY + 13);
  doc.setTextColor(30, 41, 59); doc.text(`R$ ${totalFat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 65, startY + 13);
  doc.setTextColor(13, 148, 136); doc.text(`R$ ${totalAdiant.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 115, startY + 13);
  doc.setTextColor(totalSaldo > 0 ? 185 : 30, totalSaldo > 0 ? 28 : 41, totalSaldo > 0 ? 28 : 59);
  doc.text(`R$ ${totalSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 160, startY + 13);

  // Tabela Consolidada de Serviços com Cliente e Horímetro legível
  const formatarData = (d?: string) => {
    if (!d) return '';
    const parts = d.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}` : d;
  };

  const rows = servicos.map((s) => {
    const fat = Number(s.faturamento_bruto) || 0;
    const hist = Array.isArray(s.adiantamentos_historico)
      ? s.adiantamentos_historico.reduce((acc, h) => acc + (Number(h.valor) || 0), 0) : 0;
    const ad = Math.max(Number(s.valor_adiantamento) || 0, hist);
    const sal = Math.max(0, fat - ad);
    const hIni = Number(s.horimetro_inicial) || 0;
    const hFim = s.horimetro_final !== undefined && s.horimetro_final !== null ? Number(s.horimetro_final) : null;
    const hDesc = hFim !== null ? `Ini: ${hIni.toFixed(1)}\nFim: ${hFim.toFixed(1)}` : `Ini: ${hIni.toFixed(1)}\n(Em curso)`;
    const desc = s.descricao_servico || s.obra_nome;
    const cliDesc = desc ? `${s.cliente_nome || '-'}\n${desc}` : (s.cliente_nome || '-');
    const periodo = formatarData(s.data_inicio) + (s.data_fim ? `\na ${formatarData(s.data_fim)}` : '');

    return [
      cliDesc, periodo, s.maquina_nome || '-', s.operador_nome || '-', hDesc,
      `${(Number(s.horas_trabalhadas) || 0).toFixed(1)} h`,
      `R$ ${fat.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${ad.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${sal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      s.status === 'FINALIZADO' ? 'Concluído' : 'Em Curso'
    ];
  });

  autoTable(doc, {
    startY: startY + 22,
    head: [['Cliente / Obra', 'Período', 'Máquina', 'Operador', 'Horímetro', 'Horas', 'Faturamento', 'Recebido', 'Saldo', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7, halign: 'center' },
    bodyStyles: { fontSize: 6.8, textColor: [31, 41, 55] },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 24 },
      3: { cellWidth: 18 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 13, halign: 'right', fontStyle: 'bold' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 17, halign: 'right' },
      8: { cellWidth: 17, halign: 'right', fontStyle: 'bold' },
      9: { cellWidth: 13, halign: 'center' }
    },
    styles: { overflow: 'linebreak', cellPadding: 1.5 }
  });

  // Assinaturas
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  if (finalY < 240) {
    const assY = Math.max(finalY + 22, 230);
    const dadosEmp = obterDadosAssinaturaEmpresa();
    desenharAssinaturaDigital(doc, 135, assY - 14, 40, 12);

    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.3);
    doc.line(20, assY, 90, assY);
    doc.line(120, assY, 190, assY);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    const assinanteCli = clientesUnicos.length === 1 ? clienteNome.toUpperCase() : 'DE ACORDO DOS CLIENTES';
    const subCli = clientesUnicos.length === 1 ? 'CONTRATANTE / CLIENTE' : 'CONTRATANTES / CLIENTES';
    doc.text(assinanteCli, 55, assY + 4, { align: 'center' });
    doc.text(subCli, 55, assY + 7.5, { align: 'center' });

    doc.text(dadosEmp.razaoSocial.toUpperCase(), 155, assY + 4, { align: 'center' });
    if (dadosEmp.textoResponsavel) {
      doc.text(dadosEmp.textoResponsavel, 155, assY + 7.5, { align: 'center' });
      doc.text('CONTRATADA / LOCADORA', 155, assY + 11, { align: 'center' });
    } else {
      doc.text('CONTRATADA / LOCADORA', 155, assY + 7.5, { align: 'center' });
    }
  }

  aplicarRodapeTodasPaginas(doc);
  const nomeArq = `Extrato_Consolidado_${clienteNome.replace(/[^a-zA-Z0-9]/g, '_')}_${dataHoje.replace(/\//g, '-')}.pdf`;
  doc.save(nomeArq);
}
