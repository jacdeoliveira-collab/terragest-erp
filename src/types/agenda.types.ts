export interface ParametrosOperacionaisEmpresa {
  horas_dia_min?: number;
  horas_dia_max?: number;
  horas_dia_padrao?: number;
  trabalha_sabado?: boolean;
  horas_sabado?: number;
  trabalha_domingo?: boolean;
  alerta_dias_antes?: number;
  whatsapp_template?: string;
}

export type StatusAgendaOperacional =
  | 'EM_ANDAMENTO'
  | 'CONFIRMADO'
  | 'AGUARDANDO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export interface AgendaOperacionalItem {
  id: string;
  tenant_id: string;
  maquina_id?: string | null;
  maquina_nome?: string | null;
  cliente_id?: string | null;
  cliente_nome: string;
  cliente_telefone?: string | null;
  endereco_servico?: string | null;
  distancia_km?: number;
  precisa_prancha?: boolean;
  horas_estimadas: number;
  ordem_fila: number;
  status: StatusAgendaOperacional;
  data_inicio_prevista?: string | null;
  data_fim_prevista?: string | null;
  observacoes?: string | null;
  ultimo_contato_whatsapp?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateAgendaDTO = Omit<AgendaOperacionalItem, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>;

