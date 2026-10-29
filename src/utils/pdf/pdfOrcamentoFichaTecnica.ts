import type jsPDF from 'jspdf';
import type { Orcamento } from '../../types/comercial.types';

export function desenharFichaTecnicaMaquinaNoPdf(doc: jsPDF, orc: Orcamento, startY: number): number {
  if (!orc.maquina_nome && !orc.maquina_codigo && !orc.maquina_modelo) {
    return startY;
  }

  const boxX = 14;
  const boxW = 182;
  const boxH = 26;

  // Box com borda sutil
  doc.setDrawColor(217, 119, 6);
  doc.setFillColor(254, 252, 232); // amber-50
  doc.roundedRect(boxX, startY, boxW, boxH, 2, 2, 'FD');

  // Cabeçalho da Ficha Técnica
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('DADOS TÉCNICOS DO EQUIPAMENTO / LINHA AMARELA:', boxX + 4, startY + 5.5);

  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);

  // Linha 1: Equipamento & Modelo
  doc.setFont('helvetica', 'bold');
  doc.text('Equipamento:', boxX + 4, startY + 11);
  doc.setFont('helvetica', 'normal');
  const nomeCompleto = `${orc.maquina_codigo ? `[${orc.maquina_codigo}] ` : ''}${orc.maquina_nome || 'Máquina'}`;
  doc.text(nomeCompleto, boxX + 26, startY + 11);

  doc.setFont('helvetica', 'bold');
  doc.text('Modelo:', boxX + 110, startY + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(orc.maquina_modelo || 'Padrão Fabricante', boxX + 124, startY + 11);

  // Linha 2: Potência, Ano e Horímetro Inicial
  doc.setFont('helvetica', 'bold');
  doc.text('Potência:', boxX + 4, startY + 17);
  doc.setFont('helvetica', 'normal');
  const potencia = orc.maquina_potencia ? `${orc.maquina_potencia} HP / CV` : 'Conforme Fabricante';
  doc.text(potencia, boxX + 20, startY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Ano Fab.:', boxX + 66, startY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(String(orc.maquina_ano || 'N/A'), boxX + 82, startY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Horímetro de Saída:', boxX + 110, startY + 17);
  doc.setFont('helvetica', 'normal');
  const horim = orc.maquina_horimetro_atual !== undefined ? `${Number(orc.maquina_horimetro_atual).toFixed(1)} h` : '0.0 h';
  doc.text(horim, boxX + 142, startY + 17);

  // Linha 3: Chassi / Série & Combustível
  doc.setFont('helvetica', 'bold');
  doc.text('Chassi / Série / Placa:', boxX + 4, startY + 23);
  doc.setFont('helvetica', 'normal');
  const idChassi = [orc.maquina_serie, orc.maquina_placa].filter(Boolean).join(' • ') || 'Conforme Nota de Entrega';
  doc.text(idChassi, boxX + 38, startY + 23);

  doc.setFont('helvetica', 'bold');
  doc.text('Combustível / Tanque:', boxX + 110, startY + 23);
  doc.setFont('helvetica', 'normal');
  const tanqueInfo = [orc.maquina_combustivel?.replace('_', ' '), orc.maquina_capacidade_tanque ? `${orc.maquina_capacidade_tanque}L` : null]
    .filter(Boolean)
    .join(' - ') || 'Diesel Linha Amarela';
  doc.text(tanqueInfo, boxX + 146, startY + 23);

  return startY + boxH + 4;
}
