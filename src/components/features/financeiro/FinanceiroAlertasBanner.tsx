import React from 'react';
import { AlertTriangle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useContasPagar } from '../../../hooks/useContasPagar';
import { useContasReceber } from '../../../hooks/useContasReceber';

interface FinanceiroAlertasBannerProps {
  onNavegarTab: (tab: 'pagar' | 'receber') => void;
}

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const FinanceiroAlertasBanner: React.FC<FinanceiroAlertasBannerProps> = ({ onNavegarTab }) => {
  const { data: pagarData } = useContasPagar();
  const { data: receberData } = useContasReceber();

  const hoje = new Date().toISOString().slice(0, 10);
  const limite5Dias = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);

  const pagarVencidas = pagarData.filter((p) => p.status === 'PENDENTE' && p.data_vencimento < hoje);
  const valPagarVencidas = pagarVencidas.reduce((acc, p) => acc + Number(p.valor || 0), 0);

  const pagarVencendo = pagarData.filter((p) => p.status === 'PENDENTE' && p.data_vencimento >= hoje && p.data_vencimento <= limite5Dias);
  const valPagarVencendo = pagarVencendo.reduce((acc, p) => acc + Number(p.valor || 0), 0);

  const receberVencidas = receberData.filter((r) => r.status_pagamento !== 'PAGO' && r.data_vencimento < hoje);
  const valReceberVencidas = receberVencidas.reduce((acc, r) => acc + Number(r.saldo_restante || r.valor_total || 0), 0);

  const receberVencendo = receberData.filter((r) => r.status_pagamento !== 'PAGO' && r.data_vencimento >= hoje && r.data_vencimento <= limite5Dias);
  const valReceberVencendo = receberVencendo.reduce((acc, r) => acc + Number(r.saldo_restante || r.valor_total || 0), 0);

  const totalAlertasCriticos = pagarVencidas.length + receberVencidas.length;
  const totalAlertasProximos = pagarVencendo.length + receberVencendo.length;

  if (totalAlertasCriticos === 0 && totalAlertasProximos === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span><b>Vencimentos em dia:</b> Não há contas a pagar nem faturamentos vencidos ou vencendo nos próximos 5 dias.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
      {/* Alertas de Contas a Pagar */}
      <div className="p-3.5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Alertas de Contas a Pagar
          </span>
          <button
            onClick={() => onNavegarTab('pagar')}
            className="text-[11px] text-rose-700 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Ver no Pagar</span> <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {pagarVencidas.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              <span><b>{pagarVencidas.length}</b> vencida(s): <b>{fmtBRL(valPagarVencidas)}</b></span>
            </div>
          )}
          {pagarVencendo.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium">
              <Clock className="w-3 h-3 text-amber-600" />
              <span><b>{pagarVencendo.length}</b> a vencer (5 dias): <b>{fmtBRL(valPagarVencendo)}</b></span>
            </div>
          )}
          {pagarVencidas.length === 0 && pagarVencendo.length === 0 && (
            <span className="text-[11px] text-gray-400">Nenhum vencimento urgente no Contas a Pagar.</span>
          )}
        </div>
      </div>

      {/* Alertas de Contas a Receber */}
      <div className="p-3.5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            Alertas de Contas a Receber
          </span>
          <button
            onClick={() => onNavegarTab('receber')}
            className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Ver no Receber</span> <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {receberVencidas.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              <span><b>{receberVencidas.length}</b> faturamento(s) atrasado(s): <b>{fmtBRL(valReceberVencidas)}</b></span>
            </div>
          )}
          {receberVencendo.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl font-medium">
              <Clock className="w-3 h-3 text-blue-600" />
              <span><b>{receberVencendo.length}</b> vencendo (5 dias): <b>{fmtBRL(valReceberVencendo)}</b></span>
            </div>
          )}
          {receberVencidas.length === 0 && receberVencendo.length === 0 && (
            <span className="text-[11px] text-gray-400">Nenhum faturamento vencendo próximo no Contas a Receber.</span>
          )}
        </div>
      </div>
    </div>
  );
};
