import React, { useState } from 'react';
import { Cloud, CheckCircle2, Unlink, ExternalLink, HardDrive, Shield } from 'lucide-react';
import { useIntegrations } from '../../../hooks/useIntegrations';
import { AsaasIntegrationCard } from '../financeiro/AsaasIntegrationCard';

interface MinhaEmpresaIntegracoesTabProps {
  tenantId?: string;
}

export const MinhaEmpresaIntegracoesTab: React.FC<MinhaEmpresaIntegracoesTabProps> = ({ tenantId }) => {
  const { getIntegration, desconectar, loading, refetch } = useIntegrations(tenantId);
  const [actionLoading, setActionLoading] = useState(false);

  const driveIntegration = getIntegration('GOOGLE_DRIVE') || getIntegration('google_drive');
  const isDriveConnected = driveIntegration?.status === 'connected' || Boolean(driveIntegration?.access_token);

  const handleConnectDrive = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert('VITE_GOOGLE_CLIENT_ID não configurado no .env');
      return;
    }
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${window.location.origin}/oauth/google/callback&response_type=token&scope=https://www.googleapis.com/auth/drive.file`;
    window.location.href = url;
  };

  const handleDisconnectDrive = async () => {
    if (!confirm('Deseja realmente desconectar o Google Drive desta empresa?')) return;
    setActionLoading(true);
    await desconectar(driveIntegration?.provider || 'GOOGLE_DRIVE');
    setActionLoading(false);
  };

  const handleDisconnectAsaas = async () => {
    if (!confirm('Deseja realmente desconectar a conta Asaas desta empresa?')) return;
    setActionLoading(true);
    localStorage.removeItem('terragest_asaas_config');
    await desconectar('ASAAS');
    setActionLoading(false);
  };

  return (
    <div className="space-y-5 text-left text-xs">
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-emerald-900 text-[11px] leading-relaxed">
          Conecte o Banco Digital <b>Asaas (API v3)</b> para boletos, PIX e transferências financeiras, e o <b>Google Drive</b> para armazenamento em nuvem de fotos e laudos.
        </p>
      </div>

      <AsaasIntegrationCard
        tenantId={tenantId}
        onDesconectar={handleDisconnectAsaas}
        onConectado={() => refetch()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-600" />
              </div>

              {isDriveConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Conectado
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-medium">
                  Não integrado
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                Google Drive <ExternalLink className="w-3 h-3 text-gray-400" />
              </h3>
              <p className="text-gray-500 text-[11px] mt-1 leading-normal">
                Automatize a criação de pastas e envio de PDFs e fotos de comprovantes de obras, equipamentos e manutenções.
              </p>
            </div>

            {isDriveConnected && driveIntegration?.account_email && (
              <div className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-[11px] text-gray-600 font-mono">
                Conta: {driveIntegration.account_email}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100">
            {isDriveConnected ? (
              <button type="button" onClick={handleDisconnectDrive} disabled={actionLoading || loading} className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold cursor-pointer">
                <Unlink className="w-3.5 h-3.5" /><span>Desconectar</span>
              </button>
            ) : (
              <button type="button" onClick={handleConnectDrive} disabled={actionLoading || loading} className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm cursor-pointer">
                <Cloud className="w-3.5 h-3.5" /><span>Conectar Google Drive</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Sincronização Ativa
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Segurança & Criptografia RLS</h3>
              <p className="text-gray-500 text-[11px] mt-1 leading-normal">
                Suas chaves de API do Asaas e tokens do Google Drive ficam isolados na tabela <code>tenant_integrations</code> com proteção por empresa.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Credenciais protegidas no Supabase com isolamento multi-empresa</span>
          </div>
        </div>
      </div>
    </div>
  );
};
