import { supabase } from '../lib/supabase';

export interface PlanoRevisaoInicial {
  intervalo: number;
  descricao: string;
  ultimaLeitura: number;
}

/**
 * Cria o plano de revisão periódica no cadastro do equipamento.
 * A partir dele o módulo Manutenção e os alertas do app acompanham a próxima revisão.
 */
export async function criarPlanoRevisaoInicial(
  equip: { id: string; tenant_id?: string | null },
  plano: PlanoRevisaoInicial
): Promise<{ ok: boolean; error?: string }> {
  const intervalo = Number(plano.intervalo);
  const ultima = Number(plano.ultimaLeitura) || 0;
  const desc = (plano.descricao.trim() || 'Revisão periódica').slice(0, 145);
  const hoje = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from('planos_manutencao').insert([{
    tenant_id: equip.tenant_id || null,
    equipment_id: equip.id,
    maquina_id: equip.id,
    servico: desc,
    tipo_servico: 'PREVENTIVA',
    intervalo_horas: intervalo,
    ultimo_horimetro: ultima,
    horimetro_proxima_troca: ultima + intervalo,
    data_ultima_execucao: hoje,
    status: 'EM_DIA',
    valor_pecas: 0,
    valor_mao_obra: 0
  }]);

  return error ? { ok: false, error: error.message } : { ok: true };
}
