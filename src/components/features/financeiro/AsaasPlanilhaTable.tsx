import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, HelpCircle } from 'lucide-react';
import { WEBHOOK_URL_ASAAS } from './AsaasWebhookHelperBox';
import { CATALOGO_BANCOS_API, obterMetadataBanco } from '../../../utils/bancosProvidersCatalog';
import type { AsaasConfig, AsaasEnvironment, GatewayProvider } from '../../../types/asaas.types';

interface Props {
  provider: GatewayProvider;
  setProvider: (v: GatewayProvider) => void;
  nomeBancoCustom: string;
  setNomeBancoCustom: (v: string) => void;
  agenciaCustom: string;
  setAgenciaCustom: (v: string) => void;
  contaCustom: string;
  setContaCustom: (v: string) => void;
  apiBaseUrlCustom: string;
  setApiBaseUrlCustom: (v: string) => void;
  environment: AsaasEnvironment;
  setEnvironment: (v: AsaasEnvironment) => void;
  apiKey: string;
  setApiKey: (v: string) => void;
  clientId: string;
  setClientId: (v: string) => void;
  webhookToken: string;
  setWebhookToken: (v: string) => void;
  tipoChavePix: AsaasConfig['tipoChavePix'];
  setTipoChavePix: (v: AsaasConfig['tipoChavePix']) => void;
  chavePix: string;
  setChavePix: (v: string) => void;
  onOpenHelp: () => void;
}

