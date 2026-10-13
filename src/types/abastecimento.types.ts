export type TipoCombustivel = 'DIESEL_S10' | 'DIESEL_S500' | 'GASOLINA' | 'ETANOL';
export type OrigemAbastecimento = 'POSTO' | 'TANQUE_FIXO' | 'COMBOIO';

export interface AbastecimentoItem {
  id: string;
  tenant_id?: string;
  obra_id: string;
  maquina_id: string;
  maquina_codigo?: string;
  maquina_nome?: string;
  comboio_id?: string;
  comboio_codigo?: string;
  comboio_nome?: string;
  operador_id?: string;
  operador_nome?: string;
  data: string;
  origem?: OrigemAbastecimento;
  tipo_combustivel: TipoCombustivel;
  quantidade_litros: number;
  qtd_oleo_litros?: number;
  qtd_graxa_kg?: number;
  horimetro_momento: number;
  valor_unitario?: number;
  valor_total: number;
  posto_fornecedor?: string;
  numero_requisicao_nf?: string;
  foto_comprovante?: string;
  assinado_por_pin?: boolean;
  servico_id?: string;
  cliente_id?: string;
  cliente_nome?: string;
  created_at?: string;
}

export type CreateAbastecimentoDTO = Omit<
  AbastecimentoItem,
  'id' | 'created_at' | 'maquina_codigo' | 'maquina_nome' | 'operador_nome'
> & {
  operador_id?: string;
  servico_id?: string;
};
