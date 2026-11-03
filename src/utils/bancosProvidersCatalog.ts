import type { GatewayProvider } from '../types/asaas.types';

export interface BancoProviderMetadata {
  id: GatewayProvider; nome: string; subtitulo: string; corBadge: string;
  labelApiKey: string; placeholderApiKey: string; exigeClientId: boolean;
  labelClientId?: string; placeholderClientId?: string; urlPortalDev: string;
  suportaApiDiretaSemCertificado: boolean; orientacaoCurta: string;
  passosTutorial: string[]; dicaWebhook: string;
}

export const CATALOGO_BANCOS_API: BancoProviderMetadata[] = [
  {
    id: 'ASAAS', nome: 'Banco Digital Asaas (PF / PJ)',
    subtitulo: 'Boleto + PIX QR Code, Transferência PIX e Webhook Automático',
    corBadge: 'bg-blue-600 text-white', labelApiKey: 'Chave de API Asaas (API Key) *',
    placeholderApiKey: 'Cole aqui a chave $aact_...', exigeClientId: false,
    urlPortalDev: 'https://www.asaas.com', suportaApiDiretaSemCertificado: true,
    orientacaoCurta: 'No painel Asaas: Configurações da Conta -> Integrações -> Gerar Chave de API ($aact_...).',
    passosTutorial: [
      '1. Entre na sua conta em asaas.com (Pessoa Física ou Jurídica).',
      '2. No menu do topo direito, clique em Configurações da Conta -> aba Integrações.',
      '3. Em Chaves de API, clique em "Gerar nova chave de API", copie o código iniciado por $aact_... e cole na linha 3 da planilha.',
      '4. Na aba Webhooks do Asaas, clique em Adicionar Webhook, cole a URL da linha 6, escolha API v3, envio Sequencial, clique em "Gerar Token" e cole esse Token na linha 4.',
      '5. Marque os eventos de Cobranças (PAYMENT_RECEIVED e PAYMENT_CONFIRMED) e salve.'
    ],
    dicaWebhook: 'Versão da API: v3 | Tipo de envio: Sequencial | Eventos: PAYMENT_RECEIVED e PAYMENT_CONFIRMED.'
  },
  {
    id: 'MERCADO_PAGO', nome: 'Mercado Pago / Mercado Livre (PF / PJ)',
    subtitulo: 'PIX Instantâneo, Boleto Registrado e Checkout Transparente',
    corBadge: 'bg-sky-500 text-white', labelApiKey: 'Access Token (Credencial de Produção/Teste) *',
    placeholderApiKey: 'Cole aqui o Access Token APP_USR-...', exigeClientId: true,
    labelClientId: 'Public Key (Chave Pública - Opcional)', placeholderClientId: 'APP_USR-...',
    urlPortalDev: 'https://www.mercadopago.com.br/developers/panel', suportaApiDiretaSemCertificado: true,
    orientacaoCurta: 'No painel Mercado Pago Developers: Suas Integrações -> Credenciais de Produção -> Copie o Access Token (APP_USR-...).',
    passosTutorial: [
      '1. Acesse mercadopago.com.br/developers/panel com sua conta do Mercado Pago / Mercado Livre.',
      '2. Clique em "Suas integrações" -> "Criar aplicação" (ex: TerraGest ERP) e marque "Pagamentos online / Checkout Transparente".',
      '3. No menu lateral da aplicação, clique em "Credenciais de Produção" (ou Teste).',
      '4. Copie o "Access Token" (APP_USR-...) e cole na linha 3 da planilha. Copie a "Public Key" e cole na linha 3B.',
      '5. No menu "Webhooks" do Mercado Pago, cole a URL da linha 6 da planilha e marque o tópico "Pagamentos (payment)".'
    ],
    dicaWebhook: 'Em Webhooks -> Configurar notificações -> Modo Produção -> Eventos: Pagamentos (payment).'
  },
  {
    id: 'BANCO_INTER', nome: 'Banco Inter Empresas (API Cobrança / Bolix)',
    subtitulo: 'Boleto com PIX Nativo e Conciliação Bancária PJ',
    corBadge: 'bg-orange-500 text-white', labelApiKey: 'Client Secret (Chave Secreta Inter) *',
    placeholderApiKey: 'Cole aqui o Client Secret da aplicação Inter...', exigeClientId: true,
    labelClientId: 'Client ID (ID da Aplicação Inter) *', placeholderClientId: 'Cole aqui o Client ID do Inter...',
    urlPortalDev: 'https://developers.inter.co', suportaApiDiretaSemCertificado: false,
    orientacaoCurta: 'No Internet Banking PJ Inter: Soluções para sua empresa -> Nova Integração -> Copie Client ID e Client Secret.',
    passosTutorial: [
      '1. Acesse o Internet Banking PJ do Banco Inter pelo computador.',
      '2. No menu lateral, vá em "Soluções para sua empresa" -> "Integrações" -> "Nova Integração".',
      '3. Dê o nome "TerraGest ERP" e marque as permissões de Boletos/Cobrança com PIX e Consulta de Extrato/PIX.',
      '4. Após confirmar no aplicativo celular (iSafe), o Inter mostrará o "Client ID" (cole na linha 3B) e o "Client Secret" (cole na linha 3).',
      '5. Informe também sua Chave PIX Inter na linha 5 para sair nos Orçamentos, Medições e Faturas.'
    ],
    dicaWebhook: 'Cadastre a URL da linha 6 no callback de Webhook de Cobrança/PIX dentro do portal Inter Developers.'
  },
  {
    id: 'CORA', nome: 'Banco Cora PJ (API Faturas & PIX)',
    subtitulo: 'Emissão de Boletos QR Code PIX e Gestão de Cobranças',
    corBadge: 'bg-pink-600 text-white', labelApiKey: 'Token / Chave de Integração Cora *',
    placeholderApiKey: 'Cole aqui a chave ou certificado Cora...', exigeClientId: true,
    labelClientId: 'Client ID Cora *', placeholderClientId: 'Cole aqui o Client ID Cora...',
    urlPortalDev: 'https://developers.cora.com.br', suportaApiDiretaSemCertificado: false,
    orientacaoCurta: 'No app/web Cora: Conta -> Integrações -> APIs -> Credenciais de Integração Direta.',
    passosTutorial: [
      '1. Entre na sua conta Cora PJ pelo navegador (web.cora.com.br) ou aplicativo.',
      '2. Acesse a aba "Conta" -> "Integrações" -> "Integração Direta (API)".',
      '3. Copie o "Client ID" gerado pela Cora e cole na linha 3B da planilha.',
      '4. Copie a Chave/Token de integração e cole na linha 3 da planilha, além da sua Chave PIX na linha 5.'
    ],
    dicaWebhook: 'Configure um endpoint de notificações na Cora apontando para a URL da linha 6 (eventos invoice.paid).'
  },
  {
    id: 'EFI_BANK', nome: 'Efí Bank / Gerencianet (API PIX & Bolix)',
    subtitulo: 'API PIX Bacen e Boletos Conjugados',
    corBadge: 'bg-amber-600 text-white', labelApiKey: 'Client Secret Efí *',
    placeholderApiKey: 'Client_Secret_...', exigeClientId: true,
    labelClientId: 'Client ID Efí *', placeholderClientId: 'Client_Id_...',
    urlPortalDev: 'https://sejaefi.com.br', suportaApiDiretaSemCertificado: false,
    orientacaoCurta: 'No painel Efí: API -> Minhas Aplicações -> Copie o Client ID e Client Secret.',
    passosTutorial: [
      '1. Acesse sua conta Efí (antiga Gerencianet) e clique no menu "API" no topo.',
      '2. Clique em "Minhas Aplicações" -> "Nova Aplicação" e ative a API Pix e API Cobranças (Bolix).',
      '3. Copie o "Client_Id" (cole na linha 3B) e o "Client_Secret" (cole na linha 3) de Produção.',
      '4. Preencha sua Chave PIX cadastrada na Efí na linha 5.'
    ],
    dicaWebhook: 'Vincule a URL da linha 6 ao Webhook da sua chave PIX no painel de API da Efí.'
  },
  {
    id: 'SICOOB', nome: 'Sicoob / Sicredi / Outros (PIX & Boleto)',
    subtitulo: 'Cooperativas e Bancos Tradicionais (BB, Itaú, Bradesco, Santander)',
    corBadge: 'bg-emerald-700 text-white', labelApiKey: 'Chave de API / Client Secret (Opcional se usar só PIX)',
    placeholderApiKey: 'Token ou Secret da conta...', exigeClientId: true,
    labelClientId: 'Client ID / Cooperativa / Conta', placeholderClientId: 'ID ou Número da Conta...',
    urlPortalDev: 'https://developers.sicoob.com.br', suportaApiDiretaSemCertificado: false,
    orientacaoCurta: 'Cadastre sua Chave PIX oficial e dados da conta para sair nos Orçamentos, Medições e Faturas.',
    passosTutorial: [
      '1. Se você utiliza Sicoob ou Sicredi, acesse o Portal Developers da sua cooperativa.',
      '2. Crie uma aplicação de API Cobrança/PIX e copie o Client ID (linha 3B) e o Client Secret/Token (linha 3).',
      '3. Preencha sua Chave PIX Oficial na linha 5 para sair nos Orçamentos, Medições e Faturas.'
    ],
    dicaWebhook: 'Configure o Webhook de liquidação PIX/Boleto apontando para a URL da linha 6.'
  },
  {
    id: 'CAIXA_DINHEIRO', nome: 'Caixa Físico / Dinheiro em Mãos (Recebimentos e Pagamentos em Espécie)',
    subtitulo: 'Controle de dinheiro vivo recebido de clientes e pago em peças, combustível e diárias',
    corBadge: 'bg-amber-600 text-white', labelApiKey: 'Observação do Caixa (Opcional)',
    placeholderApiKey: 'Ex: Cofre Escritório / Dinheiro em Mãos', exigeClientId: false,
    urlPortalDev: 'https://www.bcb.gov.br', suportaApiDiretaSemCertificado: false,
    orientacaoCurta: 'O sistema já mantém automaticamente a conta "Caixa Físico (Dinheiro em Mãos)" ativa em todos os módulos.',
    passosTutorial: [
      '1. O "Caixa Físico (Dinheiro em Mãos)" já vem criado automaticamente no sistema junto com o seu banco principal.',
      '2. Quando você selecionar Forma de Pagamento "Dinheiro em Mãos (Espécie)" em qualquer tela (Manutenção, Combustível, Recebimento, Haver ou Despesa), o sistema muda sozinho para a conta Caixa Físico!',
      '3. Da mesma forma, se você escolher a conta "Caixa Físico (Dinheiro em Mãos)", a forma de pagamento muda automaticamente para Dinheiro em Mãos.'
    ],
    dicaWebhook: 'Movimentações em dinheiro vivo são conciliadas diretamente no Extrato de Recebimentos & Pagamentos (ERP).'
  },
  {
    id: 'OUTRO_BANCO', nome: 'Outro Banco (Personalizado - BB, Itaú, Bradesco, Santander, Nubank, Caixa)',
    subtitulo: 'Configure qualquer outro banco preenchendo Nome do Banco, Agência, Conta, Chave PIX e API opcional',
    corBadge: 'bg-slate-800 text-white', labelApiKey: 'Chave de API / Token / Client Secret (Opcional)',
    placeholderApiKey: 'Deixe em branco se usar só PIX/Dados Bancários ou cole o Token da API...', exigeClientId: true,
    labelClientId: 'Client ID / Código de Convênio (Opcional)', placeholderClientId: 'Código da aplicação ou convênio...',
    urlPortalDev: 'https://www.bcb.gov.br/estabilidadefinanceira/pix', suportaApiDiretaSemCertificado: false,
    orientacaoCurta: 'Preencha o Nome do seu Banco, Agência, Conta e Chave PIX para sair nos Orçamentos, Faturas e Contas.',
    passosTutorial: [
      '1. Escolha esta opção se a sua empresa trabalha com Banco do Brasil, Itaú, Bradesco, Santander, Caixa, Nubank, PagBank, Stone ou qualquer outro banco.',
      '2. Preencha na linha 1B o Nome do Banco (ex: Banco Itaú Unibanco, Banco do Brasil, Nubank PJ), a Agência e o Número da Conta Corrente.',
      '3. Preencha na linha 5 o Tipo e a sua Chave PIX Oficial (CPF, CNPJ, Celular, E-mail ou Aleatória).',
      '4. Caso o seu banco forneça API REST de cobrança, preencha o Token na linha 3, o Client ID na linha 3B e a URL Base da API.',
      '5. Clique em "Salvar Planilha Bancária no Supabase": o sistema já cadastrará seu banco como Conta Padrão para todos os Orçamentos, Medições e Faturas!'
    ],
    dicaWebhook: 'Se o seu banco possuir Webhook de retorno automático, cole a URL da linha 6 no painel do banco.'
  }
];

export function obterMetadataBanco(provider?: GatewayProvider): BancoProviderMetadata {
  return CATALOGO_BANCOS_API.find((b) => b.id === provider) || CATALOGO_BANCOS_API[0];
}
