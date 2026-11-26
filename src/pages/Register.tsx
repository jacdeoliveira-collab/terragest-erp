import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, ExternalLink, Copy } from 'lucide-react';
import { RegisterPlanStep } from '../components/auth/RegisterPlanStep';
import { RegisterForm } from '../components/auth/RegisterForm';
import type { PlanoSaasRecord } from '../types/planos.types';
import type { AsaasOnboardingResult } from '../services/authRegisterService';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoSaasRecord | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [confirmacaoEmail, setConfirmacaoEmail] = useState(false);
  const [asaasRes, setAsaasRes] = useState<AsaasOnboardingResult | undefined>();
  const [copiado, setCopiado] = useState(false);

  const handleSuccess = (requiresEmailConfirmation?: boolean, asaas?: AsaasOnboardingResult) => {
    setConfirmacaoEmail(Boolean(requiresEmailConfirmation));
    setAsaasRes(asaas);
    if (asaas?.invoiceUrl || asaas?.pixCopiaCola || asaas?.subscriptionId || requiresEmailConfirmation) {
      setSucesso(true);
    } else {
      navigate('/comercial', { replace: true });
    }
  };

  const copiarPix = () => {
    if (!asaasRes?.pixCopiaCola) return;
    navigator.clipboard.writeText(asaasRes.pixCopiaCola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className={`w-full ${planoSelecionado || sucesso ? 'max-w-xl' : 'max-w-4xl'} transition-all`}>
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white shadow-xl shadow-black/50 mb-3 border border-amber-300/40">
            <img src="/logo-terragest.png" alt="TerraGest" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1">
            <span>TERRA</span><span className="text-amber-400">GEST</span> ERP
          </h1>
          <p className="text-xs text-amber-300 font-bold tracking-wider uppercase mt-1">
            CREDENCIAMENTO CORPORATIVO & ASSINATURA RECORRENTE
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-7 border border-gray-100">
          {sucesso ? (
            <div className="text-center py-3 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Empresa e Assinatura Cadastradas!</h2>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                {confirmacaoEmail
                  ? 'Enviamos um link de confirmação para o seu e-mail.'
                  : 'Sua empresa já foi criada e vinculada ao plano escolhido.'}
              </p>

              {asaasRes?.subscriptionId && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-3">
                  <p>Assinatura Mensal Asaas: <strong className="font-mono">{asaasRes.subscriptionId}</strong></p>
                  {asaasRes.pixQrCode && (
                    <div className="flex justify-center">
                      <img src={`data:image/png;base64,${asaasRes.pixQrCode}`} alt="QR Code PIX Asaas" className="w-40 h-40 rounded-xl border border-emerald-200 bg-white p-2" />
                    </div>
                  )}
                  {asaasRes.pixCopiaCola && (
                    <div className="flex gap-2">
                      <input readOnly value={asaasRes.pixCopiaCola} className="flex-1 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-[11px] font-mono" />
                      <button type="button" onClick={copiarPix} className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold inline-flex items-center gap-1 cursor-pointer">
                        <Copy className="w-3.5 h-3.5" /><span>{copiado ? 'Copiado!' : 'Copiar PIX'}</span>
                      </button>
                    </div>
                  )}
                  {asaasRes.invoiceUrl && (
                    <a href={asaasRes.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
                      <ExternalLink className="w-3.5 h-3.5" /><span>Abrir Fatura / Boleto no Asaas</span>
                    </a>
                  )}
                </div>
              )}

              {asaasRes?.aviso && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">{asaasRes.aviso}</div>
              )}

              <button type="button" onClick={() => navigate(confirmacaoEmail ? '/login' : '/comercial', { replace: true })} className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs cursor-pointer">
                {confirmacaoEmail ? 'Ir para Tela de Login' : 'Acessar TerraGest ERP'}
              </button>
            </div>
          ) : !planoSelecionado ? (
            <RegisterPlanStep onSelectPlano={setPlanoSelecionado} />
          ) : (
            <>
              <div className="mb-4 pb-2.5 border-b border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Etapa 2 de 2 — Dados da Empresa, Contrato LGPD & Asaas</span>
                <h2 className="text-base font-bold text-gray-900">Finalizar Cadastro Corporativo</h2>
              </div>
              <RegisterForm planoSelecionado={planoSelecionado} onVoltarPlanos={() => setPlanoSelecionado(null)} onSuccess={handleSuccess} />
            </>
          )}

          <div className="mt-5 pt-3 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-500">Já tem conta? </span>
            <Link to="/login" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Fazer Login</Link>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Isolamento Multitenant Blindado & Cobrança Real Asaas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
