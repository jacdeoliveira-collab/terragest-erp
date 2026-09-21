export type EquipmentCategory = 'HEAVY_MACHINERY' | 'AGRICULTURAL_DRONE';

export type EquipmentStatus = 'AVAILABLE' | 'IN_OPERATION' | 'MAINTENANCE' | 'INACTIVE';

export type EquipmentType = 
  | 'ESCAVADEIRA'
  | 'TRATOR'
  | 'PA_CARREGADEIRA'
  | 'MOTONIVELADORA'
  | 'GERADOR_TRIFASICO'
  | 'DJI_AGRAS_T30'
  | 'DJI_AGRAS_T40'
  | 'DJI_AGRAS_T50';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  type: EquipmentType;
  model: string;
  serial_number: string;
  chassi?: string;
  renavam?: string;
  ano_fabricacao?: number;
  drive_url_foto?: string;
  current_hourmeter: number;
  battery_cycles?: number;
  anac_prefix?: string;
  status: EquipmentStatus;
  created_at: string;
  updated_at: string;
}

export type CreateEquipmentDTO = Omit<Equipment, 'id' | 'created_at' | 'updated_at'>;
