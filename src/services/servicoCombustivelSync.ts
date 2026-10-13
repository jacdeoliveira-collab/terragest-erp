import { supabase } from '../lib/supabase';
import { isVehicleOrTruck } from '../utils/equipmentMeasurement';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';
import type { AbastecimentoItem } from '../types/abastecimento.types';

/**
 * Vincula e sincroniza automaticamente abastecimentos da frota aos serviços de locação por horímetro.
 */
export async function autoSincronizarServicosEAbastecimentos(
  servicos: ServicoHorimetro[],
  abastecimentos: AbastecimentoItem[]
): Promise<{ atualizados: number; servicosAtualizados: ServicoHorimetro[] }> {
  if (!servicos.length || !abastecimentos.length) {
    return { atualizados: 0, servicosAtualizados: servicos };
  }

  let count = 0;
  const listaAtualizada = [...servicos];

  for (let i = 0; i < listaAtualizada.length; i++) {
    const s = listaAtualizada[i];

    // Se o serviço estiver sem combustível ou com valor menor que os abastecimentos da máquina
    const codMatch = s.maquina_nome.match(/\(([^)]+)\)/);
    const codigoMaq = (codMatch ? codMatch[1] : s.maquina_nome).trim().toUpperCase();

    // Abastecimentos desta máquina e dos apoios vinculados
    const abastsDaMaquina = abastecimentos.filter((ab) => {
      const c = (ab.maquina_codigo || '').toUpperCase();
      const n = (ab.maquina_nome || '').toUpperCase();

      // Se vinculado por ID
      if (ab.numero_requisicao_nf?.includes(s.id)) return true;

      // Se é da máquina principal
      if (codigoMaq && (c.includes(codigoMaq) || n.includes(codigoMaq))) {
        // Se tem data do serviço e do abastecimento
        if (s.data_inicio && ab.data) {
          const dAbast = ab.data.slice(0, 10);
          const dIni = s.data_inicio.slice(0, 10);
          const dFim = (s.data_fim || s.data_inicio).slice(0, 10);
          return dAbast >= dIni && dAbast <= dFim;
        }
        return true;
      }

      return false;
    });

    if (abastsDaMaquina.length > 0 && (Number(s.combustivel_total_valor) || 0) === 0) {
      let maqL = 0;
      let maqV = 0;
      let apoioL = 0;
      let apoioV = 0;

      abastsDaMaquina.forEach((ab) => {
        const isApoio = isVehicleOrTruck({ code: ab.maquina_codigo, name: ab.maquina_nome });
        const lit = Number(ab.quantidade_litros) || 0;
        const val = Number(ab.valor_total) || 0;
        if (isApoio) { apoioL += lit; apoioV += val; } else { maqL += lit; maqV += val; }
      });

      const totComb = maqV + apoioV;
      const totDesp = totComb + Number(s.despesa_operador || 0) + Number(s.despesa_apoio || 0) + Number(s.despesa_manutencao || 0);
      const fatBruto = Number(s.faturamento_bruto || 0);
      const lucroLiq = fatBruto - totDesp;
      const margem = fatBruto > 0 ? Number(((lucroLiq / fatBruto) * 100).toFixed(1)) : 0;

      const servicoAtualizado: ServicoHorimetro = {
        ...s,
        combustivel_maquina_litros: Number(maqL.toFixed(2)),
        combustivel_maquina_valor: Number(maqV.toFixed(2)),
        combustivel_apoio_litros: Number(apoioL.toFixed(2)),
        combustivel_apoio_valor: Number(apoioV.toFixed(2)),
        combustivel_total_valor: Number(totComb.toFixed(2)),
        despesas_total: Number(totDesp.toFixed(2)),
        lucro_liquido: Number(lucroLiq.toFixed(2)),
        margem_lucro: margem
      };

      listaAtualizada[i] = servicoAtualizado;
      count++;

      // Atualiza no banco
      await supabase.from('servicos_horimetro').update({
        combustivel_maquina_litros: servicoAtualizado.combustivel_maquina_litros,
        combustivel_maquina_valor: servicoAtualizado.combustivel_maquina_valor,
        combustivel_apoio_litros: servicoAtualizado.combustivel_apoio_litros,
        combustivel_apoio_valor: servicoAtualizado.combustivel_apoio_valor,
        combustivel_total_valor: servicoAtualizado.combustivel_total_valor,
        despesas_total: servicoAtualizado.despesas_total,
        lucro_liquido: servicoAtualizado.lucro_liquido,
        margem_lucro: servicoAtualizado.margem_lucro
      }).eq('id', s.id);
    }
  }

  return { atualizados: count, servicosAtualizados: listaAtualizada };
}
