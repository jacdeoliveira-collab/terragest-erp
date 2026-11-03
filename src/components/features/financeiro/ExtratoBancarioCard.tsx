import React, { useState, useEffect } from 'react';
import { Landmark, RefreshCw, ArrowDownLeft, ArrowUpRight, Wallet, ReceiptText } from 'lucide-react';
import { chamarApiAsaas, obterConfigAsaas } from '../../../services/asaasApiClient';
import { consultarSaldoAsaas } from '../../../services/asaasFinanceiroService';
import { obterMetadataBanco } from '../../../utils/bancosProvidersCatalog';
import { carregarMovimentosErp, type MovimentoErp } from '../../../services/extratoErpService';
import type { AsaasExtratoItem, AsaasConfig } from '../../../types/asaas.types';

const formatBRL = (v: number) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ExtratoBancarioCard: React.FC = () => {
  const [cfg, setCfg] = useState<AsaasConfig | null>(null);
  const [saldoApi, setSaldoApi] = useState<number | null>(null);
  const [extratoApi, setExtratoApi] = useState<AsaasExtratoItem[]>([]);
  const [extratoSistema, setExtratoSistema] = useState<MovimentoErp[]>([]);
  const [aba, setAba] = useState<'API' | 'SISTEMA'>('API');
  const [loading, setLoading] = useState(false);

  const carregarTudo = async () => {
    setLoading(true);
    const config = await obterConfigAsaas();
    setCfg(config);
    const metaPadrao = obterMetadataBanco(config?.provider);
    const bancoPadrao = config?.provider === 'OUTRO_BANCO' && config?.nomeBancoCustom ? config.nomeBancoCustom : metaPadrao.nome;

    if (config?.apiKey && (!config.provider || config.provider === 'ASAAS')) {
      const [bal, ext] = await Promise.all([
        consultarSaldoAsaas(),
        chamarApiAsaas<{ data?: AsaasExtratoItem[] }>('/financialTransactions?limit=25', 'GET')
      ]);
      if (bal.ok && bal.balance !== undefined) setSaldoApi(bal.balance);
      let itensApi: AsaasExtratoItem[] = [];
      if (ext.ok && Array.isArray(ext.data?.data) && ext.data.data.length > 0) {
        itensApi = ext.data.data;
      } else {
        const pagRes = await chamarApiAsaas<{ data?: any[] }>('/payments?limit=25', 'GET');
        if (pagRes.ok && Array.isArray(pagRes.data?.data)) {
          itensApi = pagRes.data.data.map((p) => ({
            id: p.id,
            date: p.paymentDate || p.clientPaymentDate || p.dueDate || '',
            value: Number(p.value || 0),
            balance: 0,
            description: `${p.description || 'Cobrança / PIX'} [${p.status}]`,
            type: p.billingType || 'PIX'
          }));
        }
      }
      setExtratoApi(itensApi);
      if (itensApi.length === 0) setAba('SISTEMA');
    } else {
      setAba('SISTEMA');
    }

    try { setExtratoSistema(await carregarMovimentosErp(bancoPadrao)); } catch {}
    setLoading(false);
  };

  useEffect(() => { carregarTudo(); }, []);

  const meta = obterMetadataBanco(cfg?.provider);
  const nomeBanco = cfg?.provider === 'OUTRO_BANCO' && cfg?.nomeBancoCustom ? cfg.nomeBancoCustom : meta.nome;
  const totalEntradas = extratoSistema.filter((m) => m.tipo === 'ENTRADA').reduce((a, b) => a + b.valor, 0);
  const totalSaidas = extratoSistema.filter((m) => m.tipo === 'SAIDA').reduce((a, b) => a + b.valor, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4 text-left text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs"><Wallet className="w-5 h-5" /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Saldo em Tempo Real & Extrato de Movimentações</h3>
            <p className="text-[11px] text-gray-500">Banco Integrado: <b>{nomeBanco}</b> {cfg?.accountName ? `• Titular: ${cfg.accountName}` : ''}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saldoApi !== null && (
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
              <span className="text-[9px] uppercase font-bold text-emerald-700 block">Saldo Disponível (API Banco)</span>
              <span className="font-mono font-bold text-base text-emerald-900">{formatBRL(saldoApi)}</span>
            </div>
          )}
          <div className="px-3.5 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-right">
            <span className="text-[9px] uppercase font-bold text-blue-700 block">Saldo Caixa Conciliado</span>
            <span className="font-mono font-bold text-base text-blue-900">{formatBRL(totalEntradas - totalSaidas)}</span>
          </div>
          <button type="button" onClick={carregarTudo} disabled={loading} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer" title="Atualizar Saldo e Extrato">
            <RefreshCw className={`w-4 h-4 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setAba('API')} className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer flex items-center gap-1.5 ${aba === 'API' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          <Landmark className="w-3.5 h-3.5" /><span>Extrato Direto do Banco (API)</span>
        </button>
        <button type="button" onClick={() => setAba('SISTEMA')} className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer flex items-center gap-1.5 ${aba === 'SISTEMA' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
          <ReceiptText className="w-3.5 h-3.5" /><span>Extrato de Recebimentos & Pagamentos (ERP)</span>
        </button>
      </div>

      {aba === 'API' ? (
        extratoApi.length === 0 ? (
          <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl">{loading ? 'Consultando extrato bancário em tempo real...' : 'Nenhuma movimentação retornada pela API do banco neste período (ou confira a aba Extrato ERP ao lado).'}</div>
        ) : (
          <div className="overflow-x-auto max-h-64 border border-gray-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200"><tr><th className="p-2.5">Data</th><th className="p-2.5">Histórico / Descrição no Banco</th><th className="p-2.5 text-right">Valor</th><th className="p-2.5 text-right">Saldo Após</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {extratoApi.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-mono text-gray-600">{item.date}</td><td className="p-2.5 font-medium text-gray-900">{item.description || item.type}</td>
                    <td className={`p-2.5 text-right font-mono font-bold ${item.value >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{formatBRL(item.value)}</td>
                    <td className="p-2.5 text-right font-mono text-gray-600">{item.balance !== undefined ? formatBRL(item.balance) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="overflow-x-auto max-h-64 border border-gray-100 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200"><tr><th className="p-2.5">Data</th><th className="p-2.5">Movimentação Liquidada</th><th className="p-2.5">Banco / Conta</th><th className="p-2.5 text-right">Valor</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {extratoSistema.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-2.5 font-mono text-gray-600">{m.data || '—'}</td>
                  <td className="p-2.5 font-medium text-gray-900 flex items-center gap-1.5">{m.tipo === 'ENTRADA' ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />}<span>{m.desc}</span></td>
                  <td className="p-2.5 text-gray-600">{m.banco}</td>
                  <td className={`p-2.5 text-right font-mono font-bold ${m.tipo === 'ENTRADA' ? 'text-emerald-700' : 'text-rose-600'}`}>{m.tipo === 'ENTRADA' ? '+' : '-'} {formatBRL(m.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
