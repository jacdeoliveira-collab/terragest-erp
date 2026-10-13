import type { ServicoHorimetro } from './servicoHorimetro.types';
import type { DailyBulletin } from './bde.types';

export interface MaquinaOperadaResumo {
  maquinaNome: string;
  totalHoras: number;
  totalTrabalhos: number;
}

export interface FuncionarioRemuneracaoItem {
  servicoId: string;
  data: string;
  clienteNome: string;
  maquinaNome: string;
  horasTrabalhadas: number;
  valorHora: number;
  totalGanho: number;
  valorAdiantado: number;
  dataAdiantamento?: string;
  saldoRestante: number;
  status: 'PENDENTE' | 'PARCIAL' | 'PAGO' | string;
  dataPagamento?: string;
}

export interface FuncionarioHistoricoData {
  totalHorasServicos: number;
  totalHorasBde: number;
  totalHorasGeral: number;
  qtdServicos: number;
  qtdBdes: number;
  totalGanhos: number;
  totalPago: number;
  totalSaldoAberto: number;
  qtdQuitados: number;
  maquinasOperadas: MaquinaOperadaResumo[];
  servicos: ServicoHorimetro[];
  bulletins: DailyBulletin[];
  remuneracoes: FuncionarioRemuneracaoItem[];
}
