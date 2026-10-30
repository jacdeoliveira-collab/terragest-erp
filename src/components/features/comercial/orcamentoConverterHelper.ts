import type { Orcamento } from '../../../types/comercial.types';
import type { ServicoHorimetro, ServicoMaquinaItem } from '../../../types/servicoHorimetro.types';
import { persistirServicoSupabase } from '../../../services/servicoPersistenciaService';
import { salvarServicosCache, obterServicosCache } from '../../../hooks/servicosStorageCache';
import { gerarUuidV4 } from '../../../utils/uuid';
import { DEFAULT_LEGACY_TENANT } from '../../../utils/tenantFilter';

export async function converterOrcamentoEmServicoHorimetro(
  orc: Orcamento,
  tenantId?: string | null
): Promise<{ success: boolean; error?: string }> {
  const tId = tenantId || orc.tenant_id || DEFAULT_LEGACY_TENANT;
  const det = orc.detalhes_proposta;
  const now = new Date().toISOString();
  const servicoId = gerarUuidV4();

  const maqOrc = det?.maquinas_itens && det.maquinas_itens.length > 0
    ? det.maquinas_itens
    : [{
        id: 'maq_1',
        maquina_id: orc.maquina_id,
        maquina_nome: orc.maquina_nome ? `${orc.maquina_nome}${orc.maquina_codigo ? ` (${orc.maquina_codigo})` : ''}` : 'Máquina Linha Amarela',
        operador_nome: '',
        maquina_horimetro_saida: orc.maquina_horimetro_atual || 0,
        horas_estimadas: orc.horas_estimadas || 0,
        valor_hora: orc.valor_hora || 0,
        subtotal: orc.valor_total || 0
      }];

  const maquinasItens: ServicoMaquinaItem[] = maqOrc.map((m, i) => ({
    id: `m_${i + 1}_${Date.now()}`,
    maquina_id: m.maquina_id,
    maquina_nome: m.maquina_codigo && !m.maquina_nome.includes(m.maquina_codigo)
      ? `${m.maquina_nome} (${m.maquina_codigo})`
      : (m.maquina_nome || 'Máquina'),
    operador_nome: m.operador_nome || '',
    horimetro_inicial: Number(m.maquina_horimetro_saida || 0),
    horimetro_final: undefined,
    horas_trabalhadas: 0,
    valor_hora: Number(m.valor_hora || orc.valor_hora || 0),
    faturamento_bruto: 0
  }));

  const prim = maquinasItens[0];
  const adiantamento = Number(orc.valor_adiantamento || 0);

  const novoServico: ServicoHorimetro = {
    id: servicoId,
    tenant_id: tId,
    cliente_id: orc.cliente_id,
    cliente_nome: orc.cliente_nome || 'Cliente',
    cliente_documento: orc.cliente_documento,
    cliente_telefone: orc.cliente_telefone,
    obra_id: det?.obra_id || undefined,
    obra_nome: det?.obra_nome || undefined,
    maquina_id: prim?.maquina_id || orc.maquina_id,
    maquina_nome: prim?.maquina_nome || 'Máquina',
    operador_nome: prim?.operador_nome || 'A definir',
    descricao_servico: [
      det?.tipo_operacao ? `[${det.tipo_operacao}]` : null,
      orc.descricao_servico,
      det?.local_obra ? `Local: ${det.local_obra}` : null
    ].filter(Boolean).join(' • '),
    data_inicio: det?.previsao_inicio || now.slice(0, 10),
    horimetro_inicial: prim?.horimetro_inicial || 0,
    horas_trabalhadas: 0,
    valor_hora: prim?.valor_hora || orc.valor_hora || 0,
    faturamento_bruto: 0,
    combustivel_maquina_litros: 0,
    combustivel_maquina_valor: 0,
    combustivel_apoio_litros: 0,
    combustivel_apoio_valor: 0,
    combustivel_total_valor: 0,
    despesa_operador: 0,
    despesa_apoio: Number(det?.valor_mobilizacao || 0),
    despesa_manutencao: 0,
    despesas_total: Number(det?.valor_mobilizacao || 0),
    lucro_liquido: 0,
    margem_lucro: 0,
    valor_adiantamento: adiantamento,
    data_adiantamento: orc.data_adiantamento,
    forma_pagamento_adiantamento: orc.forma_pagamento_adiantamento,
    saldo_restante: 0,
    status_pagamento_cliente: adiantamento > 0 ? 'PARCIAL' : 'PENDENTE',
    forma_pagamento: orc.forma_pagamento,
    condicao_pagamento: orc.condicao_pagamento,
    conta_bancaria_id: orc.conta_bancaria_id,
    prazo_descricao: orc.prazo_descricao,
    maquinas_itens: maquinasItens,
    status: 'EM_ANDAMENTO',
    observacoes: `[Gerado da Proposta #ORC-${orc.id.slice(0, 6).toUpperCase()}] ${orc.observacoes || ''}`.trim(),
    created_at: now,
    updated_at: now
  };

  const res = await persistirServicoSupabase(novoServico);
  if (res.success) {
    const cacheAtual = obterServicosCache(tId);
    salvarServicosCache(tId, [res.data || novoServico, ...cacheAtual]);
  }
  return res;
}

