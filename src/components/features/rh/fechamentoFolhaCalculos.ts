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
  const custoHora = Number(funcionario.custo_hora_normal) || (salarioBase > 0 ? Number((salarioBase / 220).toFixed(2)) : 0);

  // Colaborador só recebe hora extra se houver valor configurado explicitamente maior que zero
  const recebeHoraExtra = Number(funcionario.valor_hora_extra) > 0;
  const valorHoraExtra = recebeHoraExtra ? Number(funcionario.valor_hora_extra) : 0;

  let totalHorasTrabalhadas = 0;
  let totalHorasExtras = 0;
  let diasApontados = 0;

  bulletinsDoMes.forEach((b) => {
    let horasDia = Number(b.total_hours);
    if (isNaN(horasDia) || horasDia <= 0) {
      horasDia = parseHorasJornada(b.hora_inicio_jornada, b.hora_fim_jornada);
    }

    if (horasDia > 0) {
      diasApontados += 1;
      totalHorasTrabalhadas += horasDia;
      if (recebeHoraExtra && horasDia > limiteDiario) {
        totalHorasExtras += horasDia - limiteDiario;
      }
    }
  });

  totalHorasTrabalhadas = Number(totalHorasTrabalhadas.toFixed(1));
  totalHorasExtras = recebeHoraExtra ? Number(totalHorasExtras.toFixed(1)) : 0;
  const adicionalHorasExtras = recebeHoraExtra ? Number((totalHorasExtras * valorHoraExtra).toFixed(2)) : 0;

  // Para horista (salario_base zerado), o ganho é pelas horas trabalhadas
  const custoTotal = salarioBase > 0
    ? Number((salarioBase + adicionalHorasExtras).toFixed(2))
    : Number((totalHorasTrabalhadas * custoHora + adicionalHorasExtras).toFixed(2));

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
    estourouLimite: recebeHoraExtra && totalHorasExtras > 0,
    diasApontados
  };
}
