import { supabase } from '../lib/supabase';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

/**
 * Garante que o cliente exista na tabela 'clientes' do Supabase.
 * Se já existir, retorna seu ID e enriquece telefone/documento caso ausentes.
 * Se não existir, cadastra no banco relacional e retorna o novo ID.
 */
export async function garantirClienteCadastrado(
  nome: string,
  documento?: string,
  telefone?: string,
  tenantId?: string
): Promise<string | undefined> {
  const nomeTrim = (nome || '').trim();
  if (!nomeTrim) return undefined;

  const tId = tenantId || DEFAULT_LEGACY_TENANT;

  try {
    let qCli = supabase
      .from('clientes')
      .select('id, nome, documento, telefone')
      .ilike('nome', nomeTrim);
    qCli = aplicarFiltroTenant(qCli, tId);
    const { data: existente } = await qCli.limit(1);

    if (existente && existente.length > 0) {
      const cli = existente[0];
      if ((!cli.documento && documento) || (!cli.telefone && telefone)) {
        await supabase.from('clientes').update({
          documento: documento || cli.documento,
          telefone: telefone || cli.telefone,
          updated_at: new Date().toISOString()
        }).eq('id', cli.id);
      }
      return cli.id;
    }

    const novoId = crypto.randomUUID ? crypto.randomUUID() : 'cli_' + Date.now();
    const { data: criado, error } = await supabase
      .from('clientes')
      .insert([{
        id: novoId,
        tenant_id: tId,
        nome: nomeTrim,
        documento: documento || null,
        telefone: telefone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (!error && criado) return criado.id;
    return novoId;
  } catch (err) {
    console.warn('[servicoDbSync] Erro ao sincronizar cliente:', err);
    return undefined;
  }
}

/**
 * Vincula e persiste na tabela 'abastecimentos' os registros associados ao serviço e cliente.
 */
export async function vincularAbastecimentosAoServico(
  servicoId: string,
  abastecimentosIds: string[],
  clienteId?: string,
  clienteNome?: string
): Promise<void> {
  if (!servicoId) return;

  try {
    // 1. Desvincula qualquer abastecimento previamente vinculado a este serviço
    await supabase
      .from('abastecimentos')
      .update({ servico_id: null })
      .eq('servico_id', servicoId);

    // 2. Fixa exclusivamente os abastecimentos selecionados para este serviço
    if (abastecimentosIds && abastecimentosIds.length > 0) {
      await supabase
        .from('abastecimentos')
        .update({
          servico_id: servicoId,
          cliente_id: clienteId || null,
          cliente_nome: clienteNome || null
        })
        .in('id', abastecimentosIds);
    }
  } catch (err) {
    console.warn('[servicoDbSync] Erro ao vincular abastecimentos:', err);
  }
}

/**
 * Varre os serviços e garante que todos os clientes já usados estejam no cadastro de clientes.
 */
export async function sincronizarClientesDeServicosPendentes(
  servicos: ServicoHorimetro[],
  tenantId?: string
): Promise<void> {
  if (!servicos || servicos.length === 0) return;
  const nomesUnicos = Array.from(new Set(servicos.map((s) => s.cliente_nome?.trim()).filter(Boolean)));
  for (const nome of nomesUnicos) {
    const srv = servicos.find((s) => s.cliente_nome?.trim() === nome);
    await garantirClienteCadastrado(nome, srv?.cliente_documento, srv?.cliente_telefone, tenantId);
  }
}
