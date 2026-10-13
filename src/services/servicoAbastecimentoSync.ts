import { supabase } from '../lib/supabase';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export async function sincronizarAbastecimentosDoServico(
  servico: ServicoHorimetro,
  _obraId: string | null,
  _tenantId: string
): Promise<void> {
  if (!servico?.id) return;
  try {
    const refTag = `[REF:${servico.id}:`;
    await supabase.from('abastecimentos').delete().ilike('numero_requisicao_nf', `%${refTag}%`);
  } catch (err) {
    console.warn('Aviso ao expurgar abastecimento sintético legado:', err);
  }
}
