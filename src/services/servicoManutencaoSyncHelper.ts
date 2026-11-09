import { supabase } from '../lib/supabase';
import { extrairInfoEmprestimo, formatarTagEmprestimo, removerTagEmprestimo } from '../utils/emprestimoHelper';
import type { DespesaItemServico } from '../types/servicoHorimetro.types';

export interface SincronizarManutencaoParams {
  item: DespesaItemServico;
  servicoId?: string;
  clienteNome?: string;
  maquinaId?: string;
  maquinaNome?: string;
  obraId?: string | null;
  tenantId?: string | null;
}

export async function salvarItemManutencaoCompleto(p: SincronizarManutencaoParams): Promise<void> {
  const { item, servicoId, clienteNome, maquinaId, maquinaNome, obraId, tenantId } = p;
  const fornLimpo = removerTagEmprestimo(item.fornecedor) || 'Auto Peças / Mecânica';
  const infoEmp = extrairInfoEmprestimo({ observacoes: item.fornecedor, forma_pagamento: item.forma_pagamento });
  const isEmp = infoEmp.isEmprestimo;
  const tagEmp = isEmp ? `${formatarTagEmprestimo({
    credorNome: infoEmp.credorNome,
    dataEmprestimo: infoEmp.dataEmprestimo || item.data,
    dataPagamentoPrevista: infoEmp.dataPagamentoPrevista || item.data
  })} ` : '';

  const refTag = servicoId ? `[REF:${servicoId}] ` : '';
  const itemTag = `[DESP_MANUT:${item.id}]`;
  const obsCp = `${tagEmp}${refTag}${itemTag} ${item.descricao} | Comprovante: ${item.comprovante_url || 'Nenhum'}`.trim();

  const payloadCp = {
    tenant_id: tenantId || null,
    obra_id: obraId || null,
    descricao: `${item.descricao || 'Peças / Manutenção'} - ${maquinaNome || 'Máquina'} (${clienteNome || 'Serviço'})`.slice(0, 150),
    fornecedor: (isEmp ? `${infoEmp.credorNome} (${fornLimpo})` : fornLimpo).slice(0, 80),
    categoria: 'PECAS_MANUTENCAO',
    valor: Number(item.valor || 0),
    data_vencimento: item.data || new Date().toISOString().slice(0, 10),
    data_pagamento: item.status_pagamento === 'PAGO' ? (item.data || new Date().toISOString().slice(0, 10)) : null,
    forma_pagamento: item.forma_pagamento || 'PIX',
    status: isEmp ? 'PENDENTE' : (item.status_pagamento || 'PAGO'),
    observacoes: obsCp
  };

  const { data: existCp } = await supabase.from('contas_pagar').select('id').ilike('observacoes', `%${itemTag}%`).maybeSingle();
  if (existCp?.id) {
    await supabase.from('contas_pagar').update(payloadCp).eq('id', existCp.id);
  } else {
    await supabase.from('contas_pagar').insert([payloadCp]);
  }

  if (maquinaId && item.valor > 0) {
    const metaTipo = `CORRETIVA|${fornLimpo}`.slice(0, 140);
    const planoPayload = {
      tenant_id: tenantId || '00000000-0000-0000-0000-000000000001',
      equipment_id: maquinaId,
      maquina_id: maquinaId,
      servico: item.descricao || 'Peças & Manutenção no Serviço',
      tipo_servico: metaTipo,
      valor_pecas: Number(item.valor || 0),
      valor_mao_obra: 0,
      data_ultima_execucao: item.data || new Date().toISOString().slice(0, 10),
      obra_id: obraId || null,
      status: 'EM_DIA'
    };

    const { data: existPlano } = await supabase
      .from('planos_manutencao')
      .select('id')
      .eq('equipment_id', maquinaId)
      .eq('data_ultima_execucao', item.data)
      .eq('servico', item.descricao)
      .maybeSingle();

    if (existPlano?.id) {
      await supabase.from('planos_manutencao').update(planoPayload).eq('id', existPlano.id);
    } else {
      await supabase.from('planos_manutencao').insert([planoPayload]);
    }
  }
}

export async function excluirItemManutencaoCompleto(itemId: string, _servicoId?: string): Promise<void> {
  const itemTag = `[DESP_MANUT:${itemId}]`;
  await supabase.from('contas_pagar').delete().ilike('observacoes', `%${itemTag}%`);
}
