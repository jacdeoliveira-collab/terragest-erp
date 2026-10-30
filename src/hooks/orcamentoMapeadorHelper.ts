import type { Orcamento, OrcamentoDetalhesProposta } from '../types/comercial.types';

const META_PREFIX = '___META_ORC:';

const COLUNAS_VALIDAS_ORCAMENTO = new Set([
  'tenant_id', 'cliente_id', 'maquina_id', 'descricao_servico',
  'valor_hora', 'horas_estimadas', 'valor_total', 'status',
  'data_proposta', 'validade_dias', 'observacoes',
  'valor_adiantamento', 'data_adiantamento', 'forma_pagamento_adiantamento',
  'saldo_restante', 'condicao_pagamento', 'forma_pagamento',
  'conta_bancaria_id', 'prazo_descricao', 'chave_pix_manual', 'updated_at'
]);

export function serializarOrcamentoParaBanco(dto: Partial<Orcamento>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  let obsTexto = (dto.observacoes || '').split(META_PREFIX)[0].trim();

  if (dto.detalhes_proposta || dto.data_vencimento) {
    const metaObj = {
      ...(dto.detalhes_proposta || {}),
      ...(dto.data_vencimento ? { data_vencimento: dto.data_vencimento } : {})
    };
    obsTexto = `${obsTexto}\n${META_PREFIX}${JSON.stringify(metaObj)}`.trim();
  }

  const fonte: Record<string, unknown> = { ...dto, observacoes: obsTexto || undefined };
  for (const [k, v] of Object.entries(fonte)) {
    if (COLUNAS_VALIDAS_ORCAMENTO.has(k) && v !== undefined) {
      payload[k] = v === '' && (k === 'maquina_id' || k === 'conta_bancaria_id') ? null : v;
    }
  }
  return payload;
}

export function extrairDetalhesDeObservacoes(obs?: string): {
  observacoesLimpa: string;
  detalhes?: OrcamentoDetalhesProposta;
  dataVencimento?: string;
} {
  if (!obs) return { observacoesLimpa: '' };
  const idx = obs.indexOf(META_PREFIX);
  if (idx === -1) return { observacoesLimpa: obs };
  const observacoesLimpa = obs.slice(0, idx).trim();
  const rawJson = obs.slice(idx + META_PREFIX.length).trim();
  try {
    const parsed = JSON.parse(rawJson);
    const { data_vencimento, ...resto } = parsed;
    return { observacoesLimpa, detalhes: resto, dataVencimento: data_vencimento };
  } catch {
    return { observacoesLimpa };
  }
}

interface CrossMaps {
  cliMap: Map<string, any>;
  eqpMap: Map<string, any>;
  ctaMap: Map<string, any>;
}

export function mapearOrcamentosCompletos(rawOrcamentos: any[], { cliMap, eqpMap, ctaMap }: CrossMaps): Orcamento[] {
  return (rawOrcamentos || []).map((item) => {
    const c = cliMap.get(item.cliente_id);
    const e = eqpMap.get(item.maquina_id);
    const cta = item.conta_bancaria_id ? ctaMap.get(item.conta_bancaria_id) : undefined;
    const { observacoesLimpa, detalhes, dataVencimento } = extrairDetalhesDeObservacoes(item.observacoes);
    const maqItem0 = detalhes?.maquinas_itens?.[0];

    return {
      ...item,
      observacoes: observacoesLimpa,
      detalhes_proposta: detalhes,
      data_vencimento: item.data_vencimento || dataVencimento,
      cliente_nome: c?.nome || 'Cliente Geral',
      cliente_documento: c?.documento,
      cliente_telefone: c?.telefone,
      cliente_endereco: c?.endereco,
      maquina_nome: e?.name || maqItem0?.maquina_nome,
      maquina_codigo: e?.code || maqItem0?.maquina_codigo,
      maquina_modelo: e?.model || maqItem0?.maquina_modelo,
      maquina_serie: e?.serial_number || e?.chassi || maqItem0?.maquina_chassi,
      maquina_placa: e?.placa,
      maquina_ano: e?.ano_fabricacao || (maqItem0?.maquina_ano ? Number(maqItem0.maquina_ano) : undefined),
      maquina_potencia: e?.potencia_hp || (maqItem0?.maquina_potencia ? Number(maqItem0.maquina_potencia) : undefined),
      maquina_horimetro_atual: e?.current_hourmeter ?? maqItem0?.maquina_horimetro_saida,
      maquina_combustivel: e?.combustivel_padrao,
      maquina_capacidade_tanque: e?.capacidade_tanque,
      maquina_foto_url: e?.drive_url_foto,
      conta_bancaria_nome: cta?.nome_conta,
      conta_bancaria_pix: cta?.chave_pix,
      conta_bancaria_banco: cta?.banco
    };
  });
}
