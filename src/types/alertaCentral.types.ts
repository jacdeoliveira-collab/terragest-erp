export type ModuloAlerta =
  | 'TODOS'
  | 'FINANCEIRO_PAGAR'
  | 'FINANCEIRO_RECEBER'
  | 'MANUTENCAO'
  | 'RH'
  | 'CHECKLIST';

export type NivelAlertaCentral = 'CRITICO' | 'ALERTA' | 'INFO';

export interface AlertaItem {
  id: string;
  modulo: ModuloAlerta;
  titulo: string;
  descricao: string;
  nivel: NivelAlertaCentral;
  dataReferencia?: string;
  rota: string;
  valorFormatado?: string;
  tagModulo: string;
}
