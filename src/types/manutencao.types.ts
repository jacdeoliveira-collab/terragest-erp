export type StatusManutencao = 'EM_DIA' | 'PROXIMO_VENCIMENTO' | 'ATRASADO';

export interface PlanoManutencaoItem {
  id: string;
  tenant_id?: string;
  maquina_id: string;
  maquina_codigo?: string;
  maquina_nome?: string;
  horimetro_atual_maquina?: number;
  tipo_servico_nome: string;
  intervalo_horas: number;
  ultimo_horimetro_realizado: number;
  proximo_horimetro_alvo?: number;
  data_ultima_execucao?: string;
  responsavel_mecanico?: string;
  status: StatusManutencao;
  created_at?: string;
  updated_at?: string;
}

export type CreatePlanoManutencaoDTO = Omit<
  PlanoManutencaoItem,
  'id' | 'created_at' | 'updated_at' | 'maquina_codigo' | 'maquina_nome' | 'horimetro_atual_maquina' | 'proximo_horimetro_alvo'
>;
