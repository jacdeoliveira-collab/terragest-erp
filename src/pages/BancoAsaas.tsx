import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, KeyRound, ExternalLink, ArrowRight, CheckCircle2, QrCode, FileText, Zap, RefreshCw } from 'lucide-react';
import { AsaasIntegrationCard } from '../components/features/financeiro/AsaasIntegrationCard';
import { chamarApiAsaas, obterConfigAsaas } from '../services/asaasApiClient';
import { useTenantContext } from '../contexts/TenantContext';
import { useIntegrations } from '../hooks/useIntegrations';

interface AsaasPaymentRow {
  id: string;
  dateCreated: string;
  dueDate: string;
  value: number;
  billingType: string;
  status: string;
  description?: string;
  invoiceUrl?: string;
}

export const BancoAsaas: React.FC = () => {
  const navigate = useNavigate();
  const { tenantAtivoId } = useTenantContext();
  const { desconectar } = useIntegrations(tenantAtivoId || undefined);
  const [cobrancas, setCobrancas] = useState<AsaasPaymentRow[]>([]);
  const [loadingCob, setLoadingCob] = useState(false);
  const [conectado, setConectado] = useState(false);

  const carregarCobrancasAsaas = async () => {
    const cfg = await obterConfigAsaas(tenantAtivoId || undefined);
    const hasKey = Boolean(cfg?.apiKey);
    setConectado(hasKey);
    if (!hasKey) {
      setCobrancas([]);
      return;
    }
    setLoadingCob(true);
    const res = await chamarApiAsaas<{ data?: AsaasPaymentRow[] }>('/payments?limit=10', 'GET');
    setLoadingCob(false);
    if (res.ok && res.data?.data) {
      setCobrancas(res.data.data);
    }
  };

  useEffect(() => { carregarCobrancasAsaas(); }, [tenantAtivoId]);

  const handleDesconectar = async () => {
    if (!window.confirm('Deseja desconectar a Chave de API do Asaas?')) return;
    localStorage.removeItem('terragest_asaas_config');
    await desconectar('ASAAS');
    setConectado(false);
    setCobrancas([]);
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Banco Digital ASAAS & Chave API</h1>
            <p className="text-xs text-gray-500">Configuração da Chave de API, Saldo em Conta, Boletos, PIX QR Code e Transferências</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/financeiro?aba=receber')} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer">
            <span>Ir para Contas a Receber</span><ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Principal para inserir a Chave de API */}
      <AsaasIntegrationCard
        tenantId={tenantAtivoId || undefined}
        onDesconectar={handleDesconectar}
        onConectado={carregarCobrancasAsaas}
      />

      {/* Cards de Recursos Integrados ao Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div onClick={() => navigate('/financeiro?aba=receber')} className="bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-4 shadow-2xs cursor-pointer transition-all space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><QrCode className="w-5 h-5" /></div>
          <h3 className="font-bold text-gray-900 text-sm">Emitir Boleto + PIX QR Code</h3>
          <p className="text-gray-500 text-[11px]">No menu <b>Contas a Receber</b>, clique no botão <b>Asaas</b> em qualquer medição ou serviço para gerar o Boleto e o QR Code PIX na hora.</p>
        </div>

        <div onClick={() => navigate('/financeiro?aba=pagar')} className="bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl p-4 shadow-2xs cursor-pointer transition-all space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Zap className="w-5 h-5" /></div>
          <h3 className="font-bold text-gray-900 text-sm">Pagar Fornecedor via PIX Asaas</h3>
          <p className="text-gray-500 text-[11px]">No menu <b>Contas a Pagar</b>, ao clicar em <b>Pagar</b>, marque a opção de disparar a transferência PIX direto pela sua conta Asaas.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><KeyRound className="w-5 h-5" /></div>
          <h3 className="font-bold text-gray-900 text-sm">Onde pegar a Chave API?</h3>
          <p className="text-gray-500 text-[11px]">No painel do Asaas: <b>Configurações da Conta &rarr; Integrações &rarr; Gerar nova chave de API</b> (código iniciado por <code>$aact_</code>).</p>
        </div>
      </div>

      {/* Últimas Cobranças Sincronizadas do Asaas */}
      {conectado && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden text-xs">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Últimas Cobranças na Conta Asaas
            </h3>
            <button onClick={carregarCobrancasAsaas} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCob ? 'animate-spin' : ''}`} /> Atualizar
            </button>
          </div>
          {cobrancas.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhuma cobrança encontrada no Asaas ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Descrição</th>
                    <th className="p-3">Forma</th>
                    <th className="p-3">Vencimento</th>
                    <th className="p-3 text-right">Valor</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Fatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cobrancas.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{c.description || `Cobrança #${c.id.slice(-6)}`}</td>
                      <td className="p-3 font-mono text-[11px]">{c.billingType}</td>
                      <td className="p-3 font-mono">{c.dueDate}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">{Number(c.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-3 text-center"><span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-bold">{c.status}</span></td>
                      <td className="p-3 text-right">
                        {c.invoiceUrl && (
                          <a href={c.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline">
                            <FileText className="w-3.5 h-3.5" /> Abrir <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BancoAsaas;

