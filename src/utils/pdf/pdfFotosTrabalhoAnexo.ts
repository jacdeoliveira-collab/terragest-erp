import type jsPDF from 'jspdf';
import type { ServicoHorimetro } from '../../types/servicoHorimetro.types';
import { prepararImagemParaPdf } from './pdfImageHelper';

function desenharCardFoto(
  doc: jsPDF,
  imgBase64: string,
  titulo: string,
  legenda: string,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  try {
    doc.setDrawColor(209, 213, 219);
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, w, h + 10, 'FD');
    doc.addImage(imgBase64, 'JPEG', x + 1, y + 1, w - 2, h - 2);

    doc.setFillColor(243, 244, 246);
    doc.rect(x, y + h, w, 10, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.line(x, y + h, x + w, y + h);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(titulo, x + 2, y + h + 4);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    const splitLegenda = doc.splitTextToSize(legenda, w - 4);
    doc.text(splitLegenda[0] || '', x + 2, y + h + 8);
  } catch (e) {
    console.warn('Erro ao desenhar card de foto no PDF:', e);
  }
}

function iniciarPaginaAnexo(doc: jsPDF, servico: ServicoHorimetro): void {
  doc.addPage();
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 6, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('COMPROVAÇÃO FOTOGRÁFICA: HORÍMETRO & EXECUÇÃO DO TRABALHO', 14, 15);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Registros fotográficos do horímetro da máquina e atividades de campo • Cliente: ${servico.cliente_nome}`, 14, 20);

  doc.setDrawColor(229, 231, 235);
  doc.line(14, 23, 196, 23);
}

export async function desenharFotosTrabalho(doc: jsPDF, servico: ServicoHorimetro): Promise<void> {
  const pMaq = servico.maquinas_itens?.[0];
  const urlIni = servico.foto_horimetro_inicial || pMaq?.foto_horimetro_inicial;
  const urlFim = servico.foto_horimetro_final || pMaq?.foto_horimetro_final;
  const fotosAtividade = servico.fotos_trabalho || [];

  const [fotoIni, fotoFim] = await Promise.all([
    prepararImagemParaPdf(urlIni),
    prepararImagemParaPdf(urlFim)
  ]);

  const fotosAtivCarregadas = await Promise.all(
    fotosAtividade.map(async (f) => ({
      legenda: f.legenda || 'Execução de serviço em campo',
      base64: await prepararImagemParaPdf(f.url)
    }))
  );
  const ativValidas = fotosAtivCarregadas.filter((f) => f.base64);

  if (!fotoIni && !fotoFim && ativValidas.length === 0) return;

  iniciarPaginaAnexo(doc, servico);
  let currentY = 27;

  // 1. Fotos do Horímetro (Painel)
  if (fotoIni || fotoFim) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('1. REGISTRO FOTOGRÁFICO DO HORÍMETRO (PAINEL DA MÁQUINA)', 14, currentY);
    currentY += 4;

    const wCard = 88;
    const hCard = 54;
    const hIniVal = Number(servico.horimetro_inicial || pMaq?.horimetro_inicial || 0).toFixed(1);
    const hFimVal = servico.horimetro_final !== undefined
      ? Number(servico.horimetro_final).toFixed(1)
      : (pMaq?.horimetro_final !== undefined ? Number(pMaq.horimetro_final).toFixed(1) : '-');

    if (fotoIni) {
      desenharCardFoto(doc, fotoIni, `HORÍMETRO INICIAL: ${hIniVal} h`, 'Painel na abertura da medição', 14, currentY, wCard, hCard);
    }
    if (fotoFim) {
      desenharCardFoto(doc, fotoFim, `HORÍMETRO FINAL: ${hFimVal} h`, 'Painel no encerramento da medição', 108, currentY, wCard, hCard);
    }
    currentY += hCard + 16;
  }

  // 2. Fotos da Atividade em Campo
  if (ativValidas.length > 0) {
    if (currentY + 68 > 275) {
      iniciarPaginaAnexo(doc, servico);
      currentY = 27;
    }

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('2. FOTOS DA EXECUÇÃO E ANDAMENTO DA ATIVIDADE EM CAMPO', 14, currentY);
    currentY += 4;

    ativValidas.slice(0, 4).forEach((item, idx) => {
      if (currentY + 64 > 280) {
        iniciarPaginaAnexo(doc, servico);
        currentY = 27;
      }
      const x = idx % 2 === 0 ? 14 : 108;
      const y = currentY;
      desenharCardFoto(doc, item.base64!, `Foto ${idx + 1} - Atividade em Campo`, item.legenda, x, y, 88, 52);
      if (idx % 2 === 1 || idx === ativValidas.length - 1) {
        currentY += 66;
      }
    });
  }
}
