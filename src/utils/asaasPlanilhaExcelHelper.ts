import * as XLSX from 'xlsx';
import type { AsaasConfig, AsaasEnvironment, GatewayProvider } from '../types/asaas.types';

export interface LinhaPlanilhaAsaas {
  Parametro: string;
  Valor: string;
  Descricao_Orientacao: string;
}

export function exportarPlanilhaCredenciaisAsaas(cfg: Partial<AsaasConfig>): void {
  const provider = cfg.provider || 'ASAAS';
  const linhas: LinhaPlanilhaAsaas[] = [
    {
      Parametro: 'BANCO_PROVEDOR',
      Valor: provider,
      Descricao_Orientacao: 'ASAAS, MERCADO_PAGO, BANCO_INTER, CORA, EFI_BANK, SICOOB ou OUTRO_BANCO'
    },
    {
      Parametro: 'NOME_OUTRO_BANCO',
      Valor: cfg.nomeBancoCustom || '',
      Descricao_Orientacao: 'Se escolheu OUTRO_BANCO, digite o nome (Ex: Banco do Brasil, Itaú, Bradesco, Nubank)'
    },
    {
      Parametro: 'AGENCIA_CONTA',
      Valor: `${cfg.agenciaCustom || ''} / ${cfg.contaCustom || ''}`,
      Descricao_Orientacao: 'Agência e Conta Corrente (Ex: 0001 / 12345-6)'
    },
    {
      Parametro: 'AMBIENTE_API',
      Valor: cfg.environment || 'production',
      Descricao_Orientacao: 'production (Conta Real) ou sandbox (Testes)'
    },
    {
      Parametro: 'CHAVE_API_OU_SECRET',
      Valor: cfg.apiKey || '',
      Descricao_Orientacao: 'Chave de API ($aact_... no Asaas, APP_USR-... no Mercado Pago ou Client Secret)'
    },
    {
      Parametro: 'CLIENT_ID_OU_PUBLIC_KEY',
      Valor: cfg.clientId || '',
      Descricao_Orientacao: 'Client ID (Inter, Cora, Efí) ou Public Key (Mercado Pago)'
    },
    {
      Parametro: 'TOKEN_WEBHOOK',
      Valor: cfg.webhookToken || '',
      Descricao_Orientacao: 'Token de segurança definido na aba Webhooks do Banco (WOC)'
    },
    {
      Parametro: 'TIPO_CHAVE_PIX',
      Valor: cfg.tipoChavePix || 'CPF',
      Descricao_Orientacao: 'CPF, CNPJ, EMAIL, TELEFONE ou ALEATORIA'
    },
    {
      Parametro: 'CHAVE_PIX_OFICIAL',
      Valor: cfg.chavePix || '',
      Descricao_Orientacao: 'Chave PIX Pessoa Física ou Jurídica para Orçamentos e Recebimentos'
    },
    {
      Parametro: 'TITULAR_CONTA',
      Valor: cfg.accountName || '',
      Descricao_Orientacao: 'Nome ou Razão Social do titular da conta bancária'
    },
    {
      Parametro: 'CPF_CNPJ_TITULAR',
      Valor: cfg.cnpj || '',
      Descricao_Orientacao: 'CPF (Pessoa Física) ou CNPJ do titular da conta'
    },
    {
      Parametro: 'URL_WEBHOOK_SISTEMA',
      Valor: 'https://terragest.agrodronesma.com.br/api/asaas-webhook',
      Descricao_Orientacao: 'Cole esta URL no campo URL do Webhook lá no painel do seu banco'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(linhas);
  ws['!cols'] = [{ wch: 28 }, { wch: 55 }, { wch: 65 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planilha_Banco_API');
  XLSX.writeFile(wb, `Planilha_Banco_${provider}_TerraGest.xlsx`);
}

export async function importarPlanilhaCredenciaisAsaas(file: File): Promise<Partial<AsaasConfig>> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[sheetName]);

  const result: Partial<AsaasConfig> = {};
  for (const r of rows) {
    const param = String(r.Parametro || r.parametro || r.Campo || '').trim().toUpperCase();
    const val = String(r.Valor ?? r.valor ?? '').trim();
    if (!param) continue;
    if (param.includes('BANCO_PROVEDOR') || param === 'PROVEDOR') result.provider = (val.toUpperCase() as GatewayProvider) || 'ASAAS';
    if (param.includes('NOME_OUTRO_BANCO')) result.nomeBancoCustom = val;
    if (param.includes('AGENCIA_CONTA') && val.includes('/')) {
      const [ag, cc] = val.split('/');
      result.agenciaCustom = ag?.trim() || '';
      result.contaCustom = cc?.trim() || '';
    }
    if (param.includes('AMBIENTE')) result.environment = (val === 'sandbox' ? 'sandbox' : 'production') as AsaasEnvironment;
    if (param.includes('CHAVE_API') || param.includes('SECRET') || param === 'API_KEY') result.apiKey = val;
    if (param.includes('CLIENT_ID') || param.includes('PUBLIC_KEY')) result.clientId = val;
    if (param.includes('WEBHOOK') && !param.includes('URL')) result.webhookToken = val;
    if (param.includes('TIPO_CHAVE')) result.tipoChavePix = (val.toUpperCase() as any) || 'CPF';
    if (param.includes('CHAVE_PIX') && !param.includes('TIPO')) result.chavePix = val;
    if (param.includes('TITULAR') && !param.includes('CPF')) result.accountName = val;
    if (param.includes('CPF') || param.includes('CNPJ')) result.cnpj = val;
  }
  return result;
}
