export type TipoCombustivel = 'DIESEL_S10' | 'DIESEL_S500' | 'GASOLINA' | 'ETANOL';

export interface AbastecimentoItem {
  id: string;
  tenant_id?: string;
  obra_id: string;
  maquina_id: string;
  maquina_codigo?: string;
  maquina_nome?: string;
  operador_id?: string;
  operador_nome?: string;
  data: string;
  tipo_combustivel: TipoCombustivel;
  quantidade_litros: number;
  horimetro_momento: number;
  valor_unitario?: number;
  valor_total: number;
  posto_fornecedor?: string;
  numero_requisicao_nf?: string;
  created_at?: string;
}

export type CreateAbastecimentoDTO = Omit<
  AbastecimentoItem,
  'id' | 'created_at' | 'maquina_codigo' | 'maquina_nome' | 'operador_nome'
> & {
  operador_id?: string;
};
