import type jsPDF from 'jspdf';
import type { Orcamento } from '../../types/comercial.types';
import { obterMetadataBanco } from '../bancosProvidersCatalog';
import type { AsaasConfig } from '../../types/asaas.types';

export interface DadosPagamentoPdf {
  prazo?: string;
  forma?: string;
  banco?: string;
  titular?: string;
  chavePix?: string;
}

export function obterDadosPlanilhaBancoCache(): { banco?: string; titular?: string; chavePix?: string } {
  if (typeof window === 'undefined') return {};
  try {
    const activeTenant = localStorage.getItem('terragest_tenant_ativo_id');
    const raw = (activeTenant && localStorage.getItem(`terragest_asaas_config_${activeTenant}`)) || localStorage.getItem('terragest_asaas_config');
    if (!raw) return {};
    const cfg = JSON.parse(raw) as AsaasConfig;
    const meta = obterMetadataBanco(cfg.provider);
    const nomeBanco = cfg.provider === 'OUTRO_BANCO' && cfg.nomeBancoCustom ? cfg.nomeBancoCustom : meta.nome;
    const agConta = [cfg.agenciaCustom ? `Ag: ${cfg.agenciaCustom}` : '', cfg.contaCustom ? `CC: ${cfg.contaCustom}` : ''].filter(Boolean).join(' / ');
    return {
      banco: [nomeBanco, agConta].filter(Boolean).join(' • '),
      titular: cfg.accountName || undefined,
      chavePix: cfg.chavePix ? `${cfg.tipoChavePix ? `(${cfg.tipoChavePix}) ` : ''}${cfg.chavePix}` : undefined
    };
  } catch {
    return {};
  }
}

/** Desenha o quadro de pagamento usando apenas dados reais; linhas sem dado são omitidas. */
export function desenharBlocoPagamentoPix(doc: jsPDF, dados: DadosPagamentoPdf, startY: number): number {
  const linhas: Array<[string, string]> = [];
  const condicao = [dados.prazo, dados.forma ? `(${dados.forma})` : ''].filter(Boolean).join(' ');
  if (condicao) linhas.push(['Condição / Prazo:', condicao]);
  const conta = [dados.banco, dados.titular ? `Titular: ${dados.titular}` : ''].filter(Boolean).join(' • ');
  if (conta) linhas.push(['Banco / Conta:', conta]);
  if (linhas.length === 0 && !dados.chavePix) return startY;

  const boxHeight = 12 + linhas.length * 5 + (dados.chavePix ? 7 : 0);
  doc.setDrawColor(16, 185, 129);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, startY, 182, boxHeight, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text('DADOS BANCÁRIOS, PRAZO & CHAVE PIX PARA PAGAMENTO', 18, startY + 6);

  doc.setFontSize(7.5);
  let y = startY + 12;
  linhas.forEach(([rotulo, valor]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(rotulo, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.text(valor, 48, y);
    y += 5;
  });

  if (dados.chavePix) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(18, y - 2.5, 174, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`CHAVE PIX PARA TRANSFERÊNCIA: ${dados.chavePix}`, 22, y + 1);
  }
  return startY + boxHeight + 4;
}

export function desenharBlocoPagamentoPixOrcamento(doc: jsPDF, orc: Orcamento, startY: number): number {
  const plan = obterDadosPlanilhaBancoCache();
  return desenharBlocoPagamentoPix(doc, {
    prazo: orc.prazo_descricao,
    forma: orc.forma_pagamento,
    banco: orc.conta_bancaria_banco || plan.banco,
    titular: orc.conta_bancaria_nome || plan.titular,
    chavePix: orc.conta_bancaria_pix || orc.chave_pix_manual || plan.chavePix
  }, startY);
}
