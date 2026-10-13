import type { PontoGraficoHoras } from '../types/dashboard.types';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export interface ConsolidadoHorasOperacionais {
  totalHoras: number;
  dadosGraficoHoras: PontoGraficoHoras[];
  custoExtraCombustivel: number;
  litrosExtraCombustivel: number;
}

export function formatarDataGrafico(dataStr?: string | null): string {
  if (!dataStr) return '';
  const pt = dataStr.slice(0, 10).split('-');
  return pt.length === 3 ? `${pt[2]}/${pt[1]}` : dataStr;
}

/**
 * Consolida horas trabalhadas e combustível de Boletins Diários (BDE)
 * e de Serviços Comerciais por Horímetro.
 */
export function consolidarHorasOperacionais(
  bulletins: any[],
  servicos: ServicoHorimetro[]
): ConsolidadoHorasOperacionais {
  let totalHoras = 0;
  const horasPorDia: Record<string, number> = {};
  let custoExtraComb = 0;
  let litrosExtraComb = 0;

  // 1. Processa Boletins Diários de Equipamento (BDE)
  (bulletins || []).forEach((b) => {
    const diff = Number(b.final_hourmeter) - Number(b.initial_hourmeter);
    const h = Math.max(0, isNaN(diff) || diff === 0 ? Number(b.total_hours) || 0 : diff);
    totalHoras += h;
    const label = formatarDataGrafico(b.date);
    if (label) {
      horasPorDia[label] = (horasPorDia[label] || 0) + h;
    }
  });

  // 2. Processa Serviços por Horímetro
  (servicos || []).forEach((s) => {
    const h = Number(s.horas_trabalhadas) || 0;
    if (h > 0) {
      totalHoras += h;
      const dataRef = s.data_fim || s.data_inicio || s.created_at;
      const label = formatarDataGrafico(dataRef);
      if (label) {
        horasPorDia[label] = (horasPorDia[label] || 0) + h;
      }
    }

    const cComb = Number(s.combustivel_total_valor || (s as any).combustivel_valor) || 0;
    const lComb = Number(s.combustivel_maquina_litros || 0) + Number(s.combustivel_apoio_litros || 0);
    custoExtraComb += cComb;
    litrosExtraComb += lComb;
  });

  // Converte para ordenação cronológica pelo dia/mês
  const dadosGraficoHoras: PontoGraficoHoras[] = Object.entries(horasPorDia).map(
    ([data, horas]) => ({
      data,
      horas: Number(horas.toFixed(1))
    })
  );

  return {
    totalHoras: Number(totalHoras.toFixed(1)),
    dadosGraficoHoras,
    custoExtraCombustivel: custoExtraComb,
    litrosExtraCombustivel: litrosExtraComb
  };
}

export interface PontoEficiencia {
  data: string;
  horasPagas: number;
  horasProduzidas: number;
  ociosidadeHoras: number;
  percentualOciosidade: number;
}

export function calcularPontosEficiencia(bulletins: any[], servicos: ServicoHorimetro[]): PontoEficiencia[] {
  const agrupado: Record<string, { pagas: number; produzidas: number }> = {};

  if (Array.isArray(bulletins) && bulletins.length > 0) {
    bulletins.forEach((b) => {
      const label = formatarDataGrafico(b.date);
      if (!label) return;
      if (!agrupado[label]) agrupado[label] = { pagas: 0, produzidas: 0 };

      const diff = Number(b.final_hourmeter) - Number(b.initial_hourmeter);
      const horasMaq = Math.max(0, isNaN(diff) ? Number(b.total_hours) || 0 : diff);
      agrupado[label].produzidas += horasMaq;

      if (b.hora_inicio_jornada && b.hora_fim_jornada) {
        const [h1, m1] = b.hora_inicio_jornada.split(':').map(Number);
        const [h2, m2] = b.hora_fim_jornada.split(':').map(Number);
        const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
        agrupado[label].pagas += Math.max(0, Number((mins / 60).toFixed(1)));
      } else {
        agrupado[label].pagas += horasMaq;
      }
    });
  } else if (Array.isArray(servicos) && servicos.length > 0) {
    servicos.forEach((s) => {
      const h = Number(s.horas_trabalhadas) || 0;
      if (h <= 0) return;
      const label = formatarDataGrafico(s.data_fim || s.data_inicio || s.created_at);
      if (!label) return;
      if (!agrupado[label]) agrupado[label] = { pagas: 0, produzidas: 0 };
      agrupado[label].produzidas += h;
      agrupado[label].pagas += h;
    });
  }

  return Object.keys(agrupado).map((dt): PontoEficiencia => {
    const pagas = Number(agrupado[dt].pagas.toFixed(1));
    const produzidas = Number(agrupado[dt].produzidas.toFixed(1));
    const ociosidadeHoras = Math.max(0, Number((pagas - produzidas).toFixed(1)));
    const percentualOciosidade = pagas > 0 ? Number(((ociosidadeHoras / pagas) * 100).toFixed(1)) : 0;
    return { data: dt, horasPagas: pagas, horasProduzidas: produzidas, ociosidadeHoras, percentualOciosidade };
  });
}
