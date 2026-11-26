import React from 'react';
import { ArrowRight, Calendar, CreditCard, MinusCircle, PlusCircle, AlertTriangle } from 'lucide-react';
import { MODULOS_SISTEMA, type PlanoSaasRecord } from '../../../types/planos.types';
import type { CalculoMudancaPlano } from '../../../utils/planoProRataCalculator';

interface Props {
  calculo: CalculoMudancaPlano;
  planoAtualObj?: PlanoSaasRecord | null;
  planoNovo: PlanoSaasRecord;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const TrocaPlanoResumoDialog: React.FC<Props> = ({ calculo, planoAtualObj, planoNovo }) => {
  const modsAtuais = new Set(planoAtualObj?.modulos_habilitados || []);
  const modsNovos = new Set(planoNovo.modulos_habilitados || []);
  const adicionados = MODULOS_SISTEMA.filter((m) => modsNovos.has(m.rota) && !modsAtuais.has(m.rota));
  const removidos = planoAtualObj
    ? MODULOS_SISTEMA.filter((m) => modsAtuais.has(m.rota) && !modsNovos.has(m.rota))
    : [];

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 text-slate-900 shadow-sm space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-extrabold uppercase tracking-wide text-slate-900 text-[11px]">
          Resumo da Troca de Plano — Preto no Branco
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
          calculo.estaAtrasado ? 'bg-rose-100 text-rose-800' : 'bg-slate-900 text-white'
        }`}>
          {calculo.estaAtrasado ? `ATRASADO (${calculo.diasAtraso}d)` : calculo.tipoMudanca}
        </span>
      </div>

      {/* Comparativo De -> Para */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
        <div>
          <span className="block text-[10px] font-bold uppercase text-slate-500">Plano Atual</span>
          <strong className="text-slate-900">{calculo.planoAtualNome}</strong>
          <span className="block text-[11px] font-mono text-slate-700">{fmt(calculo.valorPlanoAtual)}/mês</span>
          {calculo.vencimentoAtualBr && (
            <span className="block text-[10px] text-slate-500">Venc.: {calculo.vencimentoAtualBr}</span>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
        <div className="text-right">
          <span className="block text-[10px] font-bold uppercase text-emerald-700">Novo Plano</span>
          <strong className="text-slate-900">{planoNovo.nome}</strong>
          <span className="block text-[11px] font-mono font-bold text-emerald-700">{fmt(calculo.valorPlanoNovo)}/mês</span>
          <span className="block text-[10px] text-slate-600">Até {planoNovo.limite_usuarios} usuários</span>
        </div>
      </div>

      {/* Memória de cálculo transparente */}
      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
        <div className="flex justify-between px-3 py-2">
          <span className="text-slate-600">Dias restantes no plano atual</span>
          <strong className="font-mono text-slate-900">
            {calculo.estaAtrasado ? `0 dias (vencido há ${calculo.diasAtraso}d)` : `${calculo.diasRestantesAtuais} dia(s)`}
          </strong>
        </div>
        <div className="flex justify-between px-3 py-2">
          <span className="text-slate-600">
            Saldo de crédito atual {calculo.diasRestantesAtuais > 0 ? `(${fmt(calculo.diariaAtual)}/dia × ${calculo.diasRestantesAtuais}d)` : ''}
          </span>
          <strong className="font-mono text-emerald-700">{fmt(calculo.creditoProporcionalAtual)}</strong>
        </div>
        <div className="flex justify-between px-3 py-2">
          <span className="text-slate-600">
            Dias liberados no {planoNovo.nome} {!calculo.precisaPagamentoImediato ? `(Crédito ÷ ${fmt(calculo.diariaNova)}/dia)` : '(Ciclo mensal)'}
          </span>
          <strong className="font-mono text-slate-900">{calculo.diasAcessoTotalNovo} dia(s)</strong>
        </div>
        <div className="flex justify-between px-3 py-2 bg-slate-50">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Calendar className="h-3.5 w-3.5 text-slate-500" /> Próximo vencimento
          </span>
          <strong className="font-mono text-slate-900">{calculo.novaDataVencimentoBr}</strong>
        </div>
        <div className="flex justify-between px-3 py-2 bg-slate-50">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <CreditCard className="h-3.5 w-3.5 text-slate-500" /> Cobrança hoje
          </span>
          <strong className={`font-mono ${calculo.precisaPagamentoImediato ? 'text-rose-700' : 'text-emerald-700'}`}>
            {calculo.precisaPagamentoImediato ? `${fmt(calculo.valorCobrarAgora)} (PIX imediato)` : 'R$ 0,00 (coberto pelo crédito)'}
          </strong>
        </div>
        <div className="flex justify-between px-3 py-2">
          <span className="text-slate-600">Próxima mensalidade recorrente (Asaas)</span>
          <strong className="font-mono text-slate-900">{fmt(calculo.valorPlanoNovo)}/mês</strong>
        </div>
      </div>

      {/* O que muda nos módulos */}
      {(adicionados.length > 0 || removidos.length > 0) && (
        <div className="rounded-lg border border-slate-200 p-2.5 space-y-2 bg-slate-50/70">
          <span className="block text-[10px] font-extrabold uppercase text-slate-700">O que muda nos seus módulos:</span>
          {adicionados.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                <PlusCircle className="h-3 w-3" /> Liberados imediatamente ({adicionados.length}):
              </span>
              <p className="text-[11px] text-slate-800 leading-snug">{adicionados.map((m) => m.nome).join(' • ')}</p>
            </div>
          )}
          {removidos.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                <MinusCircle className="h-3 w-3" /> Deixam de ficar ativos ({removidos.length}):
              </span>
              <p className="text-[11px] text-slate-800 leading-snug">{removidos.map((m) => m.nome).join(' • ')}</p>
            </div>
          )}
        </div>
      )}

      {calculo.estaAtrasado && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-[11px] text-rose-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          <span>Como sua assinatura está vencida, o pagamento imediato via PIX é obrigatório para reativar o sistema e iniciar o novo ciclo de 30 dias.</span>
        </div>
      )}
    </div>
  );
};
