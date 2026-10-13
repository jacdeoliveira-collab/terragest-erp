import { supabase } from '../lib/supabase';
import { sincronizarAbastecimentosDoServico } from './servicoAbastecimentoSync';
import { sincronizarDespesasDetalhadasServico } from './servicoDespesasFinanceiroSync';
import { calcularVencimentoSalarioOperador } from '../utils/rhFolhaCalculos';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

async function obterObraOuPadrao(clienteNome: string, tenantId: string): Promise<string | null> {
  try {
    let qObras = supabase
      .from('obras')
      .select('id, cliente_nome, cliente');
    qObras = aplicarFiltroTenant(qObras, tenantId);
    const { data: obras } = await qObras;

    if (!obras || obras.length === 0) return null;
    const match = obras.find((o) =>
      (o.cliente_nome && o.cliente_nome.toLowerCase().includes(clienteNome.toLowerCase())) ||
      (o.cliente && o.cliente.toLowerCase().includes(clienteNome.toLowerCase()))
    );
    return match ? match.id : obras[0].id;
  } catch {
    return null;
  }
}

export async function sincronizarServicoFinanceiro(servico: ServicoHorimetro): Promise<void> {
  const tenantId = servico.tenant_id || DEFAULT_LEGACY_TENANT;
  const obraId = servico.obra_id || await obterObraOuPadrao(servico.cliente_nome, tenantId);

  // 1. Integração com CONTAS A RECEBER (tabela medicoes)
  if (servico.faturamento_bruto > 0) {
    const comp = servico.data_inicio.slice(0, 7);
    const medicaoPayload = {
      tenant_id: tenantId,
      obra_id: obraId,
      competencia: comp,
      referencia_mes_ano: comp,
      numero_medicao: `HOR-${servico.id.slice(0, 6).toUpperCase()}`,
      data_emissao: servico.data_inicio,
      data_vencimento: servico.data_fim || servico.data_inicio,
      total_horas_produtivas: Number(servico.horas_trabalhadas || 0),
      valor_total: Number(servico.faturamento_bruto || 0),
      status_pagamento: servico.status_pagamento_cliente === 'QUITADO'
        ? 'PAGO'
        : (servico.valor_adiantamento && servico.valor_adiantamento > 0 ? 'PAGO_PARCIAL' : (servico.status === 'FINALIZADO' ? 'AGUARDANDO_PAGAMENTO' : 'EM_ANALISE')),
      observacoes: `Serviço Horímetro: ${servico.cliente_nome} - ${servico.maquina_nome} [Sinal: R$ ${servico.valor_adiantamento || 0} em ${servico.data_adiantamento || '-'}] [REF:${servico.id}]`
    };

    const { data: existMed } = await supabase
      .from('medicoes').select('id').ilike('observacoes', `%[REF:${servico.id}]%`).maybeSingle();

    if (existMed) {
      await supabase.from('medicoes').update(medicaoPayload).eq('id', existMed.id);
    } else {
      await supabase.from('medicoes').insert([medicaoPayload]);
    }
  }

  // 2. Integração com CONTAS A PAGAR (Combustível / Cupom Fiscal)
  const temAbastVinculado = Array.isArray(servico.abastecimentos_ids) && servico.abastecimentos_ids.length > 0;
  if (temAbastVinculado) {
    await supabase.from('contas_pagar').delete()
      .ilike('observacoes', `%[REF:${servico.id}]%`)
      .eq('categoria', 'COMBUSTIVEL');
  } else if ((servico.combustivel_total_valor || 0) > 0) {
    const despesaCombustivel = {
      tenant_id: tenantId,
      obra_id: obraId,
      descricao: `Diesel Máq/Apoio - ${servico.maquina_nome} (${servico.cliente_nome})`,
      fornecedor: 'Posto de Combustível / Cupom Fiscal',
      categoria: 'COMBUSTIVEL',
      valor: Number(servico.combustivel_total_valor),
      data_vencimento: servico.data_inicio,
      status: 'PENDENTE',
      observacoes: `[REF:${servico.id}] Cupom: ${servico.foto_cupom_combustivel || 'Anexado'} | Máq: ${servico.combustivel_maquina_litros || 0}L | Apoio: ${servico.combustivel_apoio_litros || 0}L`
    };

    const { data: existDesp } = await supabase
      .from('contas_pagar').select('id').ilike('observacoes', `%[REF:${servico.id}]%`).eq('categoria', 'COMBUSTIVEL').maybeSingle();

    if (existDesp) {
      await supabase.from('contas_pagar').update(despesaCombustivel).eq('id', existDesp.id);
    } else {
      await supabase.from('contas_pagar').insert([despesaCombustivel]);
    }
  }

  // 3. Integração com CONTAS A PAGAR (Remuneração & Saldo do Operador)
  const horasOp = Number(servico.horas_trabalhadas || 0);
  const vHoraOp = Number(servico.valor_hora_operador || 0);
  const despOpCalculada = Number(servico.despesa_operador || 0) > 0
    ? Number(servico.despesa_operador)
    : (horasOp > 0 && vHoraOp > 0 ? Number((horasOp * vHoraOp).toFixed(2)) : 0);

  if (despOpCalculada > 0 && servico.operador_nome) {
    const valorPagarOp = servico.saldo_pagar_operador !== undefined
      ? Number(servico.saldo_pagar_operador)
      : despOpCalculada;

    const refData = servico.data_fim || servico.data_inicio;
    const dataVencimentoOp = servico.data_pagamento_operador || calcularVencimentoSalarioOperador(refData, 5);

    const despesaOp = {
      tenant_id: tenantId,
      obra_id: obraId,
      descricao: `Operador: ${servico.operador_nome} (${horasOp}h a R$ ${vHoraOp}/h)`,
      fornecedor: `Operador ${servico.operador_nome}`,
      categoria: 'FOLHA_RH',
      valor: valorPagarOp,
      data_vencimento: dataVencimentoOp,
      status: servico.status_pagamento_operador || 'PENDENTE',
      observacoes: `[REF:${servico.id}] Total: R$ ${despOpCalculada} | Vale: R$ ${servico.adiantamento_operador_valor || 0} (em ${servico.adiantamento_operador_data || '-'}) | Saldo: R$ ${valorPagarOp}`
    };

    const { data: existOps } = await supabase
      .from('contas_pagar')
      .select('id')
      .ilike('observacoes', `%[REF:${servico.id}]%`)
      .eq('categoria', 'FOLHA_RH');

    if (existOps && existOps.length > 0) {
      await supabase.from('contas_pagar').update(despesaOp).eq('id', existOps[0].id);
      if (existOps.length > 1) {
        await supabase.from('contas_pagar').delete().in('id', existOps.slice(1).map((o) => o.id));
      }
    } else {
      await supabase.from('contas_pagar').insert([despesaOp]);
    }
  }

  // 4. Integração com ABASTECIMENTOS (Máquina e Veículo de Apoio / Caminhonete)
  await sincronizarAbastecimentosDoServico(servico, obraId, tenantId);

  // 5. Integração com CONTAS A PAGAR (Peças, Lubrificantes, Manutenção & Logística)
  await sincronizarDespesasDetalhadasServico(servico, obraId, tenantId);
}
