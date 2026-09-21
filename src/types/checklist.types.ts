export interface ChecklistItem {
  id: string;
  tenant_id?: string;
  maquina_id: string;
  maquina_codigo?: string;
  maquina_nome?: string;
  operador_id?: string;
  operador_nome?: string;
  data: string;
  nivel_oleo_ok: boolean;
  vazamentos_ok: boolean;
  nivel_arrefecimento_ok?: boolean;
  freios_comandos_ok?: boolean;
  pneus_esteiras_ok?: boolean;
  iluminacao_alarme_ok?: boolean;
  status_geral_aprovado: boolean;
  observacoes?: string;
  created_at?: string;
}

export type CreateChecklistDTO = Omit<
  ChecklistItem,
  'id' | 'created_at' | 'maquina_codigo' | 'maquina_nome' | 'operador_nome'
>;
