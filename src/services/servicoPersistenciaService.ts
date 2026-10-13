import { sincronizarServicoFinanceiro } from './servicoIntegracaoFinanceira';
import { vincularAbastecimentosAoServico } from './servicoDbSync';
import { gerarUuidV4, isUuidValido } from '../utils/uuid';
import { executarPersistenciaServico } from './servicoSupabaseExecutor';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

function extrairObraDeObservacoes(obs?: string): string | undefined {
  if (!obs) return undefined;
  const m = obs.match(/\[(?:OBRA|Centro de Custo):\s*([^\]]+)\]/i);
  return m ? m[1].trim() : undefined;
}

export function mesclarServicosLocaisERemotos(
  remotos: ServicoHorimetro[],
  locais: ServicoHorimetro[]
): ServicoHorimetro[] {
  if (!Array.isArray(locais) || locais.length === 0) return remotos;
  const mapaLocal = new Map(locais.map((l) => [l.id, l]));
  const idsRemotos = new Set(remotos.map((r) => r.id));

  const mesclados = remotos.map((remoto) => {
    const local = mapaLocal.get(remoto.id);
    if (!local) return remoto;
    const temParcLocal = Array.isArray(local.parcelas) && local.parcelas.length > 0;
    const temParcRemoto = Array.isArray(remoto.parcelas) && remoto.parcelas.length > 0;
    const parcelas = temParcRemoto ? remoto.parcelas : (temParcLocal ? local.parcelas : []);

    const temAdiantLocal = Array.isArray(local.adiantamentos_historico) && local.adiantamentos_historico.length > 0;
    const temAdiantRemoto = Array.isArray(remoto.adiantamentos_historico) && remoto.adiantamentos_historico.length > 0;
    const adiantamentos = temAdiantRemoto ? remoto.adiantamentos_historico : (temAdiantLocal ? local.adiantamentos_historico : []);

    const localMaisRecente = local.updated_at && remoto.updated_at
      ? new Date(local.updated_at).getTime() >= new Date(remoto.updated_at).getTime()
      : !!local.updated_at;

    const base = localMaisRecente ? { ...remoto, ...local } : { ...local, ...remoto };
    const obra_id = remoto.obra_id || local.obra_id;
    const obra_nome = remoto.obra_nome || local.obra_nome || extrairObraDeObservacoes(base.observacoes);

    return { ...base, obra_id, obra_nome, parcelas, adiantamentos_historico: adiantamentos };
  });

  const novosLocais = locais.filter((l) => !idsRemotos.has(l.id));
  return [...mesclados, ...novosLocais];
}

const COLUNAS_SUPABASE_SERVICO = new Set([
  'id', 'tenant_id', 'cliente_id', 'cliente_nome', 'cliente_documento', 'cliente_telefone',
  'obra_id', 'obra_nome', 'maquina_id', 'maquina_nome', 'operador_id', 'operador_nome',
  'descricao_servico', 'data_inicio', 'data_fim',
  'horimetro_inicial', 'horimetro_final', 'horas_trabalhadas', 'valor_hora', 'faturamento_bruto',
  'valor_adiantamento', 'data_adiantamento', 'forma_pagamento_adiantamento', 'adiantamentos_historico',
  'saldo_restante', 'status_pagamento_cliente', 'forma_pagamento', 'condicao_pagamento',
  'conta_bancaria_id', 'prazo_descricao',
  'parcelas', 'combustivel_maquina_litros', 'combustivel_maquina_valor',
  'combustivel_apoio_litros', 'combustivel_apoio_valor', 'combustivel_total_valor',
  'foto_cupom_combustivel', 'foto_horimetro_inicial', 'foto_horimetro_final',
  'despesa_operador', 'despesa_apoio', 'despesa_manutencao', 'despesas_total',
  'lucro_liquido', 'margem_lucro', 'valor_hora_operador', 'adiantamento_operador_valor',
  'adiantamento_operador_data', 'saldo_pagar_operador', 'data_pagamento_operador',
  'status_pagamento_operador', 'status', 'observacoes', 'alerta_painel',
  'fotos_trabalho', 'maquinas_itens', 'abastecimentos_ids',
  'created_at', 'updated_at'
]);

function sanitizarPayloadSupabase(s: ServicoHorimetro): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(s)) {
    if (COLUNAS_SUPABASE_SERVICO.has(key) && value !== undefined) {
      p[key] = value;
    }
  }

  p.updated_at = new Date().toISOString();
  if (!isUuidValido(p.id as string)) p.id = gerarUuidV4();

  const uuidFields = ['cliente_id', 'operador_id', 'maquina_id', 'conta_bancaria_id', 'tenant_id', 'obra_id'];
  for (const f of uuidFields) {
    if (!p[f] || typeof p[f] !== 'string' || !isUuidValido(p[f] as string)) {
      if (f === 'tenant_id') {
        const ativo = typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null;
        p.tenant_id = (ativo && isUuidValido(ativo)) ? ativo : DEFAULT_LEGACY_TENANT;
      } else {
        delete p[f];
      }
    }
  }
  return p;
}

export async function persistirServicoSupabase(
  updated: ServicoHorimetro
): Promise<{ success: boolean; data?: ServicoHorimetro; error?: string }> {
  try {
    const limpo = sanitizarPayloadSupabase(updated);
    const resultado = await executarPersistenciaServico(limpo, (limpo.id as string) || updated.id);

    if (!resultado.success) {
      console.error('Falha ao persistir serviço:', resultado.error);
      return resultado;
    }

    const idFinal = resultado.data?.id || updated.id;
    await vincularAbastecimentosAoServico(idFinal, updated.abastecimentos_ids || [], updated.cliente_id, updated.cliente_nome);
    sincronizarServicoFinanceiro(resultado.data || updated).catch(() => {});

    return { success: true, data: resultado.data || updated };
  } catch (err: unknown) {
    console.error('Erro na camada de persistência de serviço:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Erro na persistência' };
  }
}
