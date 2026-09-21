import type { Funcionario } from '../../../types/rh.types';
import type { DailyBulletin } from '../../../types/bde.types';

export interface ItemFolhaFechamento {
  funcionarioId: string;
  nome: string;
  cargo: string;
  salarioBase: number;
  totalHorasTrabalhadas: number;
  totalHorasExtras: number;
  valorHoraExtra: number;
  adicionalHorasExtras: number;
  custoTotal: number;
  estourouLimite: boolean;
  diasApontados: number;
}

export function parseHorasJornada(inicio?: string, fim?: string): number {
  if (!inicio || !fim) return 0;
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fim.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  const mins = h2 * 60 + m2 - (h1 * 60 + m1);
  return Math.max(0, Number((mins / 60).toFixed(2)));
}

export function calcularItemFolha(
  funcionario: Funcionario,
  bulletinsDoMes: DailyBulletin[]
): ItemFolhaFechamento {
  const limiteDiario = Number(funcionario.limite_horas_diario) || 8;
  const salarioBase = Number(funcionario.salario_base) || 0;
  const valorHoraExtra =
    Number(funcionario.valor_hora_extra) ||
    (Number(funcionario.custo_hora_normal) || (salarioBase > 0 ? salarioBase / 220 : 25)) * 1.5;

  let totalHorasTrabalhadas = 0;
  let totalHorasExtras = 0;
  let diasApontados = 0;

  bulletinsDoMes.forEach((b) => {
    // Prioridade 1: total_hours consolidado no banco
    let horasDia = Number(b.total_hours);

    // Prioridade 2: jornada do BDE (hora_inicio_jornada e hora_fim_jornada)
    if (isNaN(horasDia) || horasDia <= 0) {
      horasDia = parseHorasJornada(b.hora_inicio_jornada, b.hora_fim_jornada);
    }

    if (horasDia > 0) {
      diasApontados += 1;
      totalHorasTrabalhadas += horasDia;
      // Horas extras: o que ultrapassar o limite_horas_diario no dia
      if (horasDia > limiteDiario) {
        totalHorasExtras += horasDia - limiteDiario;
      }
    }
  });

  totalHorasTrabalhadas = Number(totalHorasTrabalhadas.toFixed(1));
  totalHorasExtras = Number(totalHorasExtras.toFixed(1));
  const adicionalHorasExtras = Number((totalHorasExtras * valorHoraExtra).toFixed(2));
  const custoTotal = Number((salarioBase + adicionalHorasExtras).toFixed(2));

  return {
    funcionarioId: funcionario.id,
    nome: funcionario.nome,
    cargo: funcionario.cargo.replace(/_/g, ' '),
    salarioBase,
    totalHorasTrabalhadas,
    totalHorasExtras,
    valorHoraExtra,
    adicionalHorasExtras,
    custoTotal,
    estourouLimite: totalHorasExtras > 0,
    diasApontados
  };
}
