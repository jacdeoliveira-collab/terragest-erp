import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Rocket, MessageCircle } from 'lucide-react';

interface Props {
  nomeModulo: string;
}

export const PlanoBloqueadoGate: React.FC<Props> = ({ nomeModulo }) => {
  const navigate = useNavigate();
  const whatsappUrl = 'https://wa.me/5598984242792?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20ativar%20o%20TerraGest%20ERP';

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
        <Lock className="h-8 w-8" />
      </div>
      <span className="mb-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
        Recurso Exclusivo para Assinantes
      </span>
      <h2 className="text-2xl font-bold text-slate-100">
        Módulo {nomeModulo} Bloqueado
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Sua empresa está utilizando o plano gratuito com Agenda liberada. Para ter acesso completo a este módulo, faça o upgrade do seu plano.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/planos')}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all"
        >
          <Rocket className="h-4 w-4" />
          Ver Planos e Preços
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-all"
        >
          <MessageCircle className="h-4 w-4 text-emerald-400" />
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
};

