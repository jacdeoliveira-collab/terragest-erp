import type jsPDF from 'jspdf';
import type { Orcamento } from '../../types/comercial.types';

export function desenharFichaTecnicaMaquinaNoPdf(doc: jsPDF, orc: Orcamento, startY: number): number {
  const det = orc.detalhes_proposta;
  const itens = det?.maquinas_itens || [];
  const primItem = itens[0];

  const temMaquina = Boolean(
    orc.maquina_nome || orc.maquina_codigo || orc.maquina_modelo || primItem?.maquina_nome
  );
  if (!temMaquina) return startY;

  const boxX = 14;
  const boxW = 182;
  const boxH = 30;

  doc.setDrawColor(217, 119, 6);
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(boxX, startY, boxW, boxH, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  const tituloFicha = itens.length > 1
    ? `FICHA TÉCNICA DO MAQUINÁRIO ALOCADO (${itens.length} EQUIPAMENTOS NA PROPOSTA):`
    : 'FICHA TÉCNICA DO EQUIPAMENTO / MAQUINÁRIO LINHA AMARELA:';
  doc.text(tituloFicha, boxX + 4, startY + 5.5);

  doc.setFontSize(7.5);
  doc.setTextColor(31, 41, 55);

  const codigo = primItem?.maquina_codigo || orc.maquina_codigo || '';
  const nome = primItem?.maquina_nome || orc.maquina_nome || 'Equipamento Linha Amarela';
  const modelo = primItem?.maquina_modelo || orc.maquina_modelo || 'Padrão Fabricante';
  const implemento = primItem?.implemento || 'Concha Padrão';
  const potencia = primItem?.maquina_potencia || orc.maquina_potencia;
  const ano = primItem?.maquina_ano || orc.maquina_ano || 'N/A';
  const horimetro = primItem?.maquina_horimetro_saida ?? orc.maquina_horimetro_atual ?? 0;
  const chassi = primItem?.maquina_chassi || [orc.maquina_serie, orc.maquina_placa].filter(Boolean).join(' • ') || 'Conforme Entrega Técnica';
  const operador = primItem?.operador_nome || (det?.operador_incluso !== false ? 'Designado pela Locadora' : 'Por conta do Contratante');
  const franquia = primItem?.franquia_minima || 'Medição por Horímetro';

  // Linha 1: Equipamento, Modelo e Implemento
  doc.setFont('helvetica', 'bold');
  doc.text('Equipamento:', boxX + 4, startY + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${codigo ? `[${codigo}] ` : ''}${nome}`.slice(0, 42), boxX + 24, startY + 11);

  doc.setFont('helvetica', 'bold');
  doc.text('Marca/Modelo:', boxX + 95, startY + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(String(modelo).slice(0, 38), boxX + 117, startY + 11);

  // Linha 2: Implemento, Potência, Ano e Horímetro
  doc.setFont('helvetica', 'bold');
  doc.text('Implemento:', boxX + 4, startY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(String(implemento).slice(0, 38), boxX + 22, startY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Potência / Ano:', boxX + 95, startY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(`${potencia ? `${potencia} HP` : 'Padrão'} • Ano: ${ano}`, boxX + 117, startY + 17);

  doc.setFont('helvetica', 'bold');
  doc.text('Horímetro Saída:', boxX + 152, startY + 17);
  doc.setFont('helvetica', 'normal');
  doc.text(`${Number(horimetro).toFixed(1)} h`, boxX + 176, startY + 17);

  // Linha 3: Série/Chassi, Operador e Franquia
  doc.setFont('helvetica', 'bold');
  doc.text('Série / Chassi:', boxX + 4, startY + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(String(chassi).slice(0, 35), boxX + 25, startY + 23);

  doc.setFont('helvetica', 'bold');
  doc.text('Operador:', boxX + 95, startY + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(String(operador).slice(0, 35), boxX + 110, startY + 23);

  // Linha 4: Franquia e Tanque/Combustível
  doc.setFont('helvetica', 'bold');
  doc.text('Regra de Franquia:', boxX + 4, startY + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(String(franquia), boxX + 31, startY + 28);

  const tanqueInfo = [
    orc.maquina_combustivel?.replace('_', ' '),
    orc.maquina_capacidade_tanque ? `Tanque ${orc.maquina_capacidade_tanque}L` : null
  ].filter(Boolean).join(' • ') || 'Diesel S10 / S500';
  doc.setFont('helvetica', 'bold');
  doc.text('Combustível:', boxX + 95, startY + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(tanqueInfo, boxX + 115, startY + 28);

  return startY + boxH + 3;
}
