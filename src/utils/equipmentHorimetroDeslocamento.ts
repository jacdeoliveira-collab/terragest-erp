import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export interface ServicoComDeslocamento {
  servico: ServicoHorimetro;
  horimetroInicial: number;
  horimetroFinal: number;
  horasFaturadas: number;
  // Deslocamento acumulado entre o fim do serviço anterior e o início deste
  deslocamentoHoras: number;
  horimetroAnteriorFinal?: number;
  houveDeslocamento: boolean;
}

export interface MetricasDeslocamento {
  itens: ServicoComDeslocamento[];
  totalHorasFaturadas: number;
  totalHorasDeslocamento: number;
  totalHorasRodadas: number;
  eficienciaFaturamento: number; // percentual de horas faturadas sobre o total
}

export function calcularDeslocamentoEntreServicos(servicos: ServicoHorimetro[]): MetricasDeslocamento {
  if (!servicos || servicos.length === 0) {
    return {
      itens: [],
      totalHorasFaturadas: 0,
      totalHorasDeslocamento: 0,
      totalHorasRodadas: 0,
      eficienciaFaturamento: 100
    };
  }

  // Ordena cronologicamente (mais antigo para o mais recente)
  const ordenados = [...servicos].sort((a, b) => {
    const dataA = a.data_inicio || a.created_at || '';
    const dataB = b.data_inicio || b.created_at || '';
    if (dataA !== dataB) return dataA.localeCompare(dataB);
    return (Number(a.horimetro_inicial) || 0) - (Number(b.horimetro_inicial) || 0);
  });

  let ultimoHorimetroFinal: number | undefined = undefined;
  let somaFaturadas = 0;
  let somaDeslocamento = 0;

  const itensCronologicos: ServicoComDeslocamento[] = ordenados.map((s) => {
    const hIni = Number(s.horimetro_inicial) || 0;
    const hCadastradoFim = Number(s.horimetro_final) || 0;
    const hTrab = Number(s.horas_trabalhadas) || 0;
    const hFim = hCadastradoFim > 0 ? hCadastradoFim : (hIni + hTrab);

    let deslocamento = 0;
    let houveDesloc = false;

    if (ultimoHorimetroFinal !== undefined && ultimoHorimetroFinal > 0 && hIni > ultimoHorimetroFinal) {
      deslocamento = Number((hIni - ultimoHorimetroFinal).toFixed(2));
      houveDesloc = deslocamento > 0;
      somaDeslocamento += deslocamento;
    }

    somaFaturadas += hTrab;
    const item: ServicoComDeslocamento = {
      servico: s,
      horimetroInicial: hIni,
      horimetroFinal: hFim,
      horasFaturadas: hTrab,
      deslocamentoHoras: deslocamento,
      horimetroAnteriorFinal: ultimoHorimetroFinal,
      houveDeslocamento: houveDesloc
    };

    if (hFim > 0) {
      ultimoHorimetroFinal = hFim;
    }

    return item;
  });

  const totalRodadas = Number((somaFaturadas + somaDeslocamento).toFixed(2));
  const eficiencia = totalRodadas > 0 ? Number(((somaFaturadas / totalRodadas) * 100).toFixed(1)) : 100;

  // Inverte para apresentar no modal do mais recente para o mais antigo (padrão de extrato)
  const itens = [...itensCronologicos].reverse();

  return {
    itens,
    totalHorasFaturadas: Number(somaFaturadas.toFixed(2)),
    totalHorasDeslocamento: Number(somaDeslocamento.toFixed(2)),
    totalHorasRodadas: totalRodadas,
    eficienciaFaturamento: eficiencia
  };
}
