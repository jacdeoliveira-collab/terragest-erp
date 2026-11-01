import { supabase } from '../lib/supabase';
import { sincronizarDespesa, removerDespesaPorRef } from './contasPagarSyncHelper';

interface ManutencaoRow {
  id: string;
  tenant_id?: string | null;
  obra_id?: string | null;
  maquina_id?: string;
  equipment_id?: string;
  descricao_servico?: string;
  servico?: string;
  tipo_servico?: string;
  tipo_manutencao?: string;
  data_servico?: string;
  data_ultima_execucao?: string;
  responsavel_mecanico?: string | null;
  valor_pecas?: number;
  valor_mao_obra?: number;
  comprovante_url?: string | null;
}

export function extrairMetadadosTipoServico(rawTipo?: string): {
  tipoManutencao: 'PREVENTIVA' | 'CORRETIVA';
  responsavelMecanico?: string;
} {
  if (!rawTipo) return { tipoManutencao: 'PREVENTIVA' };
  const partes = rawTipo.split('|').map((s) => s.trim());
  const isCorretiva = partes[0]?.toUpperCase().includes('CORRETIVA');
  const mec = partes[1] || undefined;
  return {
    tipoManutencao: isCorretiva ? 'CORRETIVA' : 'PREVENTIVA',
    responsavelMecanico: mec
  };
}

export function codificarTipoServicoBanco(
  tipoManutencao?: string,
  responsavelMecanico?: string | null
): string {
  const tipo = tipoManutencao === 'CORRETIVA' ? 'CORRETIVA' : 'PREVENTIVA';
  const mec = responsavelMecanico?.trim();
  return (mec ? `${tipo}|${mec}` : tipo).slice(0, 145);
}

/**
 * Manutenção (preventiva/corretiva) -> Contas a Pagar + Repositório de Documentos do Equipamento.
 * Peças e mão de obra geram despesas separadas, vinculadas à obra e identificadas pelo [REF].
 */
export async function sincronizarManutencaoFinanceiro(m: ManutencaoRow): Promise<void> {
  const pecas = Number(m.valor_pecas) || 0;
  const maoObra = Number(m.valor_mao_obra) || 0;
  const maqId = m.maquina_id || m.equipment_id;
  const meta = extrairMetadadosTipoServico(m.tipo_servico);
  const tipoManut = m.tipo_manutencao || meta.tipoManutencao;
  const mecanico = m.responsavel_mecanico?.trim() || meta.responsavelMecanico;
  const servico = m.descricao_servico || m.servico || 'Manutenção';
  const venc = m.data_servico || m.data_ultima_execucao || new Date().toISOString().slice(0, 10);

  // Se houver comprovante do Google Drive, registra também em equipamento_documentos
  if (m.comprovante_url && maqId && m.comprovante_url.startsWith('http')) {
    const tagDoc = `[MANUT_${m.id}]`;
    const { data: docExist } = await supabase
      .from('equipamento_documentos')
      .select('id')
      .eq('equipamento_id', maqId)
      .ilike('observacoes', `%${tagDoc}%`)
      .maybeSingle();

    const docPayload = {
      tenant_id: m.tenant_id || null,
      equipamento_id: maqId,
      nome: `Comprovante OS: ${servico}`.slice(0, 190),
      tipo: 'LAUDO_MANUTENCAO',
      orgao_emissor: mecanico ? mecanico.slice(0, 110) : 'Oficina / Manutenção',
      data_validade: venc,
      drive_url: m.comprovante_url.trim(),
      observacoes: `${tagDoc} Peças: R$ ${pecas.toFixed(2)} | MO: R$ ${maoObra.toFixed(2)}`
    };

    if (docExist?.id) {
      await supabase.from('equipamento_documentos').update(docPayload).eq('id', docExist.id);
    } else {
      await supabase.from('equipamento_documentos').insert([docPayload]);
    }
  }

  if (pecas <= 0 && maoObra <= 0) return;

  let maquina = '';
  if (maqId) {
    const { data: eq } = await supabase.from('equipment').select('code, name').eq('id', maqId).maybeSingle();
    if (eq) maquina = `${eq.code} - ${eq.name}`;
  }

  const tipoLabel = tipoManut === 'CORRETIVA' ? 'Corretiva' : 'Preventiva';
  const fornecedor = mecanico || 'Oficina / Fornecedor de peças';
  const obsFoto = m.comprovante_url && m.comprovante_url.startsWith('http') ? `[FOTO:${m.comprovante_url}]` : undefined;
  const base = { tenantId: m.tenant_id, obraId: m.obra_id, fornecedor, dataVencimento: venc, observacoes: obsFoto };

  if (pecas > 0) {
    await sincronizarDespesa({
      ...base,
      ref: `MANUT_${m.id}:PECAS`,
      categoria: 'PECAS_MANUTENCAO',
      descricao: `Peças ${tipoLabel}: ${servico}${maquina ? ` (${maquina})` : ''}`,
      valor: pecas
    });
  } else {
    await removerDespesaPorRef(`MANUT_${m.id}:PECAS`);
  }

  if (maoObra > 0) {
    await sincronizarDespesa({
      ...base,
      ref: `MANUT_${m.id}:MO`,
      categoria: 'OUTROS',
      descricao: `Mão de obra ${tipoLabel}: ${servico}${maquina ? ` (${maquina})` : ''}`,
      valor: maoObra
    });
  } else {
    await removerDespesaPorRef(`MANUT_${m.id}:MO`);
  }
}

export async function removerManutencaoFinanceiro(id: string): Promise<void> {
  await Promise.all([
    removerDespesaPorRef(`MANUT_${id}:PECAS`),
    removerDespesaPorRef(`MANUT_${id}:MO`),
    supabase.from('equipamento_documentos').delete().ilike('observacoes', `%[MANUT_${id}]%`)
  ]);
}
