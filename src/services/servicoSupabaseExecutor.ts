import { supabase } from '../lib/supabase';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

function ehErroColunaInexistente(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return err.code === 'PGRST204' || err.code === '42703' ||
    (typeof err.message === 'string' && (err.message.includes('column') || err.message.includes('schema cache')));
}

function prepararFallbackSemObra(payload: Record<string, unknown>): Record<string, unknown> {
  const fb = { ...payload };
  const obraNome = (fb.obra_nome as string) || '';
  delete fb.obra_id;
  delete fb.obra_nome;
  if (obraNome && !String(fb.observacoes || '').includes('[OBRA:')) {
    fb.observacoes = `${fb.observacoes || ''} [OBRA: ${obraNome}]`.trim();
  }
  return fb;
}

export async function executarPersistenciaServico(
  limpo: Record<string, unknown>,
  servicoId: string
): Promise<{ success: boolean; data?: ServicoHorimetro; error?: string }> {
  try {
    const updateData = { ...limpo };
    delete updateData.id;

    let res = await supabase.from('servicos_horimetro').update(updateData).eq('id', servicoId).select('*');
    if (res.error && ehErroColunaInexistente(res.error)) {
      const fbUpdate = prepararFallbackSemObra(updateData);
      res = await supabase.from('servicos_horimetro').update(fbUpdate).eq('id', servicoId).select('*');
    }

    if (!res.error && Array.isArray(res.data) && res.data.length > 0) {
      return { success: true, data: res.data[0] as ServicoHorimetro };
    }

    let upRes = await supabase.from('servicos_horimetro').upsert([limpo]).select('*');
    if (upRes.error && ehErroColunaInexistente(upRes.error)) {
      const fbLimpo = prepararFallbackSemObra(limpo);
      upRes = await supabase.from('servicos_horimetro').upsert([fbLimpo]).select('*');
    }

    if (upRes.error) {
      const fbMin = prepararFallbackSemObra(limpo);
      delete fbMin.fotos_trabalho; delete fbMin.maquinas_itens;
      delete fbMin.abastecimentos_ids; delete fbMin.parcelas; delete fbMin.adiantamentos_historico;
      upRes = await supabase.from('servicos_horimetro').upsert([fbMin]).select('*');
    }

    if (upRes.error) {
      return { success: false, error: upRes.error.message };
    }

    const saved = Array.isArray(upRes.data) && upRes.data.length > 0 ? (upRes.data[0] as ServicoHorimetro) : undefined;
    return { success: true, data: saved };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao persistir no Supabase' };
  }
}
