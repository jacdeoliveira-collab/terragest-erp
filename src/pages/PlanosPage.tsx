import React, { useState } from 'react';
import { Check, Crown, MessageCircle, Rocket, ShieldCheck } from 'lucide-react';
import { useTenantContext } from '../contexts/TenantContext';
import { PLANOS_CATALOGO, type PlanoCatalogoItem } from '../utils/planosCatalogo';
import { PlanoCheckoutModal } from '../components/features/planos/PlanoCheckoutModal';

export const PlanosPage: React.FC = () => {
  const { tenantAtivo, tenantAtivoId, recarregarTenants } = useTenantContext();
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoCatalogoItem | null>(null);

  const planoAtual = tenantAtivo?.plano || 'GRATIS';
  const whatsappUrl = 'https://wa.me/5598984242792?text=Ol%C3%A1%2C%20quero%20tirar%20d%C3%BAvidas%20sobre%20os%20planos%20do%20TerraGest%20ERP';

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Rocket className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Assinatura TerraGest ERP</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white">Planos e Preços</h1>
          <p className="mt-1 text-sm text-slate-400">
            Plano atual da empresa <strong className="text-slate-200">{tenantAtivo?.nome || 'Sua Construtora'}</strong>:{' '}
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">{planoAtual}</span>
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          Falar no WhatsApp
        </a>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLANOS_CATALOGO.map((plano) => {
          const ehAtual = planoAtual === plano.id;
          return (
            <div
              key={plano.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                plano.destaque
                  ? 'border-emerald-500/60 bg-slate-900 shadow-xl shadow-emerald-950/30'
                  : 'border-slate-800 bg-slate-900/70'
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-0.5 text-xs font-bold text-slate-950">
                  <Crown className="h-3 w-3" /> Mais Popular
                </span>
              )}

              <div>
                <h2 className="text-lg font-bold text-white">{plano.nome}</h2>
                <p className="mt-1 min-h-[36px] text-xs text-slate-400">{plano.subtitulo}</p>

                <div className="my-4 border-y border-slate-800 py-3">
                  <span className="text-3xl font-extrabold text-white">
                    {plano.preco === 0 ? 'Grátis' : `R$ ${plano.preco.toLocaleString('pt-BR')}`}
                  </span>
                  {plano.preco > 0 && <span className="text-xs text-slate-400"> / mês</span>}
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  {plano.recursos.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                {ehAtual ? (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-300"
                  >
                    <ShieldCheck className="h-4 w-4" /> Plano Ativo
                  </button>
                ) : plano.preco === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-800/40 py-2.5 text-center text-xs text-slate-400">
                    Plano Inicial
                  </div>
                ) : (
                  <button
                    onClick={() => setPlanoSelecionado(plano)}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition-all ${
                      plano.destaque
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    Assinar com PIX / Asaas
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

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

