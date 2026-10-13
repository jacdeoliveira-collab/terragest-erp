import { supabase } from '../lib/supabase';

interface ChecklistReprovado {
  id: string;
  maquina_id: string;
  data: string;
  horimetro_atual?: number | null;
  observacoes?: string | null;
  nivel_oleo_ok?: boolean;
  vazamentos_ok?: boolean;
  tenant_id?: string | null;
}

/**
 * Checklist reprovado -> abre automaticamente uma OS de manutenção CORRETIVA pendente,
 * para a falha aparecer no módulo Manutenção (e nos custos da máquina) sem digitação duplicada.
 */
export async function abrirOsCorretivaDeChecklist(chk: ChecklistReprovado, tenantFallback?: string): Promise<void> {
  const tag = `[CHK:${chk.id}]`;

  const { data: existente } = await supabase
    .from('planos_manutencao')
    .select('id')
    .ilike('descricao_servico', `%${tag}%`)
    .maybeSingle();
  if (existente) return;

  const falhas: string[] = [];
  if (chk.nivel_oleo_ok === false) falhas.push('nível de óleo irregular');
  if (chk.vazamentos_ok === false) falhas.push('vazamentos detectados');
  const detalhe = [falhas.join(', '), chk.observacoes?.trim()].filter(Boolean).join(' | ') || 'Reprovado na inspeção diária';
  const descricao = `Checklist reprovado: ${detalhe} ${tag}`.slice(0, 250);
  const horimetro = Number(chk.horimetro_atual) || 0;

  const { error } = await supabase.from('planos_manutencao').insert([{
    tenant_id: chk.tenant_id || tenantFallback || null,
    equipment_id: chk.maquina_id,
    maquina_id: chk.maquina_id,
    servico: descricao,
    tipo_servico: 'Corretiva',
    tipo_servico_nome: descricao,
    descricao_servico: descricao,
    intervalo_horas: 0,
    ultimo_horimetro: horimetro,
    ultimo_horimetro_realizado: horimetro,
    horimetro_proxima_troca: horimetro,
    data_ultima_execucao: chk.data,
    data_servico: chk.data,
    status: 'PENDENTE',
    tipo_manutencao: 'CORRETIVA',
    valor_pecas: 0,
    valor_mao_obra: 0
  }]);

  if (error) console.warn('[Checklist] Não foi possível abrir OS corretiva:', error.message);
}
