import { chamarApiAsaas, salvarConfigAsaasBanco } from './asaasApiClient';
import type {
  AsaasEnvironment,
  AsaasChargePayload,
  AsaasChargeResult,
  AsaasPixTransferPayload,
  AsaasPixTransferResult
} from '../types/asaas.types';

export async function validarEConectarAsaas(
  apiKey: string,
  environment: AsaasEnvironment,
  chavePix?: string,
  tipoChavePix?: 'CNPJ' | 'CPF' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA',
  tenantId?: string
): Promise<{ ok: boolean; balance?: number; accountName?: string; email?: string; cnpj?: string; error?: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return { ok: false, error: 'Informe a Chave de API (API Key) do Asaas.' };

  const balRes = await chamarApiAsaas<{ balance: number }>('/finance/balance', 'GET', undefined, { apiKey: cleanKey, environment });
  if (!balRes.ok) return { ok: false, error: balRes.error || 'Chave de API inválida ou ambiente incorreto.' };

  let accountName = 'Conta Digital Asaas';
  let email = '';
  let cnpj = '';

  const infoRes = await chamarApiAsaas<any>('/myAccount/commercialInfo', 'GET', undefined, { apiKey: cleanKey, environment });
  if (infoRes.ok && infoRes.data) {
    accountName = infoRes.data.companyName || infoRes.data.tradingName || infoRes.data.name || accountName;
    email = infoRes.data.email || '';
    cnpj = infoRes.data.cpfCnpj || '';
  }

  const saveRes = await salvarConfigAsaasBanco(
    {
      apiKey: cleanKey,
      environment,
      chavePix: chavePix?.trim() || cnpj || '',
      tipoChavePix: tipoChavePix || 'CNPJ',
      accountName,
      accountEmail: email,
      cnpj
    },
    tenantId
  );
  if (!saveRes.ok) return { ok: false, error: saveRes.error };

  return { ok: true, balance: Number(balRes.data?.balance ?? 0), accountName, email, cnpj };
}

export async function consultarSaldoAsaas(): Promise<{ ok: boolean; balance?: number; error?: string }> {
  const res = await chamarApiAsaas<{ balance: number }>('/finance/balance', 'GET');
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, balance: Number(res.data?.balance ?? 0) };
}

async function obterOuCriarClienteAsaas(
  name: string,
  cpfCnpj: string,
  phone?: string,
  email?: string
): Promise<{ ok: boolean; customerId?: string; error?: string }> {
  const docLimpo = cpfCnpj.replace(/\D/g, '');
  if (docLimpo) {
    const busca = await chamarApiAsaas<{ data?: Array<{ id: string }> }>(`/customers?cpfCnpj=${docLimpo}`, 'GET');
    if (busca.ok && busca.data?.data && busca.data.data.length > 0) {
      return { ok: true, customerId: busca.data.data[0].id };
    }
  }

  const criacao = await chamarApiAsaas<{ id: string }>('/customers', 'POST', {
    name: name.trim() || 'Cliente TerraGest',
    cpfCnpj: docLimpo || undefined,
    mobilePhone: phone ? phone.replace(/\D/g, '') : undefined,
    email: email?.trim() || undefined
  });

  if (!criacao.ok || !criacao.data?.id) {
    return { ok: false, error: criacao.error || 'Não foi possível cadastrar o cliente no Asaas.' };
  }
  return { ok: true, customerId: criacao.data.id };
}

export async function emitirCobrancaAsaas(
  input: AsaasChargePayload
): Promise<{ ok: boolean; charge?: AsaasChargeResult; error?: string }> {
  const cli = await obterOuCriarClienteAsaas(input.customerName, input.customerCpfCnpj, input.customerPhone, input.customerEmail);
  if (!cli.ok || !cli.customerId) return { ok: false, error: cli.error };

  const cobRes = await chamarApiAsaas<any>('/payments', 'POST', {
    customer: cli.customerId,
    billingType: input.billingType,
    value: Number(input.value),
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference
  });
  if (!cobRes.ok || !cobRes.data?.id) return { ok: false, error: cobRes.error || 'Falha ao gerar cobrança no Asaas.' };

  const payment = cobRes.data;
  const qrRes = await chamarApiAsaas<{ encodedImage?: string; payload?: string }>(`/payments/${payment.id}/pixQrCode`, 'GET');

  return {
    ok: true,
    charge: {
      id: payment.id,
      status: payment.status,
      value: payment.value,
      netValue: payment.netValue,
      billingType: payment.billingType,
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
      pixQrCodeBase64: qrRes.data?.encodedImage,
      pixCopiaECola: qrRes.data?.payload,
      dueDate: payment.dueDate
    }
  };
}

export async function realizarTransferenciaPixAsaas(
  input: AsaasPixTransferPayload
): Promise<{ ok: boolean; transfer?: AsaasPixTransferResult; error?: string }> {
  const res = await chamarApiAsaas<AsaasPixTransferResult>('/transfers', 'POST', {
    value: Number(input.value),
    operationType: 'PIX',
    pixAddressKey: input.pixAddressKey.trim(),
    pixAddressKeyType: input.pixAddressKeyType || undefined,
    description: input.description || 'Pagamento Fornecedor TerraGest ERP',
    scheduleDate: input.scheduleDate || undefined
  });
  if (!res.ok || !res.data?.id) return { ok: false, error: res.error || 'Não foi possível realizar a transferência PIX no Asaas.' };
  return { ok: true, transfer: res.data };
}
