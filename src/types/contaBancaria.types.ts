export type TipoContaBancaria = 'CORRENTE' | 'POUPANCA' | 'CAIXA_FISICO';

export type TipoChavePix = 'CNPJ' | 'CPF' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA';

export type FormaPagamentoGeral =
  | 'PIX'
  | 'BOLETO'
  | 'TRANSFERENCIA'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'DINHEIRO'
  | 'CHEQUE'
  | 'OUTRO';

export type CondicaoPagamentoGeral =
  | 'A_VISTA'
  | '7_DIAS'
  | '15_DIAS'
  | '28_DIAS'
  | '30_DIAS'
  | '60_DIAS'
  | 'SINAL_50_50'
  | 'PARCELADO_2X'
  | 'PARCELADO_3X'
  | 'PERSONALIZADO';

export interface ContaBancaria {
  id: string;
  tenant_id?: string;
  nome_conta: string;
  banco: string;
  tipo_conta: TipoContaBancaria;
  agencia?: string;
  numero_conta?: string;
  titular?: string;
  documento_titular?: string;
  tipo_chave_pix?: TipoChavePix;
  chave_pix?: string;
  saldo_inicial?: number;
  is_padrao: boolean;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CreateContaBancariaDTO = Omit<ContaBancaria, 'id' | 'created_at' | 'updated_at'>;
export type UpdateContaBancariaDTO = Partial<CreateContaBancariaDTO>;
