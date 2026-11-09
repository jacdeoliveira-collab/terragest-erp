import { supabase } from '../lib/supabase';
import { extrairInfoEmprestimo, formatarTagEmprestimo, removerTagEmprestimo } from '../utils/emprestimoHelper';
import { salvarItemManutencaoCompleto } from './servicoManutencaoSyncHelper';
import type { ServicoHorimetro, DespesaItemServico } from '../types/servicoHorimetro.types';

async function sincronizarItemDespesa(item: DespesaItemServico, servico: ServicoHorimetro, obraId: string | null, tenantId: string): Promise<void> {
  if (item.categoria === 'PECAS_LUBRIFICANTES') {
    await salvarItemManutencaoCompleto({
      item, servicoId: servico.id, clienteNome: servico.cliente_nome,
      maquinaId: servico.maquina_id, maquinaNome: servico.maquina_nome, obraId, tenantId
    });
    return;
  }

  const infoEmp = extrairInfoEmprestimo({ observacoes: item.fornecedor, forma_pagamento: item.forma_pagamento });
  const fornLimpo = removerTagEmprestimo(item.fornecedor) || 'Fornecedor Local';
  const isEmp = infoEmp.isEmprestimo;
  const tagEmp = isEmp ? `${formatarTagEmprestimo({
    credorNome: infoEmp.credorNome,
    dataEmprestimo: infoEmp.dataEmprestimo || item.data || servico.data_inicio,
    dataPagamentoPrevista: infoEmp.dataPagamentoPrevista || item.data || servico.data_inicio,
  })} ` : '';

  const vencimento = isEmp ? (infoEmp.dataPagamentoPrevista || item.data || servico.data_inicio) : (item.data || servico.data_inicio);
  const statusFinal = isEmp ? 'PENDENTE' : (item.status_pagamento || 'PAGO');

  const payload = {
    tenant_id: tenantId,
    obra_id: obraId,
    descricao: `${item.descricao || 'Despesa'} - ${servico.maquina_nome} (${servico.cliente_nome})`.slice(0, 150),
    fornecedor: isEmp ? `${infoEmp.credorNome} (${fornLimpo})`.slice(0, 80) : fornLimpo.slice(0, 80),
    categoria: item.categoria === 'COMBUSTIVEL' ? 'COMBUSTIVEL' : 'OUTROS',
    valor: Number(item.valor || 0),
    data_vencimento: vencimento,
    data_pagamento: statusFinal === 'PAGO' ? (item.data || servico.data_inicio) : null,
    forma_pagamento: item.forma_pagamento || servico.forma_pagamento || 'PIX',
    conta_bancaria_id: isEmp ? null : (servico.conta_bancaria_id || null),
    status: statusFinal,
    observacoes: `${tagEmp}[REF:${servico.id}] [DESP_ITEM:${item.id}] Comprovante: ${item.comprovante_url || 'Nenhum'}`
  };

  const { data: exist } = await supabase.from('contas_pagar').select('id').ilike('observacoes', `%[DESP_ITEM:${item.id}]%`).maybeSingle();
  if (exist) await supabase.from('contas_pagar').update(payload).eq('id', exist.id);
  else await supabase.from('contas_pagar').insert([payload]);
}

export async function sincronizarDespesasDetalhadasServico(servico: ServicoHorimetro, obraId: string | null, tenantId: string): Promise<void> {
  const itens = servico.despesas_itens || [];
  const contaBancariaId = servico.conta_bancaria_id || null;
  const formaPag = servico.forma_pagamento || 'PIX';

  if (itens.length > 0) {
    for (const item of itens) {
      if (item.valor > 0) await sincronizarItemDespesa(item, servico, obraId, tenantId);
    }
    return;
  }

  if (Number(servico.despesa_manutencao || 0) > 0) {
    const payloadManut = {
      tenant_id: tenantId, obra_id: obraId,
      descricao: `Peças, Lubrificantes & Manutenção - ${servico.maquina_nome} (${servico.cliente_nome})`,
      fornecedor: 'Auto Peças / Distribuidora de Lubrificantes',
      categoria: 'PECAS_MANUTENCAO',
      valor: Number(servico.despesa_manutencao),
      data_vencimento: servico.data_inicio,
      data_pagamento: servico.data_inicio,
      forma_pagamento: formaPag,
      conta_bancaria_id: contaBancariaId,
      status: 'PAGO',
      observacoes: `[REF:${servico.id}] [CAT:MANUTENCAO] Manutenção preventiva/corretiva do serviço`
    };
    const { data: existM } = await supabase.from('contas_pagar').select('id').ilike('observacoes', `%[REF:${servico.id}]%[CAT:MANUTENCAO]%`).maybeSingle();
    if (existM) await supabase.from('contas_pagar').update(payloadManut).eq('id', existM.id);
    else await supabase.from('contas_pagar').insert([payloadManut]);
  }

  if (Number(servico.despesa_apoio || 0) > 0) {
    const payloadApoio = {
      tenant_id: tenantId, obra_id: obraId,
      descricao: `Logística / Frete Prancha & Apoio - ${servico.maquina_nome} (${servico.cliente_nome})`,
      fornecedor: 'Transporte / Logística Operacional',
      categoria: 'OUTROS',
      valor: Number(servico.despesa_apoio),
      data_vencimento: servico.data_inicio,
      data_pagamento: servico.data_inicio,
      forma_pagamento: formaPag,
      conta_bancaria_id: contaBancariaId,
      status: 'PAGO',
      observacoes: `[REF:${servico.id}] [CAT:LOGISTICA] Logística e deslocamento do serviço`
    };
    const { data: existA } = await supabase.from('contas_pagar').select('id').ilike('observacoes', `%[REF:${servico.id}]%[CAT:LOGISTICA]%`).maybeSingle();
    if (existA) await supabase.from('contas_pagar').update(payloadApoio).eq('id', existA.id);
    else await supabase.from('contas_pagar').insert([payloadApoio]);
  }
}
