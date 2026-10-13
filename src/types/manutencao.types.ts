export type StatusManutencao = 'PENDENTE' | 'REALIZADO' | 'EM_DIA' | 'PROXIMO_VENCIMENTO' | 'ATRASADO';
export type TipoManutencao = 'PREVENTIVA' | 'CORRETIVA';

export interface CategoriaCusto {
  id: string;
  tenant_id?: string;
  nome: string;
  modulo: string;
  tipo?: 'DESPESA' | 'RECEITA';
  descricao?: string;
}

export interface PlanoManutencaoItem {
  id: string;
  tenant_id?: string;
  maquina_id: string;
  maquina_codigo?: string;
  maquina_nome?: string;
  horimetro_atual_maquina?: number;
  unidade_medicao?: 'h' | 'km';
  tipo_servico?: string;
  tipo_servico_nome: string;
  intervalo_horas: number;
  ultimo_horimetro_realizado: number;
  proximo_horimetro_alvo?: number;
  horimetro_proxima_troca?: number;
  data_ultima_execucao?: string;
  responsavel_mecanico?: string;
  mecanico_id?: string;
  status: StatusManutencao;
  // Campos Enterprise de Apropriação Financeira e OS
  obra_id?: string;
  obra_nome?: string;
  categoria_custo_id?: string;
  categoria_custo_nome?: string;
  tipo_manutencao?: TipoManutencao;
  data_servico?: string;
  descricao_servico?: string;
  valor_pecas?: number;
  valor_mao_obra?: number;
  valor_total?: number;
  created_at?: string;
  updated_at?: string;
}

export type Manutencao = PlanoManutencaoItem;

export type CreatePlanoManutencaoDTO = Omit<
  PlanoManutencaoItem,
  'id' | 'created_at' | 'updated_at' | 'maquina_codigo' | 'maquina_nome' | 'horimetro_atual_maquina' | 'proximo_horimetro_alvo' | 'obra_nome' | 'categoria_custo_nome' | 'valor_total'
>;

export type CreateManutencaoDTO = CreatePlanoManutencaoDTO;
export type UpdatePlanoManutencaoDTO = Partial<CreatePlanoManutencaoDTO>;
export type UpdateManutencaoDTO = UpdatePlanoManutencaoDTO;
