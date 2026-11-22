import { supabase } from '../lib/supabase';
import { isVehicleOrTruck } from '../utils/equipmentMeasurement';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import type { AbastecimentoItem } from '../types/abastecimento.types';

/**
 * Vincula e recalcula abastecimentos da frota aos serviços de locação por horímetro,
 * garantindo que cada abastecimento seja contabilizado em no máximo 1 serviço (sem duplicidade).
 */
export async function autoSincronizarServicosEAbastecimentos(
  servicos: ServicoHorimetro[],
  abastecimentos: AbastecimentoItem[]
): Promise<{ atualizados: number; servicosAtualizados: ServicoHorimetro[] }> {
  if (!servicos.length) {
    return { atualizados: 0, servicosAtualizados: servicos };
  }

  let count = 0;
  const listaAtualizada = [...servicos];
  const abastUsados = new Set<string>(
    abastecimentos.filter((ab) => Boolean(ab.servico_id)).map((ab) => ab.id)
  );

  for (let i = 0; i < listaAtualizada.length; i++) {
    const s = listaAtualizada[i];
    const codMatch = (s.maquina_nome || '').match(/\(([^)]+)\)/);
    const codigoMaq = (codMatch ? codMatch[1] : s.maquina_nome || '').trim().toUpperCase();

    const vinculadosDiretos = abastecimentos.filter(
      (ab) => ab.servico_id === s.id || ab.numero_requisicao_nf?.includes(s.id)
    );

    const novosPorData = vinculadosDiretos.length > 0
      ? []
      : abastecimentos.filter((ab) => {
          if (ab.servico_id || abastUsados.has(ab.id)) return false;
          const c = (ab.maquina_codigo || '').toUpperCase();
          const n = (ab.maquina_nome || '').toUpperCase();
          if (!codigoMaq || !(c.includes(codigoMaq) || n.includes(codigoMaq))) return false;
          if (s.data_inicio && ab.data) {
            const dAbast = ab.data.slice(0, 10);
            const dIni = s.data_inicio.slice(0, 10);
            const dFim = (s.data_fim || s.data_inicio).slice(0, 10);
            return dAbast >= dIni && dAbast <= dFim;
          }
          return false;
        });

    const abastsDoServico = [...vinculadosDiretos, ...novosPorData];
    abastsDoServico.forEach((ab) => abastUsados.add(ab.id));

    let maqL = 0, maqV = 0, apoioL = 0, apoioV = 0;
    abastsDoServico.forEach((ab) => {
      const isApoio = isVehicleOrTruck({ code: ab.maquina_codigo, name: ab.maquina_nome }) || ab.numero_requisicao_nf?.toUpperCase().includes('APOIO');
      const lit = Number(ab.quantidade_litros) || 0;
      const val = Number(ab.valor_total) || 0;
      if (isApoio) { apoioL += lit; apoioV += val; } else { maqL += lit; maqV += val; }
    });

    const totComb = Number((maqV + apoioV).toFixed(2));
    const atualComb = Number(s.combustivel_total_valor || 0);
    const precisaAtualizar = Math.abs(atualComb - totComb) > 0.01;

    if (precisaAtualizar) {
      const totDesp = Number((totComb + Number(s.despesa_operador || 0) + Number(s.despesa_apoio || 0) + Number(s.despesa_manutencao || 0)).toFixed(2));
      const fatBruto = Number(s.faturamento_bruto || 0);
      const lucroLiq = Number((fatBruto - totDesp).toFixed(2));
      const margem = fatBruto > 0 ? Number(((lucroLiq / fatBruto) * 100).toFixed(1)) : 0;
      const idsVinculados = abastsDoServico.map((a) => a.id);

      const servicoAtualizado: ServicoHorimetro = {
        ...s,
        combustivel_maquina_litros: Number(maqL.toFixed(2)),
        combustivel_maquina_valor: Number(maqV.toFixed(2)),
        combustivel_apoio_litros: Number(apoioL.toFixed(2)),
        combustivel_apoio_valor: Number(apoioV.toFixed(2)),
        combustivel_total_valor: totComb,
        abastecimentos_ids: idsVinculados,
        despesas_total: totDesp,
        lucro_liquido: lucroLiq,
        margem_lucro: margem
      };

      listaAtualizada[i] = servicoAtualizado;
      count++;

      await supabase.from('servicos_horimetro').update({
        combustivel_maquina_litros: servicoAtualizado.combustivel_maquina_litros,
        combustivel_maquina_valor: servicoAtualizado.combustivel_maquina_valor,
        combustivel_apoio_litros: servicoAtualizado.combustivel_apoio_litros,
        combustivel_apoio_valor: servicoAtualizado.combustivel_apoio_valor,
        combustivel_total_valor: servicoAtualizado.combustivel_total_valor,
        abastecimentos_ids: idsVinculados,
        despesas_total: servicoAtualizado.despesas_total,
        lucro_liquido: servicoAtualizado.lucro_liquido,
        margem_lucro: servicoAtualizado.margem_lucro
      }).eq('id', s.id);

      if (novosPorData.length > 0) {
        await supabase.from('abastecimentos').update({ servico_id: s.id }).in('id', novosPorData.map((a) => a.id));
      }
    }
  }

  return { atualizados: count, servicosAtualizados: listaAtualizada };
}
