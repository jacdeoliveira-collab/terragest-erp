import { supabase } from '../lib/supabase';
import type { MedicaoItem } from '../types/faturamento.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

function extrairServicoId(item: MedicaoItem): string | null {
  if (item.servico_id) return item.servico_id;
  if (item.id.startsWith('serv_')) {
    return item.id.replace('serv_', '').split('_p')[0];
  }
  if (item.observacoes) {
    const match = item.observacoes.match(/\[REF:([^\]]+)\]/);
    if (match) return match[1];
  }
  return null;
}

export async function excluirTituloReceber(
  item: MedicaoItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const servId = extrairServicoId(item);

    // 1. Exclui da tabela medicoes
    if (!item.id.startsWith('serv_')) {
      await supabase.from('medicoes').delete().eq('id', item.id);
    }
    if (item.numero_medicao) {
      await supabase.from('medicoes').delete().eq('numero_medicao', item.numero_medicao);
    }
    if (servId) {
      await supabase.from('medicoes').delete().ilike('observacoes', `%[REF:${servId}]%`);
    }

    // 2. Se for derivado de um servico_horimetro, exclui o servico correspondente
    if (servId) {
      await supabase.from('servicos_horimetro').delete().eq('id', servId);

      // Limpa do cache local
      try {
        const raw = localStorage.getItem('terragest_servicos_horimetro');
        if (raw) {
          const list = JSON.parse(raw) as ServicoHorimetro[];
          if (Array.isArray(list)) {
            const filtered = list.filter((s) => s.id !== servId);
            localStorage.setItem('terragest_servicos_horimetro', JSON.stringify(filtered));
          }
        }
      } catch {}
    }

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao excluir título' };
  }
}
