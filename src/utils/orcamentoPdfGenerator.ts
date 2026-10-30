import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Orcamento } from '../types/comercial.types';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { desenharBlocoPagamentoPixOrcamento } from './pdf/pdfOrcamentoPagamentoBlock';
import { desenharLogoNoPdf } from './pdf/pdfLogoHelper';
import { obterDadosAssinaturaEmpresa } from './pdf/pdfAssinaturaEmpresaHelper';
import { desenharFichaTecnicaMaquinaNoPdf } from './pdf/pdfOrcamentoFichaTecnica';
import { desenharTermosEAssinaturasOrcamento } from './pdf/pdfOrcamentoTermos';

export function gerarOrcamentoPDF(orc: Orcamento): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const dadosEmp = obterDadosAssinaturaEmpresa(empresa);
  const razaoSocial = dadosEmp.razaoSocial;
  const cnpj = dadosEmp.cnpj;
  const contato = [empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');
  const det = orc.detalhes_proposta;

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 5.5, 'F');
  const textX = desenharLogoNoPdf(doc, 14, 8, 36, 15, empresa) ? 54 : 14;

  doc.setFontSize(12.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textX, 14);

  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const infoLinha = [cnpj, contato].filter(Boolean).join(' | ');
  if (infoLinha) doc.text(infoLinha, textX, 18.8);
  if (empresa.endereco) doc.text(empresa.endereco, textX, 22.8);

  doc.setDrawColor(209, 213, 219);
  doc.line(14, 26, 196, 26);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PROPOSTA COMERCIAL DE LOCAÇÃO DE MÁQUINAS PESADAS & TERRAPLANAGEM', 14, 31.5);

  // Quadro Cliente, Obra e Proposta
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 34, 182, 26, 2, 2, 'FD');

  doc.setFontSize(7.8);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'bold'); doc.text('Contratante:', 17, 39.5);
  doc.setFont('helvetica', 'normal'); doc.text(`${orc.cliente_nome || 'Cliente'}${orc.cliente_documento ? ` (${orc.cliente_documento})` : ''}`.slice(0, 52), 36, 39.5);

  doc.setFont('helvetica', 'bold'); doc.text('Telefone:', 17, 45);
  doc.setFont('helvetica', 'normal'); doc.text(orc.cliente_telefone || 'Não informado', 32, 45);

  doc.setFont('helvetica', 'bold'); doc.text('Local da Obra:', 17, 50.5);
  doc.setFont('helvetica', 'normal'); doc.text((det?.local_obra || orc.cliente_endereco || 'Canteiro do Contratante').slice(0, 55), 39, 50.5);

  doc.setFont('helvetica', 'bold'); doc.text('Operação / Solo:', 17, 56);
  doc.setFont('helvetica', 'normal');
  const opSolo = [det?.tipo_operacao, det?.tipo_terreno].filter(Boolean).join(' • ') || 'Locação Linha Amarela';
  doc.text(opSolo.slice(0, 56), 41, 56);

  doc.setFont('helvetica', 'bold'); doc.text('Proposta Nº:', 126, 39.5);
  doc.setFont('helvetica', 'normal'); doc.text(orc.id ? `#ORC-${orc.id.slice(0, 6).toUpperCase()}` : '#ORC-001', 146, 39.5);

  doc.setFont('helvetica', 'bold'); doc.text('Emissão / Val.:', 126, 45);
  doc.setFont('helvetica', 'normal'); doc.text(`${orc.data_proposta || new Date().toISOString().slice(0, 10)} (${orc.validade_dias || 15}d)`, 149, 45);

  doc.setFont('helvetica', 'bold'); doc.text('Prev. Início:', 126, 50.5);
  doc.setFont('helvetica', 'normal'); doc.text(det?.previsao_inicio || 'Imediato', 145, 50.5);

  doc.setFont('helvetica', 'bold'); doc.text('Turno:', 126, 56);
  doc.setFont('helvetica', 'normal'); doc.text((det?.regime_trabalho || 'Comercial 8h/dia').slice(0, 28), 137, 56);

  // Ficha técnica da(s) máquina(s)
  const yAposFicha = desenharFichaTecnicaMaquinaNoPdf(doc, orc, 63);

  // Linhas da Tabela de Equipamentos e Escopo
  const maqItens = det?.maquinas_itens && det.maquinas_itens.length > 0 ? det.maquinas_itens : [{
    maquina_nome: orc.maquina_nome || 'Equipamento Linha Amarela',
    maquina_codigo: orc.maquina_codigo,
    maquina_modelo: orc.maquina_modelo,
    implemento: 'Concha Padrão',
    franquia_minima: 'Horímetro',
    horas_estimadas: orc.horas_estimadas || 0,
    valor_hora: orc.valor_hora || 0,
    subtotal: Number(((orc.horas_estimadas || 0) * (orc.valor_hora || 0)).toFixed(2))
  }];

  const body: string[][] = maqItens.map((m) => [
    [
      `${m.maquina_codigo ? `[${m.maquina_codigo}] ` : ''}${m.maquina_nome || 'Máquina'}`,
      m.maquina_modelo ? `Mod: ${m.maquina_modelo}` : null,
      m.implemento ? `Impl: ${m.implemento}` : null
    ].filter(Boolean).join(' • '),
    String(m.franquia_minima || 'Horímetro').replace('Franquia ', '').slice(0, 22),
    `${m.horas_estimadas || 0} h`,
    `R$ ${Number(m.valor_hora || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${Number(m.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  ]);

  if ((det?.valor_mobilizacao || 0) > 0) {
    body.push([
      'Taxa de Mobilização e Desmobilização (Transporte em Prancha Ida e Volta)',
      'Frete Fixo', '1 un',
      `R$ ${Number(det?.valor_mobilizacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${Number(det?.valor_mobilizacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);
  }

  autoTable(doc, {
    startY: yAposFicha,
    head: [['Equipamento / Modelo / Implemento', 'Franquia / Medição', 'Qtd / Horas', 'Valor Unit.', 'Subtotal']],
    body,
    foot: [[`Escopo Técnico: ${orc.descricao_servico || 'Conforme especificações da obra'}`, '', '', 'TOTAL:', `R$ ${Number(orc.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [31, 41, 55] },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [243, 244, 246], textColor: [5, 150, 105], fontStyle: 'bold' }
  });

  const lastTable = doc as unknown as { lastAutoTable: { finalY: number } };
  const finalY = lastTable.lastAutoTable.finalY || (yAposFicha + 24);

  const resumoFinanceiroExtras = [
    (det?.valor_desconto || 0) > 0 ? `Desconto Aplicado: R$ ${Number(det?.valor_desconto).toFixed(2)}` : null,
    (det?.valor_hora_parada || 0) > 0 ? `Taxa Hora Parada / Chuva: R$ ${Number(det?.valor_hora_parada).toFixed(2)}/h` : null,
    (orc.valor_adiantamento || 0) > 0 ? `Sinal Recebido: R$ ${Number(orc.valor_adiantamento).toFixed(2)}` : null
  ].filter(Boolean).join('   |   ');

  if (resumoFinanceiroExtras) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(resumoFinanceiroExtras, 14, finalY + 5);
  }

  const posPagY = desenharBlocoPagamentoPixOrcamento(doc, orc, finalY + (resumoFinanceiroExtras ? 8 : 3));
  desenharTermosEAssinaturasOrcamento(doc, orc, posPagY + 3, empresa, dadosEmp);

  const cleanName = (orc.cliente_nome || 'cliente').toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`proposta_comercial_${cleanName}.pdf`);
}
