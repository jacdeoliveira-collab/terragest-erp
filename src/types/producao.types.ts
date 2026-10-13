export type TipoMaterialProducao =
  | 'SOLO_COMUM'
  | 'ROCHA'
  | 'BOTA_FORA'
  | 'ATERRO'
  | 'SAIBRO'
  | 'AREIA'
  | 'BRITA';

export interface ApontamentoViagemItem {
  id: string;
  tenant_id?: string;
  obra_id: string;
  obra_nome?: string;
  data_hora: string;
  caminhao_id: string;
  caminhao_codigo?: string;
  caminhao_nome?: string;
  caminhao_placa?: string;
  escavadeira_id: string;
  escavadeira_codigo?: string;
  escavadeira_nome?: string;
  operador_caminhao_id?: string;
  operador_caminhao_nome?: string;
  apontador_id?: string;
  apontador_nome?: string;
  material_tipo: TipoMaterialProducao;
  volume_m3: number;
  origem_estaca?: string;
  destino_estaca?: string;
  dmt_km?: number;
  numero_ticket: string;
  observacoes?: string;
  created_at?: string;
}

export type TicketViagem = ApontamentoViagemItem;

export type CreateTicketDTO = {
  obra_id?: string;
  data_hora?: string;
  caminhao_id: string;
  escavadeira_id: string;
  operador_caminhao_id?: string;
  apontador_id?: string;
  material_tipo: TipoMaterialProducao;
  volume_m3: number;
  origem_estaca?: string;
  destino_estaca?: string;
  dmt_km?: number;
  numero_ticket?: string;
  observacoes?: string;
};
