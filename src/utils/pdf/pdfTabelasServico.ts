import type jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ServicoHorimetro } from '../../types/servicoHorimetro.types';
import { getEmpresaAtivaCache } from '../../services/empresaAtivaService';

export function desenharTabelaMedicao(doc: jsPDF, servico: ServicoHorimetro): number {
  const pMaq = servico.maquinas_itens?.[0];
  const hInicial = (servico.maquinas_itens && servico.maquinas_itens.length > 0 && pMaq)
    ? Number(pMaq.horimetro_inicial || 0)
    : Number(servico.horimetro_inicial || 0);

  const hFinal = (servico.maquinas_itens && servico.maquinas_itens.length > 0 && pMaq)
    ? pMaq.horimetro_final
    : servico.horimetro_final;

  const linhas = (servico.maquinas_itens && servico.maquinas_itens.length > 1)
    ? servico.maquinas_itens.map((m) => [
        m.maquina_nome || servico.descricao_servico || 'Locação e Operação',
        `${Number(m.horimetro_inicial || 0).toFixed(1)} h`,
        m.horimetro_final !== undefined ? `${Number(m.horimetro_final).toFixed(1)} h` : 'Em curso',
        `${Number(m.horas_trabalhadas || 0).toFixed(1)} h`,
        `R$ ${Number(m.valor_hora || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `R$ ${Number(m.faturamento_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ])
    : [
        [
          servico.descricao_servico || (pMaq?.maquina_nome ? `Operação: ${pMaq.maquina_nome}` : 'Locação e Operação de Máquina Pesada'),
          `${hInicial.toFixed(1)} h`,
          hFinal !== undefined ? `${Number(hFinal).toFixed(1)} h` : 'Em curso',
          `${Number(servico.horas_trabalhadas || 0).toFixed(1)} h`,
          `R$ ${Number(servico.valor_hora || pMaq?.valor_hora || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `R$ ${Number(servico.faturamento_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        ]
      ];

  autoTable(doc, {
    startY: 63,
    head: [['Descrição do Serviço', 'Horímetro Inicial', 'Horímetro Final', 'Saldo Horas', 'Valor Hora (R$)', 'Total Bruto (R$)']],
    body: linhas,
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.2, halign: 'center' },
    columnStyles: { 0: { halign: 'left' }, 5: { fontStyle: 'bold', halign: 'right' } }
  });
  return (doc as any).lastAutoTable.finalY;
}

export function desenharTabelaDespesas(doc: jsPDF, servico: ServicoHorimetro, startY: number): number {
  autoTable(doc, {
    startY: startY + 3,
    head: [['Detalhamento das Despesas Operacionais', 'Litros / Quantidade', 'Valor Total (R$)']],
    body: [
      ['Combustível da Máquina (Diesel S500)', `${Number(servico.combustivel_maquina_litros || 0).toFixed(2)} L`, `R$ ${Number(servico.combustivel_maquina_valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Combustível de Apoio (Diesel S10)', `${Number(servico.combustivel_apoio_litros || 0).toFixed(2)} L`, `R$ ${Number(servico.combustivel_apoio_valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Diária do Operador de Campo', 'Mão de obra', `R$ ${Number(servico.despesa_operador || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Logística e Apoio Adicional', 'Deslocamento', `R$ ${Number(servico.despesa_apoio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Manutenção da Máquina', servico.alerta_painel ? `Alerta: ${servico.alerta_painel}` : 'Preventiva / Óleos', `R$ ${Number(servico.despesa_manutencao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]
    ],
    headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } }
  });
  return (doc as any).lastAutoTable.finalY;
}

export function desenharResumoFinanceiro(doc: jsPDF, servico: ServicoHorimetro, startY: number): number {
  const boxY = startY + 3;
  doc.setDrawColor(209, 213, 219);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, boxY, 182, 21, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Demonstrativo Financeiro do Serviço:', 18, boxY + 5.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Faturamento Bruto: R$ ${Number(servico.faturamento_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 18, boxY + 10.5);
  doc.text(`(-) Total Despesas: R$ ${Number(servico.despesas_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 18, boxY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(
    `(=) Lucro Líquido Real: R$ ${Number(servico.lucro_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${Number(servico.margem_lucro || 0).toFixed(1)}%)`,
    18,
    boxY + 19.5
  );
  return boxY + 22;
}

export function desenharAssinaturas(doc: jsPDF, yAssinatura: number): void {
  const empresa = getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'J A C DE OLIVEIRA';

  if (empresa.assinatura_digital_url) {
    try {
      doc.addImage(empresa.assinatura_digital_url, 'PNG', 35, yAssinatura - 14, 38, 12);
    } catch {}
  }

  doc.setDrawColor(156, 163, 175);
  doc.line(20, yAssinatura, 90, yAssinatura);
  doc.line(120, yAssinatura, 190, yAssinatura);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`${razaoSocial.toUpperCase()} / Emitente`, 25, yAssinatura + 4);
  doc.text('Assinatura do Cliente Contratante', 125, yAssinatura + 4);
}
