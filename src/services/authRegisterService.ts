import { supabase } from '../lib/supabase';
import { obterConfigAsaas } from './asaasApiClient';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';

export interface RegisterEmpresaParams {
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero?: string;
  senha: string;
  planoCodigo: string;
  planoValor: number;
  limiteUsuarios: number;
  billingType?: 'PIX' | 'BOLETO';
}

export interface AsaasOnboardingResult {
  subscriptionId?: string;
  invoiceUrl?: string | null;
  pixQrCode?: string | null;
  pixCopiaCola?: string | null;
  status?: string;
  aviso?: string;
}

export interface RegisterEmpresaResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  asaas?: AsaasOnboardingResult;
}

export async function registerEmpresa(params: RegisterEmpresaParams): Promise<RegisterEmpresaResult> {
  try {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanNome = params.razaoSocial.trim();
    const cleanCnpj = params.cnpj.trim();
    const cleanTel = params.telefone.trim();

    if (!cleanEmail || !cleanNome || !params.senha || !cleanCnpj) {
      return { success: false, error: 'Preencha todos os campos obrigatórios (Razão Social, CPF/CNPJ, E-mail e Senha).' };
    }

    const hoje = new Date();
    const dataInicio = hoje.toISOString().slice(0, 10);
    const dataFimObj = new Date(hoje);
    dataFimObj.setDate(dataFimObj.getDate() + 30);
    const dataFim = dataFimObj.toISOString().slice(0, 10);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: params.senha,
      options: { data: { nome: cleanNome, empresa: cleanNome, role: 'admin', perfil_acesso: 'ADMIN' } }
    });
    if (authError) return { success: false, error: authError.message };

    const userId = authData.user?.id;
    const tenantPayload = {
      nome: cleanNome,
      cnpj: cleanCnpj,
      documento: cleanCnpj,
      admin_email: cleanEmail,
      contato_email: cleanEmail,
      contato_telefone: cleanTel || null,
      endereco: `${params.endereco.trim()}${params.numero ? `, ${params.numero.trim()}` : ''}${params.cep ? ` - CEP ${params.cep.trim()}` : ''}`,
      plano: params.planoCodigo,
      status_conta: 'ativo',
      assinatura_inicio: dataInicio,
      assinatura_fim: dataFim,
      limite_usuarios: params.limiteUsuarios || 5,
      valor_mensalidade: params.planoValor,
      plano_valor: params.planoValor
    };

    let createdTenantId = userId;
    const { data: insTenant, error: tenantError } = await supabase
      .from('tenants').insert([{ ...(userId ? { id: userId } : {}), ...tenantPayload }]).select('id').single();

    if (tenantError) {
      const { data: fbTenant } = await supabase.from('tenants').insert([tenantPayload]).select('id').single();
      if (fbTenant?.id) createdTenantId = fbTenant.id;
    } else if (insTenant?.id) {
      createdTenantId = insTenant.id;
    }

    let session = authData.session;
    if (!session) {
      const { data: signInData } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: params.senha });
      session = signInData?.session || null;
    }

    let asaas: AsaasOnboardingResult | undefined;
    if (params.planoValor > 0 && createdTenantId) {
      try {
        const localAsaas = (await obterConfigAsaas(DEFAULT_LEGACY_TENANT)) || (await obterConfigAsaas());
        const resp = await fetch('/api/saas-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
          },
          body: JSON.stringify({
            action: 'criar_assinatura_recorrente',
            tenantId: createdTenantId,
            plano: params.planoCodigo,
            valor: params.planoValor,
            billingType: params.billingType || 'PIX',
            clientApiKey: localAsaas?.apiKey,
            clientEnvironment: localAsaas?.environment,
            cliente: {
              nome: cleanNome, cpfCnpj: cleanCnpj, email: cleanEmail,
              telefone: cleanTel, cep: params.cep, endereco: params.endereco, numero: params.numero
            }
          })
        });
        const json = await resp.json();
        if (resp.ok && json.success) {
          asaas = {
            subscriptionId: json.subscriptionId,
            invoiceUrl: json.invoiceUrl,
            pixQrCode: json.pixQrCode,
            pixCopiaCola: json.pixCopiaCola,
            status: json.status
          };
        } else {
          asaas = { aviso: json.error || 'Conta criada; conclua a assinatura em Planos e Preços.' };
        }
      } catch {
        asaas = { aviso: 'Conta criada; finalize o pagamento da assinatura no menu Planos e Preços.' };
      }
    }

    return { success: true, requiresEmailConfirmation: !session, asaas };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Falha ao registrar empresa' };
  }
}
