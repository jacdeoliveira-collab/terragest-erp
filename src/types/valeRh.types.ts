export interface ValeColaboradorItem {
  id: string;
  tenant_id?: string;
  colaboradorId?: string;
  colaboradorNome: string;
  cargo?: string;
  valor: number;
  data: string;
  formaPagamento: string;
  contaBancariaId?: string;
  contaBancariaNome?: string;
  observacao?: string;
  comprovanteUrl?: string;
  status: 'PAGO' | 'PENDENTE';
  created_at?: string;
}

export interface LancarValePayload {
  colaboradorId?: string;
  colaboradorNome: string;
  valor: number;
  data: string;
  formaPagamento: string;
  contaBancariaId?: string | null;
  observacao?: string;
  comprovanteUrl?: string;
  tenantId?: string | null;
  obraId?: string | null;
}
