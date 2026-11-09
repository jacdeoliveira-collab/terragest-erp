import { supabase } from '../../../../lib/supabase';
import { sincronizarDespesa } from '../../../../services/contasPagarSyncHelper';
import { formatarTagEmprestimo } from '../../../../utils/emprestimoHelper';
import type { NovoAbastecimentoRapidoDTO } from './AbastecimentoRapidoForm';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';

export const OBRA_PADRAO_ABAST = 'a1aa1351-5e2e-4b9d-b5b9-3bd7cec521b1';

export async function criarAbastecimentoDb(
  dto: NovoAbastecimentoRapidoDTO,
  servicoId?: string,
  clienteId?: string,
  clienteNome?: string,
  tenantId?: string | null
): Promise<AbastecimentoItem> {
  const fotoSegura = dto.foto_comprovante && !dto.foto_comprovante.startsWith('data:') ? dto.foto_comprovante : null;
  const tagEmp = dto.emprestimo ? `${formatarTagEmprestimo(dto.emprestimo)} ` : '';
  const refItem = servicoId ? `Cupom [ITEM:${servicoId.slice(0, 8)}:${Date.now().toString(36)}]` : 'Cupom Avulso';

  const novoAbast = {
    tenant_id: tenantId, obra_id: OBRA_PADRAO_ABAST, maquina_id: dto.maquina_id, equipment_id: dto.maquina_id,
    data: dto.data, tipo_combustivel: dto.tipo_combustivel, quantidade_litros: dto.quantidade_litros,
    valor_unitario: dto.valor_unitario, valor_total: dto.valor_total, horimetro_momento: dto.horimetro_momento || 0,
    posto_fornecedor: dto.posto_fornecedor, numero_requisicao_nf: `${tagEmp}${refItem}`, foto_comprovante: fotoSegura,
    servico_id: servicoId || null, cliente_id: clienteId || null, cliente_nome: clienteNome || null, origem: 'POSTO'
  };
  const { data: criado, error } = await supabase.from('abastecimentos').insert([novoAbast]).select().single();
  if (error || !criado) throw error || new Error('Falha ao gravar');

  await sincronizarDespesa({
    ref: `ABAST_${criado.id}`, categoria: 'COMBUSTIVEL', tenantId, obraId: OBRA_PADRAO_ABAST,
    descricao: `Diesel ${dto.maquina_nome}: ${dto.quantidade_litros}L (${clienteNome || 'Serviço'})`,
    fornecedor: dto.emprestimo ? `${dto.emprestimo.credorNome} (${dto.posto_fornecedor || 'Posto'})` : (dto.posto_fornecedor || 'Posto'),
    valor: dto.valor_total, dataVencimento: dto.emprestimo?.dataPagamentoPrevista || dto.data,
    formaPagamento: dto.forma_pagamento || 'PIX', status: dto.emprestimo || dto.forma_pagamento === 'BOLETO' ? 'PENDENTE' : 'PAGO',
    observacoes: `${tagEmp}Abastecimento vinculado ao serviço ${clienteNome || ''}`
  });

  return criado as AbastecimentoItem;
}

export async function atualizarAbastecimentoDb(
  id: string,
  dto: NovoAbastecimentoRapidoDTO,
  clienteNome?: string,
  tenantId?: string | null
): Promise<void> {
  const fotoSegura = dto.foto_comprovante && !dto.foto_comprovante.startsWith('data:') ? dto.foto_comprovante : null;
  await supabase.from('abastecimentos').update({
    maquina_id: dto.maquina_id, equipment_id: dto.maquina_id, data: dto.data,
    tipo_combustivel: dto.tipo_combustivel, quantidade_litros: dto.quantidade_litros,
    valor_unitario: dto.valor_unitario, valor_total: dto.valor_total,
    horimetro_momento: dto.horimetro_momento || 0, posto_fornecedor: dto.posto_fornecedor, foto_comprovante: fotoSegura
  }).eq('id', id);

  await sincronizarDespesa({
    ref: `ABAST_${id}`, categoria: 'COMBUSTIVEL', tenantId, obraId: OBRA_PADRAO_ABAST,
    descricao: `Diesel ${dto.maquina_nome}: ${dto.quantidade_litros}L (${clienteNome || 'Serviço'})`,
    fornecedor: dto.posto_fornecedor || 'Posto', valor: dto.valor_total, dataVencimento: dto.data,
    formaPagamento: dto.forma_pagamento || 'PIX', status: 'PAGO'
  });
}
