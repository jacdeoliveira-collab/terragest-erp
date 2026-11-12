import { supabase } from '../lib/supabase';
import { isVehicleOrTruck } from '../utils/equipmentMeasurement';

/**
 * Remove o vínculo de um abastecimento excluído nos serviços por horímetro
 * e recalcula os totais de combustível/lucro do serviço afetado para evitar ressurreição.
 */
export async function desvincularAbastecimentoDeServicos(abastecimentoId: string, servicoIdHint?: string | null): Promise<void> {
  try {
    let query = supabase
      .from('servicos_horimetro')
      .select('id, abastecimentos_ids, despesa_operador, despesa_apoio, despesa_manutencao, faturamento_bruto');

    if (servicoIdHint) {
      query = query.or(`id.eq.${servicoIdHint},abastecimentos_ids.cs.{${abastecimentoId}}`);
    } else {
      query = query.contains('abastecimentos_ids', [abastecimentoId]);
    }

    const { data: servicosAfetados } = await query;
    if (!servicosAfetados || servicosAfetados.length === 0) return;

    for (const srv of servicosAfetados) {
      const idsAtuais: string[] = Array.isArray(srv.abastecimentos_ids) ? srv.abastecimentos_ids : [];
      const novosIds = idsAtuais.filter((id) => id !== abastecimentoId);

      const { data: restantes } = await supabase
        .from('abastecimentos')
        .select('id, quantidade_litros, valor_total, tipo_combustivel, equipment:equipment_id(code, name)')
        .or(
          novosIds.length > 0
            ? `servico_id.eq.${srv.id},id.in.(${novosIds.join(',')})`
            : `servico_id.eq.${srv.id}`
        );

      let maqL = 0, maqV = 0, apoioL = 0, apoioV = 0;
      const lista = (restantes || []).filter((r) => r.id !== abastecimentoId);

      for (const ab of lista) {
        const eq = Array.isArray(ab.equipment) ? ab.equipment[0] : ab.equipment;
        const isApoio = isVehicleOrTruck({ code: eq?.code, name: eq?.name }) || ab.tipo_combustivel === 'DIESEL_S10';
        const lit = Number(ab.quantidade_litros) || 0;
        const val = Number(ab.valor_total) || 0;
        if (isApoio) { apoioL += lit; apoioV += val; } else { maqL += lit; maqV += val; }
      }

      const totComb = Number((maqV + apoioV).toFixed(2));
      const totDesp = Number((totComb + Number(srv.despesa_operador || 0) + Number(srv.despesa_apoio || 0) + Number(srv.despesa_manutencao || 0)).toFixed(2));
      const fatBruto = Number(srv.faturamento_bruto || 0);
      const lucroLiq = Number((fatBruto - totDesp).toFixed(2));
      const margem = fatBruto > 0 ? Number(((lucroLiq / fatBruto) * 100).toFixed(1)) : 0;

      await supabase.from('servicos_horimetro').update({
        abastecimentos_ids: lista.map((r) => r.id),
        combustivel_maquina_litros: Number(maqL.toFixed(2)),
        combustivel_maquina_valor: Number(maqV.toFixed(2)),
        combustivel_apoio_litros: Number(apoioL.toFixed(2)),
        combustivel_apoio_valor: Number(apoioV.toFixed(2)),
        combustivel_total_valor: totComb,
        despesas_total: totDesp,
        lucro_liquido: lucroLiq,
        margem_lucro: margem,
        updated_at: new Date().toISOString()
      }).eq('id', srv.id);
    }
  } catch (err) {
    console.warn('[servicoAbastecimentoCleanup] Erro ao desvincular abastecimento:', err);
  }
}

