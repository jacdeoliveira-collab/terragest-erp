export type EquipmentCategory = 'HEAVY_MACHINERY' | 'CAMINHAO' | 'EQUIPAMENTO_APOIO' | 'VEICULO_LEVE';
export type EquipmentStatus = 'AVAILABLE' | 'IN_OPERATION' | 'MAINTENANCE' | 'INACTIVE';
export type TipoPropriedadeEquipamento = 'PROPRIO' | 'LOCADO';

export type EquipmentType = 
  | 'ESCAVADEIRA'
  | 'TRATOR'
  | 'PA_CARREGADEIRA'
  | 'MOTONIVELADORA'
  | 'RETROESCAVADEIRA'
  | 'ROLO_COMPACTADOR'
  | 'CAMINHAO_BASCULANTE'
  | 'CAMINHAO_PIPA'
  | 'CAMINHAO_COMBOIO'
  | 'GERADOR_TRIFASICO'
  | string;

export interface Equipment {
  id: string;
  tenant_id?: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  type: EquipmentType;
  marca?: string;
  model: string;
  serial_number: string;
  current_hourmeter: number;
  status: EquipmentStatus;
  // Patrimônio & Trânsito
  placa?: string;
  chassi?: string;
  renavam?: string;
  ano_fabricacao?: number;
  tipo_propriedade?: TipoPropriedadeEquipamento;
  fornecedor_locacao?: string;
  valor_locacao_mensal?: number;
  valor_aquisicao?: number;
  custo_hora_estimado?: number;
  // Segurança & Compliance NR-12 / NR-18
  laudo_art_validade?: string;
  seguro_apolice?: string;
  seguro_validade?: string;
  tag_rastreador?: string;
  // Especificações Operacionais
  combustivel_padrao?: string;
  capacidade_tanque?: number;
  potencia_hp?: number;
  drive_url_foto?: string;
  created_at: string;
  updated_at: string;
}

export type CreateEquipmentDTO = Omit<Equipment, 'id' | 'created_at' | 'updated_at'>;
