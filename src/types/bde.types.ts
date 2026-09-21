export type BDEStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

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
  fuel_liters: number;
  service_description: string;
  notes?: string;
  status: BDEStatus;
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
