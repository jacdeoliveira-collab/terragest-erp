import React, { useState } from 'react';
import { Sparkles, RefreshCw, Download, X, CheckCircle2 } from 'lucide-react';
import { useVersionCheck } from '../../hooks/useVersionCheck';
import { purgarCachesPesadosLocalStorage } from '../../utils/storagePurge';

export const VersionUpdateAlert: React.FC = () => {
  const { updateAvailable, currentVersion, versionInfo, isNativeApk, dismissUpdate } = useVersionCheck();
  const [updating, setUpdating] = useState(false);

  if (!updateAvailable || !versionInfo) return null;

  const handleWebUpdate = async () => {
    try {
      setUpdating(true);
      purgarCachesPesadosLocalStorage();

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch (err) {
      console.warn('[VersionUpdateAlert] Aviso ao limpar cache:', err);
    } finally {
      window.location.reload();
    }
  };

  const handleApkDownload = () => {
    setUpdating(true);
    const targetUrl = versionInfo.apkUrl || 'https://terragest.agrodronesma.com.br/downloads/terragest-latest.apk';
    window.open(targetUrl, '_system');
    setTimeout(() => setUpdating(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-emerald-200 overflow-hidden text-left">
        {/* Cabeçalho de Destaque */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-200 block">
                Atualização Disponível
              </span>
              <h3 className="text-sm sm:text-base font-bold">
                Nova Versão v{versionInfo.version}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissUpdate}
            title="Lembrar mais tarde"
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo com Changelog */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span>Versão instalada: <strong className="font-mono text-slate-700">v{currentVersion}</strong></span>
            <span>Nova versão: <strong className="font-mono text-emerald-700">v{versionInfo.version}</strong></span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>O que há de novo nesta atualização:</span>
            </div>
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {versionInfo.changelog || 'Melhorias de desempenho, correções e novos recursos operacionais.'}
            </div>
          </div>

          {/* Botões de Ação Inteligente (Web vs APK Capacitor) */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
            <button
              type="button"
              onClick={dismissUpdate}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Agora não
            </button>

            {isNativeApk ? (
              <button
                type="button"
                onClick={handleApkDownload}
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{updating ? 'Iniciando Download...' : 'Baixar Novo APK Atualizado'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleWebUpdate}
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                <span>{updating ? 'Atualizando Sistema...' : 'Atualizar e Recarregar Agora'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionUpdateAlert;

