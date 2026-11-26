import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { MODULOS_SISTEMA, type PlanoSaasRecord } from '../../../types/planos.types';
import type { CalculoMudancaPlano } from '../../../utils/planoProRataCalculator';
import { TermoAdesaoClausulas } from './TermoAdesaoClausulas';

interface Props {
  plano: PlanoSaasRecord;
  aceito: boolean;
  onChangeAceito: (v: boolean) => void;
  calculoProRata?: CalculoMudancaPlano | null;
  dark?: boolean;
}

export const TermoAdesaoPlanoBox: React.FC<Props> = ({
  plano, aceito, onChangeAceito, calculoProRata, dark = false
}) => {
  const [expandido, setExpandido] = useState(false);

  const qtdModulos = MODULOS_SISTEMA.filter((m) => plano.modulos_habilitados.includes(m.rota)).length;
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const boxBase = dark
    ? 'bg-slate-800/80 border-slate-700 text-slate-200'
    : 'bg-slate-50 border-slate-200 text-slate-700';

  return (
    <div className={`rounded-xl border p-3 text-left text-[11px] space-y-2.5 ${boxBase}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">Contrato de Adesão, LGPD & Escopo ({plano.nome})</span>
          </div>
          <span className="block text-[10px] opacity-75">Contratada: JAC de Oliveira / TerraGest — Codó/MA • Foro: Codó/MA</span>
        </div>
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 hover:underline cursor-pointer shrink-0"
        >
          <span>{expandido ? 'Ocultar contrato' : 'Ler cláusulas (1 a 6)'}</span>
          {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {calculoProRata && calculoProRata.tipoMudanca !== 'NOVA_ASSINATURA' && (
        <div className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
          calculoProRata.estaAtrasado
            ? (dark ? 'bg-rose-950/50 border-rose-500/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900')
            : (dark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900')
        }`}>
          <div className="font-bold flex items-center justify-between gap-2">
            <span>{calculoProRata.estaAtrasado ? `Assinatura em Atraso (${calculoProRata.diasAtraso}d)` : `Calculadora de Créditos (${calculoProRata.tipoMudanca})`}</span>
            <span className="font-mono">Vencimento: {calculoProRata.novaDataVencimentoBr}</span>
          </div>
          <p className="text-[10px] leading-relaxed">{calculoProRata.resumoExplicativo}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-current/15 font-mono text-[10px]">
            <span>Saldo crédito: <strong>{fmt(calculoProRata.creditoProporcionalAtual)}</strong></span>
            <span>Dias no novo plano: <strong>{calculoProRata.diasConvertidosNovoPlano}d</strong></span>
            <span>Cobrança hoje: <strong>{calculoProRata.precisaPagamentoImediato ? fmt(calculoProRata.valorCobrarAgora) : 'R$ 0,00 (Crédito)'}</strong></span>
          </div>
        </div>
      )}

      {expandido && <TermoAdesaoClausulas plano={plano} dark={dark} />}

      <label className="flex items-start gap-2 pt-0.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={aceito}
          onChange={(e) => onChangeAceito(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded accent-emerald-600 cursor-pointer shrink-0"
        />
        <span className="leading-snug">
          Li e concordo com o <strong>Contrato de Adesão (JAC de Oliveira / TerraGest — Codó/MA)</strong> referente ao{' '}
          <strong>{plano.nome}</strong> ({qtdModulos} módulos habilitados e limite de <strong>{plano.limite_usuarios} usuários</strong>),
          com a cláusula <strong>LGPD (Contratante Controladora / TerraGest Operador)</strong>, cobrança mensal recorrente ({fmt(plano.valor_mensal)}/mês),
          regras de suspensão (5 dias), retenção (30 dias) e Foro de Codó/MA.
        </span>
      </label>
    </div>
  );
};
