import React from 'react';
import { UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import type { OnboardingItem, WebhookLogItem } from '../types/master.types';
import { WebhookSimulatorCard } from '../components/WebhookSimulatorCard';

interface MasterWebhooksTabProps {
  onboardings: OnboardingItem[];
  webhookLogs: WebhookLogItem[];
  onAprovarOnboarding: (id: string) => void;
  onDispararWebhook: (log: Omit<WebhookLogItem, 'id' | 'data'>) => void;
}

export const MasterWebhooksTab: React.FC<MasterWebhooksTabProps> = ({
  onboardings,
  webhookLogs,
  onAprovarOnboarding,
  onDispararWebhook,
}) => {
  return (
    <div className="space-y-4 text-left">
      {/* 1. Fila de Onboardings */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fila de Onboardings Pré-Cadastrados</h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">{onboardings.length} cadastros</span>
        </div>
        <p className="text-[11px] text-gray-400 -mt-2">Cadastros que aguardam confirmação do Webhook ou liberação manual para ativação.</p>

        <div className="overflow-x-auto border border-[#21262d] rounded-lg">
          <table className="w-full text-xs text-left text-gray-300">
            <thead className="bg-[#0d1117] text-[11px] text-gray-400 uppercase font-semibold border-b border-[#21262d]">
              <tr>
                <th className="py-2.5 px-3">Empresa</th>
                <th className="py-2.5 px-3">Administrador</th>
                <th className="py-2.5 px-3">Plano</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {onboardings.map((item) => (
                <tr key={item.id} className="hover:bg-[#161b22] transition-colors">
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-white">{item.empresa}</p>
                    <p className="text-[10px] text-gray-400">{item.localizacao}</p>
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="text-gray-200">{item.admin}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.email}</p>
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="text-amber-400 font-semibold">{item.plano}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{item.valor}</p>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        item.status === 'APROVADO'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {item.status === 'AGUARDANDO' ? (
                      <button
                        onClick={() => onAprovarOnboarding(item.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-all shadow-sm"
                      >
                        Aprovar (Bypass)
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-medium">Ativado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Simulador e Endpoint */}
      <WebhookSimulatorCard onDisparar={onDispararWebhook} />

      {/* 3. Logs Recentes de Webhooks */}
      <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
          Logs Recentes de Webhooks ({webhookLogs.length})
        </h3>
        {webhookLogs.length === 0 ? (
          <p className="text-xs text-gray-500 py-3 text-center">Nenhum webhook registrado nesta sessão.</p>
        ) : (
          <div className="space-y-1.5">
            {webhookLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#0d1117] border border-[#21262d] rounded-lg p-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {log.status === 'sucesso' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span className="font-bold text-white">{log.gateway}</span>
                  <span className="text-gray-400 font-mono text-[11px]">{log.evento}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-400 font-mono">{log.resposta}</span>
                  <span className="text-[10px] text-gray-500">{log.data}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
