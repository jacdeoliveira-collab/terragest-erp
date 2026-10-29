import { supabase } from '../lib/supabase';
import { salvarComprovante } from './comprovanteStorageService';
import type { LancarCupomCombustivelDTO } from '../types/cupomCombustivel.types';
import { aplicarFiltroTenant, DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export async function processarLancamentoCupom(dto: LancarCupomCombustivelDTO): Promise<{ success: boolean; cupomId?: string; error?: string }> {
  try {
    const cupomId = 'CUP_' + Date.now().toString(36).toUpperCase();
    const tenantId = dto.tenantId || (typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null) || DEFAULT_LEGACY_TENANT;

    const valorMaq = Number(dto.maquinaPrincipal.valorTotal) || 0;
    const valorApoio = Number(dto.veiculoApoio?.valorTotal) || 0;
    const totalValor = Number((valorMaq + valorApoio).toFixed(2));
    const litrosMaq = Number(dto.maquinaPrincipal.quantidadeLitros) || 0;
    const litrosApoio = Number(dto.veiculoApoio?.quantidadeLitros) || 0;
    const totalLitros = Number((litrosMaq + litrosApoio).toFixed(2));

    if (dto.fotoCupomUrl) await salvarComprovante(cupomId, dto.fotoCupomUrl);

    // 1. Busca serviço vinculado para herdar cliente e vincular despesa
    let srv: any = null;
    if (dto.servicoId) {
      const { data: s } = await supabase.from('servicos_horimetro').select('*').eq('id', dto.servicoId).maybeSingle();
      srv = s;
    }

    // 2. Inserir despesa consolidada em CONTAS A PAGAR (Sem Base64 no banco)
    const linkValido = dto.fotoCupomUrl && !dto.fotoCupomUrl.startsWith('data:image/') && dto.fotoCupomUrl.length < 500;
    const fotoLinkSeguro = linkValido ? dto.fotoCupomUrl : null;

    const descPagar = `Diesel Posto: ${dto.postoFornecedor || 'Posto'} (${dto.maquinaPrincipal.maquinaNome || 'Máq'}${dto.veiculoApoio?.maquinaNome ? ' + ' + dto.veiculoApoio.maquinaNome : ''})`.slice(0, 150);
    const tagFoto = fotoLinkSeguro ? `[FOTO:${fotoLinkSeguro}] ` : '';
    const obsDespesa = `[REF:${cupomId}] ${tagFoto}Conta: ${dto.contaSaida} | Litros: ${totalLitros}L | Doc: ${dto.numeroNfCupom || 'Cupom'}${srv ? ` | Cliente: ${srv.cliente_nome}` : ''}`;

    let existCupId: string | null = null;
    if (dto.numeroNfCupom) {
      const qCup = aplicarFiltroTenant(supabase.from('contas_pagar').select('id').eq('categoria', 'COMBUSTIVEL').ilike('observacoes', `%Doc: ${dto.numeroNfCupom}%`), tenantId);
      const { data: existCup } = await qCup.maybeSingle();
      if (existCup) existCupId = existCup.id;
    }

    const payloadPagar = {
      tenant_id: tenantId, obra_id: dto.obraId || srv?.obra_id || null, descricao: descPagar,
      fornecedor: (dto.postoFornecedor || 'Posto').slice(0, 80), categoria: 'COMBUSTIVEL',
      valor: totalValor, data_vencimento: dto.data, data_pagamento: dto.statusPagamento === 'PAGO' ? dto.data : null,
      forma_pagamento: dto.formaPagamento, status: dto.statusPagamento, observacoes: obsDespesa
    };

    if (existCupId) await supabase.from('contas_pagar').update(payloadPagar).eq('id', existCupId);
    else {
      const { error: errPagar } = await supabase.from('contas_pagar').insert([payloadPagar]);
      if (errPagar) throw new Error(`Falha no financeiro: ${errPagar.message}`);
    }

    // 3. Inserir abastecimento da MÁQUINA PRINCIPAL
    let idMaq: string | undefined;
    if (litrosMaq > 0) {
      const docMaq = `${dto.numeroNfCupom || 'Cupom'} [REF:${cupomId}:MAQ]`.slice(0, 75);
      const { data: insMaq, error: errMaq } = await supabase.from('abastecimentos').insert([{
        tenant_id: tenantId, obra_id: dto.obraId || srv?.obra_id || null,
        servico_id: dto.servicoId || null, cliente_id: srv?.cliente_id || null, cliente_nome: srv?.cliente_nome || null,
        maquina_id: dto.maquinaPrincipal.maquinaId, data: dto.data, tipo_combustivel: dto.maquinaPrincipal.tipoCombustivel,
        origem: 'POSTO', quantidade_litros: litrosMaq, valor_total: valorMaq,
        horimetro_momento: Number(dto.maquinaPrincipal.horimetro) || 0,
        posto_fornecedor: (dto.postoFornecedor || 'Posto').slice(0, 80),
        numero_requisicao_nf: docMaq, foto_comprovante: fotoLinkSeguro
      }]).select('id').maybeSingle();

      if (errMaq) throw new Error(`Falha no abastecimento da máquina: ${errMaq.message}`);
      idMaq = insMaq?.id;

      if (dto.maquinaPrincipal.horimetro && Number(dto.maquinaPrincipal.horimetro) > 0) {
        await supabase.from('equipment').update({ current_hourmeter: Number(dto.maquinaPrincipal.horimetro) }).eq('id', dto.maquinaPrincipal.maquinaId);
      }
    }

    // 4. Inserir abastecimento do VEÍCULO DE APOIO
    let idApoio: string | undefined;
    if (dto.veiculoApoio && litrosApoio > 0) {
      const docApoio = `${dto.numeroNfCupom || 'Apoio'} [REF:${cupomId}:APOIO]`.slice(0, 75);
      const { data: insApoio, error: errApoio } = await supabase.from('abastecimentos').insert([{
        tenant_id: tenantId, obra_id: dto.obraId || srv?.obra_id || null,
        servico_id: dto.servicoId || null, cliente_id: srv?.cliente_id || null, cliente_nome: srv?.cliente_nome || null,
        maquina_id: dto.veiculoApoio.maquinaId, data: dto.data, tipo_combustivel: dto.veiculoApoio.tipoCombustivel,
        origem: 'POSTO', quantidade_litros: litrosApoio, valor_total: valorApoio,
        horimetro_momento: Number(dto.veiculoApoio.horimetro) || 0,
        posto_fornecedor: (dto.postoFornecedor || 'Posto').slice(0, 80),
        numero_requisicao_nf: docApoio, foto_comprovante: fotoLinkSeguro
      }]).select('id').maybeSingle();
      if (errApoio) throw new Error(`Falha no abastecimento de apoio: ${errApoio.message}`);
      idApoio = insApoio?.id;
    }

    // 5. Vincular custo e IDs ao SERVIÇO POR HORÍMETRO
    if (srv && dto.servicoId) {
      const novosIds = Array.from(new Set([...(srv.abastecimentos_ids || []), ...(idMaq ? [idMaq] : []), ...(idApoio ? [idApoio] : [])]));
      const nLitros = Number(srv.combustivel_maquina_litros || 0) + litrosMaq;
      const nValor = Number(srv.combustivel_maquina_valor || 0) + valorMaq;
      const nTotLitros = nLitros + Number(srv.combustivel_apoio_litros || 0) + litrosApoio;
      const nTotComb = nValor + Number(srv.combustivel_apoio_valor || 0) + valorApoio;
      const nDesp = nTotComb + Number(srv.despesa_operador || 0) + Number(srv.despesa_apoio || 0) + Number(srv.despesa_manutencao || 0);
      const agora = new Date().toISOString();

      const payloadServ = {
        combustivel_maquina_litros: nLitros, combustivel_maquina_valor: nValor,
        combustivel_total_litros: nTotLitros, combustivel_total_valor: nTotComb,
        despesas_total: nDesp, lucro_liquido: Number(srv.faturamento_bruto || 0) - nDesp,
        abastecimentos_ids: novosIds, foto_cupom_combustivel: fotoLinkSeguro || srv.foto_cupom_combustivel,
        updated_at: agora
      };

      await supabase.from('servicos_horimetro').update(payloadServ).eq('id', dto.servicoId);
    }

    return { success: true, cupomId };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao processar lançamento do cupom' };
  }
}
