import { supabase } from '../lib/supabase';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

const MAQ_PADRAO_ID = '40d4e2f6-bb01-4898-8660-e5646a2d1a08';
const APOIO_PADRAO_ID = '021f824a-4f94-4d4a-9f5c-97a6cc8bf0ee';

async function resolverEquipamento(tipo: 'MAQ' | 'APOIO', maquinaNome?: string): Promise<string> {
  try {
    const { data: eqs } = await supabase.from('equipment').select('id, code, name');
    if (!eqs || eqs.length === 0) return tipo === 'MAQ' ? MAQ_PADRAO_ID : APOIO_PADRAO_ID;
    if (tipo === 'MAQ') {
      const matchCod = (maquinaNome || '').match(/\(([^)]+)\)/);
      const cod = matchCod ? matchCod[1].trim().toUpperCase() : '';
      const achado = eqs.find((e) => (cod && e.code.toUpperCase() === cod) || (maquinaNome && e.name.toLowerCase().includes(maquinaNome.toLowerCase())));
      return achado?.id || MAQ_PADRAO_ID;
    }
    const apoio = eqs.find((e) => e.code.includes('3125') || /hilux|caminhonete|veiculo|veículo|apoio/i.test(e.name));
    return apoio?.id || APOIO_PADRAO_ID;
  } catch {
    return tipo === 'MAQ' ? MAQ_PADRAO_ID : APOIO_PADRAO_ID;
  }
}

export async function sincronizarAbastecimentosDoServico(
  servico: ServicoHorimetro,
  obraId: string | null,
  tenantId: string
): Promise<string[]> {
  if (!servico?.id) return [];
  const tId = tenantId || servico.tenant_id || DEFAULT_LEGACY_TENANT;
  const oId = obraId || servico.obra_id || 'a1aa1351-5e2e-4b9d-b5b9-3bd7cec521b1';
  const dataRef = servico.data_inicio || new Date().toISOString().slice(0, 10);
  const idsFinal: string[] = Array.isArray(servico.abastecimentos_ids) ? [...servico.abastecimentos_ids] : [];

  try {
    const { data: existentes } = await supabase
      .from('abastecimentos')
      .select('id, numero_requisicao_nf, maquina_id, servico_id')
      .or(`servico_id.eq.${servico.id},numero_requisicao_nf.ilike.%[REF:${servico.id}:%`);

    const listaExist = existentes || [];
    const existMaq = listaExist.find((a) => a.numero_requisicao_nf?.includes(`[REF:${servico.id}:MAQ]`) || a.numero_requisicao_nf?.includes(':MAQ]'));
    const existApoio = listaExist.find((a) => a.numero_requisicao_nf?.includes(`[REF:${servico.id}:APOIO]`) || a.numero_requisicao_nf?.includes(':APOIO]'));

    const litMaq = Number(servico.combustivel_maquina_litros || 0);
    const valMaq = Number(servico.combustivel_maquina_valor || 0);
    const litApoio = Number(servico.combustivel_apoio_litros || 0);
    const valApoio = Number(servico.combustivel_apoio_valor || 0);

    if (litMaq > 0) {
      const maqId = servico.maquina_id || await resolverEquipamento('MAQ', servico.maquina_nome);
      const payloadMaq = {
        tenant_id: tId, obra_id: oId, servico_id: servico.id,
        cliente_id: servico.cliente_id || null, cliente_nome: servico.cliente_nome || null,
        maquina_id: maqId, data: dataRef, tipo_combustivel: 'DIESEL_S500',
        quantidade_litros: litMaq, valor_total: valMaq,
        horimetro_momento: Number(servico.horimetro_final || servico.horimetro_inicial || 0),
        posto_fornecedor: 'Posto de Combustível / Cupom Fiscal',
        numero_requisicao_nf: `Cupom [REF:${servico.id}:MAQ]`,
        foto_comprovante: servico.foto_cupom_combustivel || null,
        origem: 'POSTO'
      };
      if (existMaq) {
        await supabase.from('abastecimentos').update(payloadMaq).eq('id', existMaq.id);
        if (!idsFinal.includes(existMaq.id)) idsFinal.push(existMaq.id);
      } else {
        const { data: insMaq } = await supabase.from('abastecimentos').insert([payloadMaq]).select('id').maybeSingle();
        if (insMaq?.id && !idsFinal.includes(insMaq.id)) idsFinal.push(insMaq.id);
      }
    } else if (existMaq && existMaq.numero_requisicao_nf?.includes(`[REF:${servico.id}:MAQ]`)) {
      await supabase.from('abastecimentos').delete().eq('id', existMaq.id);
    }

    if (litApoio > 0) {
      const apoioId = await resolverEquipamento('APOIO');
      const payloadApoio = {
        tenant_id: tId, obra_id: oId, servico_id: servico.id,
        cliente_id: servico.cliente_id || null, cliente_nome: servico.cliente_nome || null,
        maquina_id: apoioId, data: dataRef, tipo_combustivel: 'DIESEL_S10',
        quantidade_litros: litApoio, valor_total: valApoio,
        horimetro_momento: 0,
        posto_fornecedor: 'Posto de Combustível / Apoio',
        numero_requisicao_nf: `Apoio [REF:${servico.id}:APOIO]`,
        foto_comprovante: servico.foto_cupom_combustivel || null,
        origem: 'POSTO'
      };
      if (existApoio) {
        await supabase.from('abastecimentos').update(payloadApoio).eq('id', existApoio.id);
        if (!idsFinal.includes(existApoio.id)) idsFinal.push(existApoio.id);
      } else {
        const { data: insApoio } = await supabase.from('abastecimentos').insert([payloadApoio]).select('id').maybeSingle();
        if (insApoio?.id && !idsFinal.includes(insApoio.id)) idsFinal.push(insApoio.id);
      }
    } else if (existApoio && existApoio.numero_requisicao_nf?.includes(`[REF:${servico.id}:APOIO]`)) {
      await supabase.from('abastecimentos').delete().eq('id', existApoio.id);
    }

    if (idsFinal.length !== (servico.abastecimentos_ids?.length || 0)) {
      await supabase.from('servicos_horimetro').update({ abastecimentos_ids: idsFinal }).eq('id', servico.id);
    }
  } catch (err) {
    console.warn('[servicoAbastecimentoSync] Erro na sincronização:', err);
  }
  return idsFinal;
}

export async function sincronizarTodosAbastecimentosDeServicos(): Promise<void> {
  try {
    const { data: srvs } = await supabase
      .from('servicos_horimetro')
      .select('*')
      .or('combustivel_maquina_litros.gt.0,combustivel_apoio_litros.gt.0');
    if (!srvs || srvs.length === 0) return;
    for (const s of srvs) {
      await sincronizarAbastecimentosDoServico(s, s.obra_id, s.tenant_id);
    }
  } catch (err) {
    console.warn('[servicoAbastecimentoSync] Erro no sync em massa:', err);
  }
}
