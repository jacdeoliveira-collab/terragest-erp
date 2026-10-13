export type BDEStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export type StatusAprovacaoBDE = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export type MotivoOciosidade =
  | 'Chuva'
  | 'Manutenção Corretiva'
  | 'Aguardando Frente de Serviço'
  | 'Falta de Combustível'
  | 'Outros';

export interface DailyBulletin {
  id: string;
  tenant_id?: string;
  obra_id: string;
  obra_nome?: string;
  equipment_id: string;
  equipment_code?: string;
  equipment_name?: string;
  operador_id?: string;
  operador_nome?: string;
  date: string;
  hora_inicio_jornada?: string;
  hora_fim_jornada?: string;
  motivo_parada?: MotivoOciosidade | string;
  operator_name: string;
  client_name: string;
  work_location: string;
  initial_hourmeter: number;
  final_hourmeter: number;
  total_hours: number;
  horas_produtivas?: number;
  horas_ociosas?: number;
  estaca_inicial?: string;
  estaca_final?: string;
  status_aprovacao?: StatusAprovacaoBDE | string;
  fuel_liters: number;
  service_description: string;
  notes?: string;
  status: BDEStatus;
  assinado_por_pin?: boolean;
  medicao_id?: string;
  created_at: string;
  updated_at: string;
}

export type CreateBDEDTO = Omit<
  DailyBulletin,
  'id' | 'created_at' | 'updated_at' | 'equipment_code' | 'equipment_name' | 'operador_nome' | 'obra_id' | 'total_hours'
> & {
  obra_id: string;
  total_hours?: number;
};
