import { supabase } from '../lib/supabase';
import { removerDespesaPorRef, sincronizarDespesa } from './contasPagarSyncHelper';

export const refAbastecimento = (id: string) => `ABAST_${id}`;

/** Remove a despesa de Contas a Pagar vinculada ao abastecimento excluído. */
export async function removerDespesaAbastecimento(id: string): Promise<void> {
  await removerDespesaPorRef(refAbastecimento(id));
}

/**
 * Após editar um abastecimento avulso, reflete valor/data/fornecedor no Contas a Pagar.
 * Ignora abastecimentos de comboio ou vinculados a serviço.
 */
export async function ressincronizarDespesaAbastecimento(id: string): Promise<void> {
  const { data: ab } = await supabase.from('abastecimentos').select('*').eq('id', id).maybeSingle();
  if (!ab || ab.origem === 'COMBOIO' || ab.servico_id) return;
  if (!(Number(ab.valor_total) > 0)) {
    await removerDespesaAbastecimento(id);
    return;
  }
  const fin = await sincronizarDespesa({
    ref: refAbastecimento(id),
    categoria: 'COMBUSTIVEL',
    tenantId: ab.tenant_id,
    obraId: ab.obra_id,
    descricao: `Diesel ${ab.tipo_combustivel || ''}: ${ab.quantidade_litros}L${ab.posto_fornecedor ? ` - ${ab.posto_fornecedor}` : ''}`,
    fornecedor: ab.posto_fornecedor || 'Posto de Combustível',
    valor: Number(ab.valor_total),
    dataVencimento: ab.data,
    observacoes: `Doc: ${ab.numero_requisicao_nf || 'S/N'}`
  });
  if (!fin.ok) console.warn('[Abastecimento] Falha ao atualizar financeiro:', fin.error);
}
