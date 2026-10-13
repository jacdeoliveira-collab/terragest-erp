import { supabase } from '../lib/supabase';
import { sincronizarDespesa } from './contasPagarSyncHelper';

interface ManutencaoRow {
  id: string;
  tenant_id?: string | null;
  obra_id?: string | null;
  maquina_id?: string;
  equipment_id?: string;
  descricao_servico?: string;
  servico?: string;
  tipo_manutencao?: string;
  data_servico?: string;
  data_ultima_execucao?: string;
  responsavel_mecanico?: string | null;
  valor_pecas?: number;
  valor_mao_obra?: number;
}

/**
 * Manutenção (preventiva/corretiva) -> Contas a Pagar.
 * Peças e mão de obra geram despesas separadas, vinculadas à obra e identificadas pelo [REF].
 */
export async function sincronizarManutencaoFinanceiro(m: ManutencaoRow): Promise<void> {
  const pecas = Number(m.valor_pecas) || 0;
  const maoObra = Number(m.valor_mao_obra) || 0;
  if (pecas <= 0 && maoObra <= 0) return;

  const maqId = m.maquina_id || m.equipment_id;
  let maquina = '';
  if (maqId) {
    const { data: eq } = await supabase.from('equipment').select('code, name').eq('id', maqId).maybeSingle();
    if (eq) maquina = `${eq.code} - ${eq.name}`;
  }

  const servico = m.descricao_servico || m.servico || 'Manutenção';
  const tipo = m.tipo_manutencao === 'CORRETIVA' ? 'Corretiva' : 'Preventiva';
  const venc = m.data_servico || m.data_ultima_execucao || new Date().toISOString().slice(0, 10);
  const fornecedor = m.responsavel_mecanico?.trim() || 'Oficina / Fornecedor de peças';
  const base = { tenantId: m.tenant_id, obraId: m.obra_id, fornecedor, dataVencimento: venc };

  await sincronizarDespesa({
    ...base,
    ref: `MANUT_${m.id}:PECAS`,
    categoria: 'PECAS_MANUTENCAO',
    descricao: `Peças ${tipo}: ${servico}${maquina ? ` (${maquina})` : ''}`,
    valor: pecas
  });

  await sincronizarDespesa({
    ...base,
    ref: `MANUT_${m.id}:MO`,
    categoria: 'OUTROS',
    descricao: `Mão de obra ${tipo}: ${servico}${maquina ? ` (${maquina})` : ''}`,
    valor: maoObra
  });
}
