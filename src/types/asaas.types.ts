export type AsaasEnvironment = 'production' | 'sandbox';

export interface AsaasConfig {
  apiKey: string;
  environment: AsaasEnvironment;
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

