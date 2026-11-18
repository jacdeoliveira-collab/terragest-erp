import jsPDF from 'jspdf';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import {
  desenharCabecalhoPrincipal,
  desenharBoxIdentificacao,
  aplicarRodapeTodasPaginas
} from './pdf/pdfHeaderFooter';
import {
  desenharTabelaMedicao,
  desenharTabelaDespesas,
  desenharResumoFinanceiro,
  desenharAssinaturas
} from './pdf/pdfTabelasServico';
import { prepararImagemParaPdf, desenharImagemProporcional } from './pdf/pdfImageHelper';
import { prepararEmpresaComLogoParaPdf } from './pdf/pdfServicoDataHelper';
import { salvarPdf } from './pdf/pdfExportHelper';

function desenharSecaoFotos(
  doc: jsPDF,
  servico: ServicoHorimetro,
  startY: number,
  fotoIni: string | null,
  fotoFim: string | null,
  fotoCupom: string | null
): number {
  const pMaq = servico.maquinas_itens?.[0];
  const hIni = pMaq && Number(pMaq.horimetro_inicial) > 0 ? Number(pMaq.horimetro_inicial) : Number(servico.horimetro_inicial || 0);
  const hFim = pMaq && pMaq.horimetro_final !== undefined ? Number(pMaq.horimetro_final) : Number(servico.horimetro_final || 0);

  if (!fotoIni && !fotoFim && !fotoCupom) return startY;

  const yTitulo = startY + 3;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('COMPROVAÇÃO FOTOGRÁFICA DE CAMPO:', 14, yTitulo);

  const yFoto = yTitulo + 2;
  const fotoHeight = 44;

  if (fotoIni && fotoFim && fotoCupom) {
    const w = 57;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text(`1. Horímetro Inicial (${hIni.toFixed(1)} h)`, 14, yFoto + 3);
    desenharImagemProporcional(doc, fotoIni, 14, yFoto + 4.5, w, fotoHeight);

    doc.text(`2. Horímetro Final (${hFim.toFixed(1)} h)`, 76, yFoto + 3);
    desenharImagemProporcional(doc, fotoFim, 76, yFoto + 4.5, w, fotoHeight);

    doc.text(`3. Cupom Combustível`, 138, yFoto + 3);
    desenharImagemProporcional(doc, fotoCupom, 138, yFoto + 4.5, w, fotoHeight);
    return yFoto + 4.5 + fotoHeight + 4;
  }

  const w = 87;
  if (fotoIni) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text(`1. Horímetro Inicial: ${hIni.toFixed(1)} h`, 14, yFoto + 3.5);
    desenharImagemProporcional(doc, fotoIni, 14, yFoto + 5, w, fotoHeight);
  }
  if (fotoFim) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text(`2. Horímetro Final: ${hFim.toFixed(1)} h`, 108, yFoto + 3.5);
    desenharImagemProporcional(doc, fotoFim, 108, yFoto + 5, w, fotoHeight);
  }
  return yFoto + 5 + fotoHeight + 4;
}

export async function gerarRelatorioServicoPDF(servico: ServicoHorimetro): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = await prepararEmpresaComLogoParaPdf();

  desenharCabecalhoPrincipal(doc, empresa);
  desenharBoxIdentificacao(doc, servico);

  const finalMedicaoY = desenharTabelaMedicao(doc, servico);
  const finalDespesasY = desenharTabelaDespesas(doc, servico, finalMedicaoY);
  const finalResumoY = desenharResumoFinanceiro(doc, servico, finalDespesasY);

  const pMaq = servico.maquinas_itens?.[0];
  const urlIni = servico.foto_horimetro_inicial || pMaq?.foto_horimetro_inicial;
  const urlFim = servico.foto_horimetro_final || pMaq?.foto_horimetro_final;
  const urlCupom = servico.foto_cupom_combustivel;

  const [fotoIni, fotoFim, fotoCupom] = await Promise.all([
    prepararImagemParaPdf(urlIni),
    prepararImagemParaPdf(urlFim),
    prepararImagemParaPdf(urlCupom)
  ]);

  const finalFotosY = desenharSecaoFotos(doc, servico, finalResumoY + 2, fotoIni, fotoFim, fotoCupom);

  const yAssinatura = Math.max(250, Math.min(260, finalFotosY + 12));
  desenharAssinaturas(doc, yAssinatura);
  aplicarRodapeTodasPaginas(doc);

  const nomeArquivo = `Boletim_Interno_${(servico.cliente_nome || 'Servico').replace(/\s+/g, '_')}_${servico.id.slice(0, 6)}.pdf`;
  salvarPdf(doc, nomeArquivo);
}
