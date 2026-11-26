import React from 'react';
import { Check, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { usePlanosContext } from '../../contexts/PlanosContext';
import { MODULOS_SISTEMA, type PlanoSaasRecord } from '../../types/planos.types';

interface RegisterPlanStepProps {
  onSelectPlano: (plano: PlanoSaasRecord) => void;
}

export const RegisterPlanStep: React.FC<RegisterPlanStepProps> = ({ onSelectPlano }) => {
  const { planosAtivos, isLoading, error } = usePlanosContext();

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center gap-2 text-xs text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span>Carregando planos disponíveis...</span>
      </div>
    );
  }

  if (error || planosAtivos.length === 0) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
        Nenhum plano ativo encontrado no banco de dados. Execute a migração <code className="font-mono">65_saas_planos_permissoes_e_asaas_sub.sql</code> no Supabase.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Etapa 1 de 2 — Escolha seu Plano
        </span>
        <h2 className="text-base font-bold text-gray-900 mt-2">Selecione o pacote ideal para sua empresa</h2>
        <p className="text-xs text-gray-500">Planos mensais recorrentes com cobrança transparente via Asaas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {planosAtivos.map((plano) => {
          const modulosNomes = MODULOS_SISTEMA.filter((m) => plano.modulos_habilitados.includes(m.rota)).map((m) => m.nome);
          return (
            <div
              key={plano.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                plano.destaque
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-md ring-1 ring-emerald-500/30'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  <Crown className="w-3 h-3" /> Recomendado
                </span>
              )}

              <div>
                <h3 className="text-sm font-bold text-gray-900">{plano.nome}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 min-h-[32px]">{plano.descricao}</p>

                <div className="my-3 py-2.5 border-y border-gray-100">
                  <span className="text-2xl font-black text-gray-900 font-mono">
                    {plano.valor_mensal === 0 ? 'Grátis' : `R$ ${plano.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </span>
                  {plano.valor_mensal > 0 && <span className="text-[11px] text-gray-500"> /mês</span>}
                  <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">Até {plano.limite_usuarios} usuários</span>
                </div>

                <ul className="space-y-1.5 text-[11px] text-gray-700">
                  {modulosNomes.map((nome) => (
                    <li key={nome} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{nome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectPlano(plano)}
                className={`mt-4 w-full py-2.5 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  plano.destaque
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>Selecionar Plano</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
