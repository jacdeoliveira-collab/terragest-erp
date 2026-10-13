import type { UnidadeMedidaMaterial } from '../types/almoxarifado.types';

export interface ProdutoDanfeExtraido {
  nome: string;
  unidade?: UnidadeMedidaMaterial;
  quantidade?: number;
  valorTotal?: number;
}

/** Extrai a chave de acesso de 44 dígitos da NF-e */
export function extrairChaveAcessoDanfe(t: string): string | undefined {
  const matchEspacada = t.match(/\b(?:\d{4}[\s\-]?){10}\d{4}\b/);
  if (matchEspacada) {
    const limpa = matchEspacada[0].replace(/[\s\-]/g, '');
    if (limpa.length === 44) return limpa;
  }
  const matchContigua = t.match(/\b\d{44}\b/);
  return matchContigua ? matchContigua[0] : undefined;
}

/** Extrai o número da NF-e (usando a chave de 44 dígitos como fonte primária confiável) */
export function extrairNumeroNfDanfe(t: string): string | undefined {
  const chave = extrairChaveAcessoDanfe(t);
  if (chave && chave.length === 44) {
    const numDaChave = parseInt(chave.slice(25, 34), 10);
    if (!isNaN(numDaChave) && numDaChave > 0) return `NF-${numDaChave}`;
  }
  const matchNum = t.match(/(?:N[ºo\.:\s]+|NOTA\s+FISCAL\s+N[ºo\.:\s]*)(\d{1,3}(?:\.\d{3})*|\d{1,9})\s*(?:S[EÉ]RIE|\n|\r)/i);
  if (matchNum) {
    const numLimpo = parseInt(matchNum[1].replace(/\./g, ''), 10);
    if (!isNaN(numLimpo) && numLimpo > 0) return `NF-${numLimpo}`;
  }
  return undefined;
}

/** Extrai o nome do fornecedor/emitente sem capturar textos do canhoto */
export function extrairEmitenteDanfe(t: string): string | undefined {
  const matchCanhoto = t.match(/RECEBEMOS\s+DE\s+([A-Z0-9\s\.\-&/]+?)\s+(?:OS\s+PRODUTOS|CONSTANTES|A\s+NOTA|DA\s+NOTA)/i);
  if (matchCanhoto) {
    const nome = matchCanhoto[1].trim().replace(/^[\s\:\.\-]+/, '');
    if (nome.length >= 3 && !/RECEBIMENTO|COMPROVANTE|PROTOCOLO/i.test(nome)) return nome.slice(0, 80);
  }
  const matchEmitente = t.match(/IDENTIFICA[CÇ][AÃ]O\s+DO\s+EMITENTE[\s\:\.\-]*\n*([A-Z0-9\s\.\-&/]{4,70})/i);
  if (matchEmitente) {
    const limpo = matchEmitente[1].trim();
    if (limpo.length >= 3 && !/DANFE|DOCUMENTO|RECEBIMENTO/i.test(limpo)) return limpo.slice(0, 80);
  }
  const matchRazao = t.match(/\b([A-Z0-9\s\.\-&]{4,60}\s+(?:LTDA|S\/A|S\.A\.|EIRELI|ME|EPP))\b/i);
  if (matchRazao && !/RECEBIMENTO|COMPROVANTE/i.test(matchRazao[1])) return matchRazao[1].trim();
  return undefined;
}

/** Extrai o valor total da nota fiscal procurando no quadro de cálculo do imposto */
export function extrairValorTotalDanfe(t: string): number | undefined {
  const matchDireto = t.match(/(?:VALOR\s+TOTAL\s+DA\s+NOTA|V\.\s*TOTAL\s+DA\s+NOTA|VALOR\s+TOTAL)[\s\:\$R]*([\d\.]+,\d{2})/i);
  if (matchDireto) {
    const v = parseFloat(matchDireto[1].replace(/\./g, '').replace(',', '.'));
    if (!isNaN(v) && v > 0) return v;
  }
  const blocoImposto = t.match(/C[AÁ]LCULO\s+DO\s+IMPOSTO([\s\S]{50,600}?)(?:TRANSPORTADOR|DADOS\s+DO\s+PRODUTO|$)/i);
  if (blocoImposto) {
    const valores = [...blocoImposto[1].matchAll(/([\d\.]+,\d{2})/g)];
    if (valores.length > 0) {
      const ult = valores[valores.length - 1][1];
      const v = parseFloat(ult.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(v) && v > 0) return v;
    }
  }
  return undefined;
}

export function extrairEquipamentoMencionado(t: string): string | undefined {
  const match = t.match(/(?:APLICAR\s+NA|APLICADO\s+NA|M[AÁ]QUINA|PLACA)[\s\:\.\-]*([A-Z0-9\-\s]{3,20})/i);
  if (match) {
    const maq = match[1].trim();
    if (maq.length > 2 && !/PRODUTO|SERVI[CÇ]O/i.test(maq)) return maq;
  }
  return undefined;
}

/** Extrai produtos/itens reais listados na DANFE sem dados mockados */
export function extrairProdutosPecasDanfe(t: string): ProdutoDanfeExtraido[] {
  const produtos: ProdutoDanfeExtraido[] = [];
  const blocoProdutos = t.match(/(?:DADOS\s+DO[S]?\s+PRODUTO[S]?|C[OÓ]DIGO\s+DESCRI[CÇ][AÃ]O)([\s\S]{30,1200}?)(?:C[AÁ]LCULO\s+DO\s+ISSQN|DADOS\s+ADICIONAIS|$)/i);
  if (!blocoProdutos) return produtos;

  const linhas = blocoProdutos[1].split('\n').map((l) => l.trim()).filter((l) => l.length > 5);
  for (const linha of linhas) {
    if (/^(?:NCM|CST|CFOP|UNID|VALOR|BASE)/i.test(linha)) continue;
    const matchItem = linha.match(/([A-Z0-9\s\.\-\/]{4,50})\s+(UN|PC|P[CÇ]A|KG|TON|LT|L|M3|M|SC)\s+([\d\.]+,\d{1,3}|\d+)/i);
    if (matchItem) {
      const q = parseFloat(matchItem[3].replace(/\./g, '').replace(',', '.'));
      produtos.push({
        nome: matchItem[1].trim(),
        unidade: mapearUnidadeDanfe(matchItem[2]),
        quantidade: !isNaN(q) && q > 0 ? q : undefined
      });
    }
  }
  return produtos;
}

function mapearUnidadeDanfe(un: string): UnidadeMedidaMaterial {
  const u = un.toUpperCase().trim();
  if (u === 'KG') return 'KG';
  if (u === 'TON' || u === 'TN') return 'TON';
  if (u === 'M3') return 'M3';
  if (u === 'LT' || u === 'L') return 'LITRO';
  if (u === 'SC') return 'SACO';
  return 'UN';
}
