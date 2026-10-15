import type { TipoCombustivel } from '../types/abastecimento.types';
import type { FormaPagamentoDespesa } from '../types/contasPagar.types';

export interface ItemCupomExtraido {
  tipo: TipoCombustivel;
  litros: number;
  valorTotal: number;
  valorUnitario?: number;
}

export interface DadosCupomExtraidos {
  postoFornecedor?: string;
  data?: string;
  tipoCombustivel?: TipoCombustivel;
  litros?: number;
  valorTotal?: number;
  valorUnitario?: number;
  numeroDocumento?: string;
  cnpj?: string;
  chaveAcesso?: string;
  formaPagamento?: FormaPagamentoDespesa;
  itens?: ItemCupomExtraido[];
  textoBruto: string;
}

function extrairData(texto: string): string | undefined {
  const t = texto.replace(/(\d)[Oo](\d)/g, '$10$2');
  const matchEm = t.match(/Em\s*(\d{1,2})\s*[\/\-\.\s]\s*(\d{1,2})\s*[\/\-\.\s]\s*(\d{2,4})/i);
  if (matchEm) {
    let a = matchEm[3];
    if (a.length === 2) a = `20${a}`;
    return `${a}-${matchEm[2].padStart(2, '0')}-${matchEm[1].padStart(2, '0')}`;
  }
  const matchData = t.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](202\d|\d{2})\b/i);
  if (matchData) {
    let a = matchData[3];
    if (a.length === 2) a = `20${a}`;
    return `${a}-${matchData[2].padStart(2, '0')}-${matchData[1].padStart(2, '0')}`;
  }
  return undefined;
}

function parseNum(val: string): number {
  return parseFloat(val.replace(/\s/g, '').replace(/\./g, '').replace(',', '.'));
}

function extrairItens(linhas: string[]): ItemCupomExtraido[] {
  const itens: ItemCupomExtraido[] = [];
  for (const l of linhas) {
    const isS10 = /(?:DIESEL[\s\-]*S[\s\-]*10|S[\s\-]*10\b)/i.test(l);
    const isComum = /(?:DIESEL[\s\-]*COMUM|DIESEL[\s\-]*S[\s\-]*500|S[\s\-]*500\b|COMUM\b)/i.test(l);
    if (!isS10 && !isComum) continue;

    const tipo: TipoCombustivel = isS10 ? 'DIESEL_S10' : 'DIESEL_S500';
    const numMatches = l.match(/\b\d{1,4}(?:[\.,]\d{1,3})*\b/g) || [];
    const nums = numMatches.map((n) => parseFloat(n.replace(',', '.'))).filter((n) => !isNaN(n) && n > 0);

    let litros = 0;
    let valorTotal = 0;
    let valorUnitario: number | undefined;

    const litrosMatch = l.match(/(\d+[\.,]\d{1,2})\s*(?:litros|l\b)/i) || l.match(/(?:litros|l\b)[^\d]*(\d+[\.,]\d{1,2})/i);
    if (litrosMatch) litros = parseFloat(litrosMatch[1].replace(',', '.'));

    const precoMatch = l.match(/(?:r\$\s*)?([678][\.,]\d{2})\b/i);
    if (precoMatch) valorUnitario = parseFloat(precoMatch[1].replace(',', '.'));

    const totalMatch = l.match(/(?:r\$\s*)(\d{1,4}(?:[\.,]\d{3})*[\.,]\d{2})\b/i);
    if (totalMatch) valorTotal = parseNum(totalMatch[1]);

    if (!valorTotal && nums.length >= 2) {
      const sorted = [...nums].sort((a, b) => b - a);
      valorTotal = sorted[0];
      if (!litros && sorted[1]) litros = sorted[1];
    } else if (!litros && valorTotal && valorUnitario && valorUnitario > 0) {
      litros = parseFloat((valorTotal / valorUnitario).toFixed(2));
    }

    if (litros > 0 || valorTotal > 0) {
      itens.push({ tipo, litros: litros || 0, valorTotal: valorTotal || 0, valorUnitario });
    }
  }
  return itens;
}

export function analisarTextoCupom(texto: string): DadosCupomExtraidos {
  const dados: DadosCupomExtraidos = { textoBruto: texto, itens: [] };
  if (!texto || texto.trim().length === 0) return dados;

  const linhas = texto.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  // 1. Posto Fornecedor
  const lPosto = linhas.find((l) => /(posto|auto\s*posto|combust|l[1ií]der|vasconcelos)/i.test(l));
  if (lPosto) {
    let nome = lPosto.replace(/[^a-zA-Z0-9\s\.\-]/g, '').trim().slice(0, 50);
    if (/l[1ií]der\s*0?3\b/i.test(texto)) nome = 'POSTO LIDER 03';
    else if (/l[1ií]der\s*(?:ii|11|2)\b/i.test(texto)) nome = 'POSTO LIDER II';
    dados.postoFornecedor = nome;
  }

  // 2. Chave de acesso / Número NFC-e
  const chv = texto.match(/(\d{4}[\s\n]*\d{4}[\s\n]*\d{4}[\s\n]*\d{4}[\s\n]*\d{4}[\s\n]*\d{4}[\s\n]*\d{4}[\s\n]*\d{4}[\s\n]*\d{4}[\s\n]*\d{4}[\s\n]*\d{4})/);
  if (chv) dados.chaveAcesso = chv[0].replace(/\D/g, '');
  const nf = texto.match(/NFC-?[ea]?\s*n?[ºo]?\s*(\d{1,3}\.?\d{3}\.?\d{3}|\d{3,9})/i);
  if (nf) dados.numeroDocumento = `NFC-e ${nf[1].replace(/\./g, '')}`;

  // 3. Data e Forma de Pagamento
  dados.data = extrairData(texto);
  if (/PIX/i.test(texto)) dados.formaPagamento = 'PIX';
  else if (/CART[AÃ]O|CREDITO|DEBITO/i.test(texto)) dados.formaPagamento = 'CARTAO';
  else if (/BOLETO/i.test(texto)) dados.formaPagamento = 'BOLETO';
  else if (/DINHEIRO|ESPECIE/i.test(texto)) dados.formaPagamento = 'OUTRO';

  // 4. Valor Total
  const matchTotal = texto.match(/TOTAL\s*(?:R\$\s*)?(\d{1,4}(?:[\.,]\d{3})*[\.,]\d{2})/i);
  if (matchTotal) {
    dados.valorTotal = parseNum(matchTotal[1]);
  } else {
    const lSemTrib = linhas.filter((l) => !/TRIB|IBPT|IMPOSTO|APROX|ICMS|BASE/i.test(l));
    const cands: number[] = [];
    for (const l of lSemTrib) {
      const ms = l.match(/\b\d{1,4}(?:[\.,]\d{3})*[\.,]\d{2}\b/g) || [];
      for (const m of ms) {
        const num = parseNum(m);
        if (!isNaN(num) && num > 10 && num < 100000) cands.push(num);
      }
    }
    if (cands.length > 0) dados.valorTotal = Math.max(...cands);
  }

  // 5. Itens de Combustível
  dados.itens = extrairItens(linhas);
  if (dados.itens.length > 0) {
    dados.tipoCombustivel = dados.itens[0].tipo;
    dados.litros = dados.itens[0].litros;
    if (!dados.valorTotal) {
      dados.valorTotal = parseFloat(dados.itens.reduce((acc, it) => acc + it.valorTotal, 0).toFixed(2));
    }
  }

  return dados;
}
