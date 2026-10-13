export type TipoMovimentacaoAlmoxarifado = 'ENTRADA' | 'SAIDA';

export type UnidadeMedidaMaterial = 'TON' | 'M3' | 'SACO' | 'LITRO' | 'KG' | 'UN';

export interface MovimentacaoAlmoxarifadoItem {
  id: string;
  tenant_id?: string;
  obra_id: string;
  obra_nome?: string;
  equipamento_id?: string;
  tipo_movimentacao: TipoMovimentacaoAlmoxarifado;
  data: string;
  fornecedor_nome?: string;
  numero_nf?: string;
  material_nome: string;
  unidade_medida: UnidadeMedidaMaterial;
  quantidade: number;
  valor_total?: number;
  ticket_balanca_numero?: string;
  peso_bruto_kg?: number;
  tara_kg?: number;
  peso_liquido_kg?: number;
  observacoes?: string;
  created_at?: string;
}

export type CreateMovimentacaoDTO = {
  obra_id?: string;
  equipamento_id?: string;
  tipo_movimentacao: TipoMovimentacaoAlmoxarifado;
  data: string;
  fornecedor_nome?: string;
  numero_nf?: string;
  material_nome: string;
  unidade_medida: UnidadeMedidaMaterial;
  quantidade: number;
  valor_total?: number;
  ticket_balanca_numero?: string;
  peso_bruto_kg?: number;
  tara_kg?: number;
  peso_liquido_kg?: number;
  observacoes?: string;
  gerarContaPagar?: boolean;
};
