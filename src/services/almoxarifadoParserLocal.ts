import type { TipoMovimentacaoAlmoxarifado, UnidadeMedidaMaterial } from '../types/almoxarifado.types';
import {
  extrairEmitenteDanfe,
  extrairNumeroNfDanfe,
  extrairChaveAcessoDanfe,
  extrairValorTotalDanfe,
  extrairEquipamentoMencionado,
  extrairProdutosPecasDanfe
} from './danfeParserHelpers';

export interface DadosNfAlmoxarifadoExtraidos {
  tipoMovimentacao?: TipoMovimentacaoAlmoxarifado;
  data?: string;
  fornecedorNome?: string;
  numeroNf?: string;
  materialNome?: string;
  unidadeMedida?: UnidadeMedidaMaterial;
  quantidade?: number;
  valorTotal?: number;
  chaveAcesso?: string;
  equipamentoDestino?: string;
  ticketBalancaNumero?: string;
  pesoBrutoKg?: number;
  taraKg?: number;
  pesoLiquidoKg?: number;
  observacoes?: string;
  textoBruto: string;
}

function extrairDataNf(t: string): string | undefined {
  const regexKey = /(?:DATA\s+DA\s+EMISS[AÃ]O|EMISS[AÃ]O|DATA\s+ENTRADA|DT\.?\s*EMISS[AÃ]O)[\s\:\.\-]*(\d{1,2})[\s\/\.\-\|\\]+(\d{1,2})[\s\/\.\-\|\\]+(\d{2,4})/i;
  const matchKey = t.match(regexKey);
  if (matchKey) {
    const d = parseInt(matchKey[1], 10);
    const m = parseInt(matchKey[2], 10);
    let a = matchKey[3];
    if (a.length === 2) a = `20${a}`;
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      return `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return undefined;
}

function extrairInsumosPorPalavraChave(t: string): { material?: string; unidade?: UnidadeMedidaMaterial } {
  // Ignora substrings em palavras como RECEBIMENTO, FORNECIMENTO
  const textoLimpo = t.replace(/\b(?:RECEBIMENTO|FORNECIMENTO|VENCIMENTO)\b/gi, '');
  if (/\bBRITA\s*1\b/i.test(textoLimpo)) return { material: 'Brita 1', unidade: 'TON' };
  if (/\bBRITA\s*0\b|\bPEDRISCO\b/i.test(textoLimpo)) return { material: 'Brita 0 (Pedrisco)', unidade: 'TON' };
  if (/\bBRITA\s*2\b/i.test(textoLimpo)) return { material: 'Brita 2', unidade: 'TON' };
  if (/\bBGS\b|\bBRITA\s+GRADUADA\b/i.test(textoLimpo)) return { material: 'Brita Graduada (BGS)', unidade: 'TON' };
  if (/\bRACH[AÃ]O\b/i.test(textoLimpo)) return { material: 'Rachão de Pedra', unidade: 'TON' };
  if (/\bAREIA\b/i.test(textoLimpo)) return { material: 'Areia', unidade: 'M3' };
  if (/\bCIMENTO\b/i.test(textoLimpo)) return { material: 'Cimento', unidade: 'SACO' };
  if (/\bCBUQ\b|\bMASSA\s+ASF[AÁ]LTICA\b/i.test(textoLimpo)) return { material: 'CBUQ (Massa Asfáltica)', unidade: 'TON' };
  if (/\bEMULS[AÃ]O\b/i.test(textoLimpo)) return { material: 'Emulsão Asfáltica', unidade: 'TON' };
  if (/\bA[CÇ]O\s+CA-?(?:50|60)\b/i.test(textoLimpo)) return { material: 'Aço CA-50/60', unidade: 'KG' };
  return {};
}

export function analisarNfAlmoxarifado(texto: string): DadosNfAlmoxarifadoExtraidos {
  const dados: DadosNfAlmoxarifadoExtraidos = { tipoMovimentacao: 'ENTRADA', textoBruto: texto };
  if (!texto || texto.trim().length === 0) return dados;
  const t = texto.replace(/(\d)[Oo](\d)/g, '$10$2');

  dados.data = extrairDataNf(t);
  dados.chaveAcesso = extrairChaveAcessoDanfe(t);
  dados.numeroNf = extrairNumeroNfDanfe(t);
  dados.valorTotal = extrairValorTotalDanfe(t);
  dados.fornecedorNome = extrairEmitenteDanfe(t);
  dados.equipamentoDestino = extrairEquipamentoMencionado(t);

  // 1. Extração dos produtos reais descritos na DANFE (Sem Mocks)
  const pecas = extrairProdutosPecasDanfe(t);
  if (pecas.length > 0) {
    dados.materialNome = pecas.map((p) => p.nome).join(' | ');
    if (pecas[0].unidade) dados.unidadeMedida = pecas[0].unidade;
    const qtdTotal = pecas.reduce((acc, p) => acc + (p.quantidade || 0), 0);
    if (qtdTotal > 0) dados.quantidade = qtdTotal;
  } else {
    // 2. Fallback somente com palavras-chave reais e fronteira de palavra
    const insumo = extrairInsumosPorPalavraChave(t);
    if (insumo.material) {
      dados.materialNome = insumo.material;
      if (insumo.unidade) dados.unidadeMedida = insumo.unidade;
    }
  }

  // 3. Ticket Balança / Pesagem rodoviária (se for nota de pedreira/usina)
  const matchTicket = t.match(/(?:TICKET|BILHETE|PESAGEM)[:\.\s]*N?[ºo]?\s*(\d{2,8})/i);
  if (matchTicket) dados.ticketBalancaNumero = matchTicket[1];

  const matchLiq = t.match(/(?:L[IÍ]QUIDO|PESO\s+L[IÍ]Q(?:UIDO)?)[:\.\s]*([\d\.]+,\d{2,3})/i);
  if (matchLiq) {
    const valLiq = parseFloat(matchLiq[1].replace(/\./g, '').replace(',', '.'));
    if (!isNaN(valLiq) && valLiq > 0) {
      dados.pesoLiquidoKg = valLiq;
      if (!dados.quantidade) {
        dados.quantidade = parseFloat((valLiq / 1000).toFixed(3));
        dados.unidadeMedida = 'TON';
      }
    }
  }

  // 4. Quantidade direta na nota se ainda não encontrada
  if (!dados.quantidade) {
    const matchQtd = t.match(/(?:QUANT(?:IDADE)?|QTD)[\s\:\.\-]*([\d\.]+,\d{1,3})/i);
    if (matchQtd) {
      const q = parseFloat(matchQtd[1].replace(/\./g, '').replace(',', '.'));
      if (!isNaN(q) && q > 0) dados.quantidade = q;
    }
  }

  // 5. Montagem de Observação descritiva
  const obsPartes: string[] = [];
  if (dados.valorTotal) obsPartes.push(`Valor NF: R$ ${dados.valorTotal.toFixed(2)}`);
  if (dados.equipamentoDestino) obsPartes.push(`Destino: ${dados.equipamentoDestino}`);
  if (dados.chaveAcesso) obsPartes.push(`Chave: ${dados.chaveAcesso}`);
  if (obsPartes.length > 0) dados.observacoes = obsPartes.join(' | ');

  return dados;
}
