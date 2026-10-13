import { supabase } from '../lib/supabase';

interface QuitarOperadorParams {
  servicoId: string;
  valorPago: number;
  totalGanho: number;
  dataPagamento: string;
  formaPagamento?: string;
  tenantId?: string;
  operadorNome?: string;
  obraId?: string | null;
}

export async function registrarPagamentoOperador({
  servicoId,
  valorPago,
  totalGanho,
  dataPagamento,
  formaPagamento = 'PIX',
  tenantId,
  operadorNome = 'Operador',
  obraId
}: QuitarOperadorParams) {
  const saldoRestante = Math.max(0, totalGanho - valorPago);
  const statusPagamento = saldoRestante <= 0.01 ? 'PAGO' : 'PARCIAL';

  // 1. Atualiza servicos_horimetro
  const { error: errServico } = await supabase
    .from('servicos_horimetro')
    .update({
      adiantamento_operador_valor: valorPago,
      saldo_pagar_operador: saldoRestante,
      status_pagamento_operador: statusPagamento,
      data_pagamento_operador: dataPagamento
    })
    .eq('id', servicoId);

  if (errServico) throw new Error(`Erro ao atualizar serviço: ${errServico.message}`);

  const { data: srvData } = await supabase
    .from('servicos_horimetro')
    .select('obra_id, tenant_id')
    .eq('id', servicoId)
    .maybeSingle();

  const finalObraId = obraId !== undefined ? obraId : (srvData?.obra_id || null);
  const finalTenantId = tenantId || srvData?.tenant_id || null;

  // 2. Conexão com CONTAS A PAGAR
  const { data: existCP } = await supabase
    .from('contas_pagar')
    .select('id')
    .ilike('observacoes', `%[REF:${servicoId}]%`)
    .eq('categoria', 'FOLHA_RH')
    .maybeSingle();

  if (existCP?.id) {
    await supabase
      .from('contas_pagar')
      .update({
        valor: saldoRestante <= 0.01 ? valorPago : saldoRestante,
        status: statusPagamento === 'PAGO' ? 'PAGO' : 'PENDENTE',
        data_pagamento: statusPagamento === 'PAGO' ? dataPagamento : null,
        forma_pagamento: formaPagamento,
        obra_id: finalObraId,
        observacoes: `[REF:${servicoId}] Remuneração: R$ ${totalGanho.toFixed(2)} | Pago: R$ ${valorPago.toFixed(2)} | Saldo: R$ ${saldoRestante.toFixed(2)}`
      })
      .eq('id', existCP.id);
  } else {
    await supabase.from('contas_pagar').insert([{
      tenant_id: finalTenantId,
      obra_id: finalObraId,
      descricao: `Remuneração Operador: ${operadorNome}`,
      fornecedor: operadorNome,
      categoria: 'FOLHA_RH',
      valor: valorPago,
      data_vencimento: dataPagamento,
      data_pagamento: statusPagamento === 'PAGO' ? dataPagamento : null,
      forma_pagamento: formaPagamento,
      status: statusPagamento === 'PAGO' ? 'PAGO' : 'PENDENTE',
      observacoes: `[REF:${servicoId}] Total: R$ ${totalGanho.toFixed(2)} | Pago: R$ ${valorPago.toFixed(2)}`
    }]);
  }

  return { success: true, saldoRestante, statusPagamento };
}
