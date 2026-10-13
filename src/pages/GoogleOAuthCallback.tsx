import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useIntegrations } from '../hooks/useIntegrations';
import { useTenantContext } from '../contexts/TenantContext';

export const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { tenantAtivoId, loading: tenantLoading } = useTenantContext();
  const { salvarIntegracao } = useIntegrations();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (tenantLoading) return;
    if (processedRef.current) return;

    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (!accessToken) {
      setErrorMsg('Token de acesso não encontrado no retorno da autenticação.');
      return;
    }

    if (!tenantAtivoId && !tenantLoading) {
      // Pequeno debounce para dar tempo do TenantContext sincronizar
      const timer = setTimeout(() => {
        if (!tenantAtivoId) setErrorMsg('Nenhuma empresa selecionada para vincular a integração.');
      }, 600);
      return () => clearTimeout(timer);
    }

    processedRef.current = true;

    async function processCallback() {
      try {
        const res = await salvarIntegracao({
          provider: 'GOOGLE_DRIVE',
          access_token: accessToken || undefined,
          status: 'connected',
          metadata: {
            access_token: accessToken,
            connected_at: new Date().toISOString()
          }
        });

        if (!res.success) {
          setErrorMsg(res.error || 'Falha ao salvar integração no banco.');
          return;
        }

        navigate('/minha-empresa', { replace: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao processar callback OAuth';
        setErrorMsg(msg);
      }
    }

    processCallback();
  }, [tenantLoading, tenantAtivoId, salvarIntegracao, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-4">
        {errorMsg ? (
          <>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Erro na Integração</h2>
            <p className="text-xs text-rose-600">{errorMsg}</p>
            <button
              onClick={() => navigate('/minha-empresa', { replace: true })}
              className="mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Voltar para Minha Empresa
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-base font-bold text-gray-900">Conectando ao Google Drive...</h2>
            <p className="text-xs text-gray-500">
              Salvando autorização OAuth e vinculando à sua empresa.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
