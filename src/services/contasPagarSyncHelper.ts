import { supabase } from '../lib/supabase';
import type { CategoriaContaPagar, StatusContaPagar } from '../types/contasPagar.types';

export interface DespesaSyncInput {
  ref: string;
  categoria: CategoriaContaPagar;
  tenantId?: string | null;
  obraId?: string | null;
  descricao: string;
  fornecedor: string;
  valor: number;
  dataVencimento: string;
  status?: StatusContaPagar;
  formaPagamento?: string | null;
  contaBancariaId?: string | null;
  observacoes?: string;
}

/**
 * Cria ou atualiza uma despesa em contas_pagar identificada por [REF:ref] + categoria.
 * Evita duplicidade ao reeditar o registro de origem. Não grava se valor <= 0.
 */
export async function sincronizarDespesa(input: DespesaSyncInput): Promise<{ ok: boolean; error?: string }> {
  if (!(Number(input.valor) > 0)) return { ok: true };

  const tag = `[REF:${input.ref}]`;
  const isPago = input.status === 'PAGO';
  const payload = {
    tenant_id: input.tenantId || null,
    obra_id: input.obraId || null,
    descricao: input.descricao.slice(0, 150),
    fornecedor: input.fornecedor.slice(0, 80),
    categoria: input.categoria,
    valor: Number(input.valor),
    data_vencimento: input.dataVencimento,
    data_pagamento: isPago ? input.dataVencimento : null,
    forma_pagamento: input.formaPagamento || 'PIX',
    conta_bancaria_id: input.contaBancariaId || null,
    status: input.status || 'PENDENTE',
    observacoes: `${tag} ${input.observacoes || ''}`.trim()
  };

  const { data: existente } = await supabase
    .from('contas_pagar')
    .select('id, status')
    .ilike('observacoes', `%${tag}%`)
    .eq('categoria', input.categoria)
    .maybeSingle();

  if (existente) {
    const { status, data_pagamento, ...resto } = payload;
    const upd = existente.status === 'PAGO' && status !== 'PAGO' ? resto : { ...resto, status, data_pagamento };
    const { error } = await supabase.from('contas_pagar').update(upd).eq('id', existente.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  const { error } = await supabase.from('contas_pagar').insert([payload]);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function removerDespesaPorRef(ref: string): Promise<void> {
  await supabase.from('contas_pagar').delete().ilike('observacoes', `%[REF:${ref}]%`);
}
