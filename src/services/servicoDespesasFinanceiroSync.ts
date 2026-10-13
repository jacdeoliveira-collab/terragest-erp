import { supabase } from '../lib/supabase';
import type { ServicoHorimetro, DespesaItemServico } from '../types/servicoHorimetro.types';

function mapCategoriaFinanceira(cat: string): string {
  switch (cat) {
    case 'PECAS_LUBRIFICANTES': return 'PECAS_MANUTENCAO';
    case 'COMBUSTIVEL': return 'COMBUSTIVEL';
    case 'LOGISTICA_APOIO': return 'OUTROS';
    case 'ALIMENTACAO_HOSPEDAGEM': return 'OUTROS';
    default: return 'OUTROS';
  }
}

async function sincronizarItemDespesa(
  item: DespesaItemServico,
  servico: ServicoHorimetro,
  obraId: string | null,
  tenantId: string
): Promise<void> {
  const payload = {
    tenant_id: tenantId,
    obra_id: obraId,
    descricao: `${item.descricao || 'Despesa'} - ${servico.maquina_nome} (${servico.cliente_nome})`,
    fornecedor: item.fornecedor || 'Fornecedor Local',
    categoria: mapCategoriaFinanceira(item.categoria),
    valor: Number(item.valor || 0),
    data_vencimento: item.data || servico.data_inicio,
    data_pagamento: item.status_pagamento === 'PAGO' ? (item.data || servico.data_inicio) : null,
    forma_pagamento: item.forma_pagamento || 'PIX',
    status: item.status_pagamento || 'PAGO',
    observacoes: `[REF:${servico.id}] [DESP_ITEM:${item.id}] Comprovante: ${item.comprovante_url || 'Nenhum'}`
  };

  const { data: exist } = await supabase
    .from('contas_pagar')
    .select('id')
    .ilike('observacoes', `%[DESP_ITEM:${item.id}]%`)
    .maybeSingle();

  if (exist) {
    await supabase.from('contas_pagar').update(payload).eq('id', exist.id);
  } else {
    await supabase.from('contas_pagar').insert([payload]);
  }
}

export async function sincronizarDespesasDetalhadasServico(
  servico: ServicoHorimetro,
  obraId: string | null,
  tenantId: string
): Promise<void> {
  const itens = servico.despesas_itens || [];

  if (itens.length > 0) {
    for (const item of itens) {
      if (item.valor > 0) {
        await sincronizarItemDespesa(item, servico, obraId, tenantId);
      }
    }
    return;
  }

  // Fallback caso não haja itens avulsos cadastrados mas haja valores consolidados
  if (Number(servico.despesa_manutencao || 0) > 0) {
    const payloadManut = {
      tenant_id: tenantId,
      obra_id: obraId,
      descricao: `Peças, Lubrificantes & Manutenção - ${servico.maquina_nome} (${servico.cliente_nome})`,
      fornecedor: 'Auto Peças / Distribuidora de Lubrificantes',
      categoria: 'PECAS_MANUTENCAO',
      valor: Number(servico.despesa_manutencao),
      data_vencimento: servico.data_inicio,
      status: 'PAGO',
      observacoes: `[REF:${servico.id}] [CAT:MANUTENCAO] Manutenção preventiva/corretiva do serviço`
    };
    const { data: existM } = await supabase
      .from('contas_pagar')
      .select('id')
      .ilike('observacoes', `%[REF:${servico.id}] [CAT:MANUTENCAO]%`)
      .maybeSingle();
    if (existM) await supabase.from('contas_pagar').update(payloadManut).eq('id', existM.id);
    else await supabase.from('contas_pagar').insert([payloadManut]);
  }

  if (Number(servico.despesa_apoio || 0) > 0) {
    const payloadApoio = {
      tenant_id: tenantId,
      obra_id: obraId,
      descricao: `Logística / Frete Prancha & Apoio - ${servico.maquina_nome} (${servico.cliente_nome})`,
      fornecedor: 'Transporte / Logística Operacional',
      categoria: 'OUTROS',
      valor: Number(servico.despesa_apoio),
      data_vencimento: servico.data_inicio,
      status: 'PAGO',
      observacoes: `[REF:${servico.id}] [CAT:LOGISTICA] Logística e deslocamento do serviço`
    };
    const { data: existA } = await supabase
      .from('contas_pagar')
      .select('id')
      .ilike('observacoes', `%[REF:${servico.id}] [CAT:LOGISTICA]%`)
      .maybeSingle();
    if (existA) await supabase.from('contas_pagar').update(payloadApoio).eq('id', existA.id);
    else await supabase.from('contas_pagar').insert([payloadApoio]);
  }
}
