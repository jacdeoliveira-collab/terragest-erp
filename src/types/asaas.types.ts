export type AsaasEnvironment = 'production' | 'sandbox';

export type GatewayProvider =
  | 'ASAAS'
  | 'MERCADO_PAGO'
  | 'BANCO_INTER'
  | 'CORA'
  | 'EFI_BANK'
  | 'SICOOB'
  | 'OUTRO_BANCO'
  | 'CAIXA_DINHEIRO';

export interface AsaasConfig {
  provider?: GatewayProvider;
  nomeBancoCustom?: string;
  agenciaCustom?: string;
  contaCustom?: string;
  apiBaseUrlCustom?: string;
  apiKey: string;
  clientId?: string;
  environment: AsaasEnvironment;
  webhookToken?: string;
  chavePix?: string;
  tipoChavePix?: 'CNPJ' | 'CPF' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA';
  walletId?: string;
  accountName?: string;
  accountEmail?: string;
  cnpj?: string;
  connectedAt?: string;
}

export interface AsaasBalance {
  balance: number;
}

export interface AsaasChargePayload {
  customerName: string;
  customerCpfCnpj: string;
  customerPhone?: string;
  customerEmail?: string;
  billingType: 'PIX' | 'BOLETO' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
}

export interface AsaasChargeResult {
  id: string;
  status: string;
  value: number;
  netValue?: number;
  billingType: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeBase64?: string;
  pixCopiaECola?: string;
  dueDate: string;
}

export interface AsaasPixTransferPayload {
  value: number;
  pixAddressKey: string;
  pixAddressKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';
  description?: string;
  scheduleDate?: string;
}

export interface AsaasPixTransferResult {
  id: string;
  value: number;
  status: string;
  transferFee?: number;
  effectiveDate?: string;
  transactionReceiptUrl?: string;
}

export interface AsaasExtratoItem {
  id: string;
  value: number;
  balance?: number;
  type: string;
  date: string;
  description: string;
}

