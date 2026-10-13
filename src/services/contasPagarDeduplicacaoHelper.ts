import type { ContaPagarItem } from '../types/contasPagar.types';

function normalizarTexto(txt?: string | null): string {
  return (txt || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function extrairTagRef(obs?: string | null): string | null {
  if (!obs) return null;
  const m = obs.match(/\[REF:([^\]]+)\]/);
  return m ? m[1] : null;
}

function extrairNomeOperador(desc?: string | null): string {
  if (!desc) return '';
  const m = desc.match(/Operador:\s*([^(]+)/i);
  return m ? normalizarTexto(m[1]) : normalizarTexto(desc);
}

export function deduplicarContasPagar(
  rawList: any[],
  obrasMap: Map<string, string>
): { lista: ContaPagarItem[]; idsParaExcluir: string[] } {
  const itens: ContaPagarItem[] = (rawList || []).map((raw) => ({
    ...raw,
    obra_nome: raw.obra_id ? obrasMap.get(raw.obra_id) || 'Canteiro de Obra' : 'Geral / Administrativo'
  }));

  const retidos: ContaPagarItem[] = [];
  const idsParaExcluir: string[] = [];

  for (const item of itens) {
    const refTag = extrairTagRef(item.observacoes);
    const descNorm = normalizarTexto(item.descricao);
    const fornNorm = normalizarTexto(item.fornecedor);
    const valor = Number(item.valor) || 0;
    const isSombraServicoCombustivel =
      item.categoria === 'COMBUSTIVEL' &&
      fornNorm.includes('posto de combustível / cupom fiscal') &&
      descNorm.startsWith('diesel máq/apoio');

    let duplicadoIdx = -1;

    for (let i = 0; i < retidos.length; i++) {
      const r = retidos[i];
      const rRef = extrairTagRef(r.observacoes);
      const rDesc = normalizarTexto(r.descricao);
      const rForn = normalizarTexto(r.fornecedor);
      const rValor = Number(r.valor) || 0;
      const rIsSombra =
        r.categoria === 'COMBUSTIVEL' &&
        rForn.includes('posto de combustível / cupom fiscal') &&
        rDesc.startsWith('diesel máq/apoio');

      // 1. Mesmo REF e mesma categoria
      if (refTag && rRef && refTag === rRef && item.categoria === r.categoria) {
        duplicadoIdx = i;
        break;
      }

      // 2. Duplicata de Cupom / Despesa com mesmo fornecedor, valor, categoria e descrição
      if (
        item.categoria === r.categoria &&
        Math.abs(valor - rValor) < 0.01 &&
        fornNorm === rForn &&
        (descNorm === rDesc || descNorm.includes(rForn))
      ) {
        duplicadoIdx = i;
        break;
      }

      // 3. Duplicata de Combustível Sombra (Serviço vs Posto Cupom / Abastecimento)
      if (
        item.categoria === 'COMBUSTIVEL' &&
        r.categoria === 'COMBUSTIVEL' &&
        Math.abs(valor - rValor) < 0.01 &&
        (isSombraServicoCombustivel || rIsSombra)
      ) {
        duplicadoIdx = i;
        break;
      }

      // 4. Duplicata de Folha de Operador com mesmo operador e mesmo valor
      if (
        item.categoria === 'FOLHA_RH' &&
        r.categoria === 'FOLHA_RH' &&
        Math.abs(valor - rValor) < 0.01 &&
        extrairNomeOperador(item.descricao) === extrairNomeOperador(r.descricao)
      ) {
        duplicadoIdx = i;
        break;
      }
    }

    if (duplicadoIdx >= 0) {
      const existente = retidos[duplicadoIdx];
      // Decide qual manter
      const substituir = deveSubstituir(existente, item);
      if (substituir) {
        if (existente.id) idsParaExcluir.push(existente.id);
        retidos[duplicadoIdx] = item;
      } else {
        if (item.id) idsParaExcluir.push(item.id);
      }
    } else {
      retidos.push(item);
    }
  }

  return { lista: retidos, idsParaExcluir };
}

function deveSubstituir(existente: ContaPagarItem, novo: ContaPagarItem): boolean {
  // Se o existente for registro sombra de serviço e o novo for cupom de posto real, substituir
  const existForn = normalizarTexto(existente.fornecedor);
  const novoForn = normalizarTexto(novo.fornecedor);
  const existIsSombra = existForn.includes('posto de combustível / cupom fiscal');
  const novoIsSombra = novoForn.includes('posto de combustível / cupom fiscal');

  if (existIsSombra && !novoIsSombra) return true;
  if (!existIsSombra && novoIsSombra) return false;

  // Preferir registro PAGO sobre PENDENTE
  if (novo.status === 'PAGO' && existente.status !== 'PAGO') return true;
  if (existente.status === 'PAGO' && novo.status !== 'PAGO') return false;

  // Preferir registro com obra_id sobre registro sem obra_id (Geral)
  if (novo.obra_id && !existente.obra_id) return true;
  if (!novo.obra_id && existente.obra_id) return false;

  // Preferir vencimento mais recente para folha de pagamento
  if (novo.categoria === 'FOLHA_RH' && novo.data_vencimento > existente.data_vencimento) return true;

  return false;
}
