import { supabase } from '../lib/supabase';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export async function sincronizarHorimetroEquipamento(
  servico: Partial<ServicoHorimetro>
): Promise<void> {
  const hFim = Number(servico.horimetro_final) || 0;
  const hIni = Number(servico.horimetro_inicial) || 0;
  const maxH = Math.max(hFim, hIni);

  if (maxH <= 0) return;

  try {
    let maqId = servico.maquina_id;

    if (!maqId && servico.maquina_nome) {
      const matchCod = servico.maquina_nome.match(/\(([^)]+)\)/);
      const cod = matchCod ? matchCod[1].trim() : '';

      let q = supabase.from('equipment').select('id, current_hourmeter');
      if (cod) {
        q = q.eq('code', cod);
      } else {
        q = q.ilike('name', `%${servico.maquina_nome}%`);
      }
      const { data: eqs } = await q.limit(1);
      if (eqs && eqs.length > 0) {
        maqId = eqs[0].id;
      }
    }

    if (!maqId) return;

    await supabase
      .from('equipment')
      .update({
        current_hourmeter: maxH,
        updated_at: new Date().toISOString()
      })
      .eq('id', maqId)
      .or(`current_hourmeter.is.null,current_hourmeter.lt.${maxH}`);
  } catch (err) {
    console.warn('[sincronizarHorimetroEquipamento] Erro ao sincronizar horímetro:', err);
  }
}