export const AsaasPlanilhaTable: React.FC<Props> = ({
  provider, setProvider, nomeBancoCustom, setNomeBancoCustom, agenciaCustom, setAgenciaCustom, contaCustom, setContaCustom, apiBaseUrlCustom, setApiBaseUrlCustom,
  environment, setEnvironment, apiKey, setApiKey, clientId, setClientId,
  webhookToken, setWebhookToken, tipoChavePix, setTipoChavePix, chavePix, setChavePix, onOpenHelp
}) => {
  const [showKey, setShowKey] = useState(false);
  const [copiadoUrl, setCopiadoUrl] = useState(false);
  const meta = obterMetadataBanco(provider);

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-100 text-[10px] text-slate-600 uppercase border-b border-gray-200">
          <tr>
            <th className="p-2.5 w-1/4">Campo / Parâmetro da Planilha</th>
            <th className="p-2.5 w-2/5">Valor Configurado (Editável)</th>
            <th className="p-2.5">Onde o Sistema Usa / Orientação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          <tr className="bg-blue-50/40">
            <td className="p-2.5 font-bold text-blue-950">1. Selecionar Banco / Gateway *</td>
            <td className="p-2 flex items-center gap-1.5">
              <select value={provider} onChange={(e) => setProvider(e.target.value as GatewayProvider)} className="flex-1 px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg font-bold text-blue-950">
                {CATALOGO_BANCOS_API.map((b) => (<option key={b.id} value={b.id}>{b.nome}</option>))}
              </select>
              <button type="button" onClick={onOpenHelp} title="Ver passo a passo deste banco" className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shrink-0 inline-flex items-center gap-1 text-[10px] font-bold">
                <HelpCircle className="w-3.5 h-3.5" /><span>?</span>
              </button>
            </td>
            <td className="p-2.5 text-[11px] text-blue-900 font-medium">{meta.orientacaoCurta}</td>
          </tr>
          {provider === 'OUTRO_BANCO' && (
            <tr className="bg-amber-50/40">
              <td className="p-2.5 font-bold text-amber-950">1B. Dados do Seu Banco (Qualquer Banco) *</td>
              <td className="p-2 space-y-1.5">
                <input type="text" value={nomeBancoCustom} onChange={(e) => setNomeBancoCustom(e.target.value)} placeholder="Nome do Banco (Ex: Banco do Brasil, Itaú, Bradesco, Nubank...)" className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-bold" />
                <div className="flex gap-1.5">
                  <input type="text" value={agenciaCustom} onChange={(e) => setAgenciaCustom(e.target.value)} placeholder="Agência (Ex: 0001)" className="w-1/3 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono" />
                  <input type="text" value={contaCustom} onChange={(e) => setContaCustom(e.target.value)} placeholder="Conta Corrente (Ex: 12345-6)" className="w-1/3 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono" />
                  <input type="text" value={apiBaseUrlCustom} onChange={(e) => setApiBaseUrlCustom(e.target.value)} placeholder="URL API (Opcional)" className="w-1/3 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono" />
                </div>
              </td>
              <td className="p-2.5 text-[11px] text-amber-900">Cadastra qualquer banco no sistema para sair nos Orçamentos, Medições e Faturas</td>
            </tr>
          )}
          <tr>
            <td className="p-2.5 font-bold text-gray-800">2. Ambiente da Conta</td>
            <td className="p-2">
              <select value={environment} onChange={(e) => setEnvironment(e.target.value as AsaasEnvironment)} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-semibold">
                <option value="production">Produção (Conta Real PF / PJ)</option>
                <option value="sandbox">Sandbox (Homologação / Testes)</option>
              </select>
            </td>
            <td className="p-2.5 text-[11px] text-gray-500">Define se as cobranças e PIX são reais ou de teste</td>
          </tr>
          <tr>
            <td className="p-2.5 font-bold text-gray-800">3. {meta.labelApiKey}</td>
            <td className="p-2 relative">
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={meta.placeholderApiKey} className="w-full pl-2.5 pr-8 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono" />
              <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-4 top-3.5 text-gray-400 cursor-pointer">{showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
            </td>
            <td className="p-2.5 text-[11px] text-gray-500">Autentica emissões de Boleto, QR Code PIX e Saldo</td>
          </tr>
          {meta.exigeClientId && (
            <tr>
              <td className="p-2.5 font-bold text-gray-800">3B. {meta.labelClientId || 'Client ID / Public Key'}</td>
              <td className="p-2"><input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder={meta.placeholderClientId} className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono" /></td>
              <td className="p-2.5 text-[11px] text-gray-500">Identificador da Aplicação no painel do banco ({meta.id})</td>
            </tr>
          )}
          <tr>
            <td className="p-2.5 font-bold text-gray-800">4. Token do Webhook (WOC)</td>
            <td className="p-2"><input type="text" value={webhookToken} onChange={(e) => setWebhookToken(e.target.value)} placeholder="Cole aqui o Token gerado no Webhook do banco..." className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono" /></td>
            <td className="p-2.5 text-[11px] text-gray-500">Valida a baixa automática quando o cliente paga</td>
          </tr>
          <tr>
            <td className="p-2.5 font-bold text-gray-800">5. Chave PIX Oficial (PF ou PJ)</td>
            <td className="p-2 flex gap-1.5">
              <select value={tipoChavePix} onChange={(e) => setTipoChavePix(e.target.value as AsaasConfig['tipoChavePix'])} className="w-28 px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-semibold">
                <option value="CPF">CPF (PF)</option><option value="CNPJ">CNPJ (PJ)</option><option value="TELEFONE">Celular</option><option value="EMAIL">E-mail</option><option value="ALEATORIA">Aleatória</option>
              </select>
              <input type="text" value={chavePix} onChange={(e) => setChavePix(e.target.value)} placeholder="Digite seu CPF, CNPJ, Celular ou Chave..." className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg font-mono" />
            </td>
            <td className="p-2.5 text-[11px] text-gray-500">Sai impressa nos Orçamentos, Medições e Faturas</td>
          </tr>
          <tr className="bg-slate-50/70">
            <td className="p-2.5 font-bold text-gray-800">6. URL do Webhook (Para colar no Banco)</td>
            <td className="p-2 font-mono text-[11px] text-blue-800 select-all">{WEBHOOK_URL_ASAAS}</td>
            <td className="p-2.5">
              <button type="button" onClick={() => { navigator.clipboard.writeText(WEBHOOK_URL_ASAAS); setCopiadoUrl(true); setTimeout(() => setCopiadoUrl(false), 2000); }} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold cursor-pointer">
                {copiadoUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}<span>{copiadoUrl ? 'URL Copiada!' : 'Copiar URL'}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
