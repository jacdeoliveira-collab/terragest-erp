import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Rocket, MessageCircle } from 'lucide-react';

interface Props {
  nomeModulo: string;
  motivo?: 'MODULO' | 'INADIMPLENTE';
  diasAtraso?: number;
  vencimento?: string | null;
}

export const PlanoBloqueadoGate: React.FC<Props> = ({ nomeModulo, motivo = 'MODULO', diasAtraso = 0, vencimento }) => {
  const navigate = useNavigate();
  const isInadimplente = motivo === 'INADIMPLENTE';
  const vencBr = vencimento ? vencimento.split('-').reverse().join('/') : null;
  const whatsappUrl = 'https://wa.me/5599981228668?text=Ol%C3%A1%2C%20preciso%20regularizar%20minha%20assinatura%20no%20TerraGest%20ERP';

  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center p-6 text-center">
      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ${
        isInadimplente ? 'bg-rose-500/15 text-rose-500 ring-rose-500/30' : 'bg-amber-500/10 text-amber-500 ring-amber-500/20'
      }`}>
        <Lock className="h-8 w-8" />
      </div>
      <span className={`mb-2 rounded-full px-3 py-1 text-xs font-bold ${
        isInadimplente ? 'bg-rose-500/15 text-rose-600' : 'bg-amber-500/15 text-amber-600'
      }`}>
        {isInadimplente
          ? `Acesso Suspenso por Inadimplência${diasAtraso > 0 ? ` (${diasAtraso} dia${diasAtraso > 1 ? 's' : ''} em atraso)` : ''}`
          : 'Recurso Exclusivo para Assinantes'}
      </span>
      <h2 className="text-2xl font-bold text-slate-900">
        {isInadimplente ? 'Assinatura Vencida — Acesso Cancelado' : `Módulo ${nomeModulo} Bloqueado`}
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        {isInadimplente
          ? `O acesso ao aplicativo foi suspenso automaticamente${vencBr ? ` devido ao vencimento em ${vencBr}` : ''}. Regularize sua assinatura recorrente via PIX para reativar imediatamente todos os módulos.`
          : 'Este módulo não está habilitado no seu plano atual. Faça o upgrade em Planos e Preços para liberar o acesso imediato.'}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/planos')}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Rocket className="h-4 w-4" />
          {isInadimplente ? 'Regularizar Assinatura (PIX)' : 'Ver Planos e Preços'}
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
};

