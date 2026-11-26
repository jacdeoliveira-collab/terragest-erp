import React, { useState } from 'react';
import { Check, Crown, MessageCircle, Rocket, ShieldCheck } from 'lucide-react';
import { useTenantContext } from '../contexts/TenantContext';
import { usePlanosContext } from '../contexts/PlanosContext';
import { MODULOS_SISTEMA, type PlanoSaasRecord } from '../types/planos.types';
import { PlanoCheckoutModal } from '../components/features/planos/PlanoCheckoutModal';

export const PlanosPage: React.FC = () => {
  const { tenantAtivo, tenantAtivoId, recarregarTenants } = useTenantContext();
  const { planosAtivos, isLoading } = usePlanosContext();
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoSaasRecord | null>(null);

  const planoAtual = (tenantAtivo?.plano || 'GRATIS').toUpperCase();
  const vencimentoIso = tenantAtivo?.assinatura_fim || null;
  const vencimentoBr = vencimentoIso ? vencimentoIso.split('-').reverse().join('/') : null;
  const hojeIso = new Date().toISOString().slice(0, 10);
  const diasAtraso = vencimentoIso && vencimentoIso < hojeIso
    ? Math.max(1, Math.round((new Date(`${hojeIso}T00:00:00`).getTime() - new Date(`${vencimentoIso}T00:00:00`).getTime()) / 86400000))
    : 0;
  const temPlanoPagoAtivo = planoAtual !== 'GRATIS' && Boolean(vencimentoIso) && diasAtraso === 0;
  const whatsappUrl = 'https://wa.me/5599981228668?text=Ol%C3%A1%2C%20quero%20tirar%20d%C3%BAvidas%20sobre%20os%20planos%20do%20TerraGest%20ERP';

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6 text-left">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Rocket className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Assinatura Recorrente TerraGest ERP</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white">Planos e Preços</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>Empresa: <strong className="text-slate-200">{tenantAtivo?.nome || 'Sua Empresa'}</strong></span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-bold text-emerald-300">{planoAtual}</span>
            {vencimentoBr && (
              <span className={`rounded-md px-2 py-0.5 font-mono font-bold ${diasAtraso > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-200'}`}>
                {diasAtraso > 0 ? `Vencido em ${vencimentoBr} (${diasAtraso}d atraso)` : `Vencimento: ${vencimentoBr}`}
              </span>
            )}
            {tenantAtivo?.asaas_subscription_id && (
              <span className="rounded-md bg-sky-500/15 px-2 py-0.5 font-bold text-sky-300">Recorrência Asaas Ativa</span>
            )}
          </div>
        </div>

        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all">
          <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
        </a>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-xs text-slate-400">Carregando planos disponíveis...</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {planosAtivos.map((plano) => {
            const ehAtual = planoAtual === plano.codigo.toUpperCase();
            const nomesModulos = MODULOS_SISTEMA.filter((m) => plano.modulos_habilitados.includes(m.rota)).map((m) => m.nome);
            return (
              <div key={plano.id} className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${plano.destaque ? 'border-emerald-500/60 bg-slate-900 shadow-xl shadow-emerald-950/30' : 'border-slate-800 bg-slate-900/70'}`}>
                {plano.destaque && (
                  <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-slate-950">
                    <Crown className="h-3 w-3" /> Mais Popular
                  </span>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white">{plano.nome}</h2>
                  <p className="mt-1 min-h-[36px] text-xs text-slate-400">{plano.descricao}</p>
                  <div className="my-4 border-y border-slate-800 py-3">
                    <span className="text-3xl font-extrabold text-white">
                      {plano.valor_mensal === 0 ? 'Grátis' : `R$ ${plano.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </span>
                    {plano.valor_mensal > 0 && <span className="text-xs text-slate-400"> / mês</span>}
                    <span className="block text-[11px] text-slate-400 mt-1">Até {plano.limite_usuarios} usuários</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {nomesModulos.map((nomeMod) => (
                      <li key={nomeMod} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span>{nomeMod}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  {ehAtual && diasAtraso === 0 ? (
                    <button disabled className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-300">
                      <ShieldCheck className="h-4 w-4" /> Plano Ativo
                    </button>
                  ) : (
                    <button type="button" onClick={() => setPlanoSelecionado(plano)} className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${diasAtraso > 0 ? 'bg-rose-600 text-white hover:bg-rose-500' : plano.destaque ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                      {diasAtraso > 0
                        ? (ehAtual ? 'Regularizar Assinatura (PIX)' : 'Regularizar e Trocar (PIX)')
                        : temPlanoPagoAtivo
                          ? 'Trocar para este Plano'
                          : 'Assinar Recorrente (PIX / Asaas)'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {planoSelecionado && tenantAtivoId && (
        <PlanoCheckoutModal
          plano={planoSelecionado}
          tenantId={tenantAtivoId}
          onClose={() => setPlanoSelecionado(null)}
          onConfirmed={recarregarTenants}
        />
      )}
    </div>
  );
};
