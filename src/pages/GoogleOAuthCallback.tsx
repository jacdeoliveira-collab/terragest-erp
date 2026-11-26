import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useIntegrations } from '../hooks/useIntegrations';
import { useTenantContext } from '../contexts/TenantContext';

const PROD_DRIVE_AUTH_URL = 'https://terragest.agrodronesma.com.br/api/google-drive-auth';

export const GoogleOAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { tenantAtivoId, loading: tenantLoading } = useTenantContext();
  const { salvarIntegracao } = useIntegrations();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (tenantLoading || processedRef.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const oauthErr = searchParams.get('error');
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
    const hashToken = new URLSearchParams(hash).get('access_token');

    if (oauthErr) {
      setErrorMsg(`Autorização cancelada pelo Google (${oauthErr}).`);
      return;
    }

    if (!code && !hashToken) {
      setErrorMsg('Código ou token de autorização não encontrado no retorno do Google.');
      return;
    }

    if (!tenantAtivoId) {
      const timer = setTimeout(() => {
        if (!tenantAtivoId) setErrorMsg('Nenhuma empresa selecionada para vincular o Google Drive.');
      }, 800);
      return () => clearTimeout(timer);
    }

    processedRef.current = true;

    async function processCallback() {
      try {
        if (code) {
          const { data: sessionData } = await supabase.auth.getSession();
          const jwt = sessionData.session?.access_token;
          const isCap = window.location.protocol === 'capacitor:';
          const apiUrl = isCap ? PROD_DRIVE_AUTH_URL : '/api/google-drive-auth';
          const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
            },
            body: JSON.stringify({
              action: 'exchange',
              code,
              redirectUri: `${window.location.origin}/oauth/google/callback`,
              tenantId: tenantAtivoId
            })
          });
          const data = await resp.json();
          if (!resp.ok || !data.success) throw new Error(data.error || 'Falha ao salvar conexão permanente.');
          localStorage.setItem('terragest_google_drive_token', data.access_token);
          localStorage.setItem('terragest_google_drive_token_time', String(Date.now()));
          navigate('/minha-empresa', { replace: true });
          return;
        }

        if (hashToken) {
          localStorage.setItem('terragest_google_drive_token', hashToken);
          localStorage.setItem('terragest_google_drive_token_time', String(Date.now()));
          const res = await salvarIntegracao({
            provider: 'GOOGLE_DRIVE',
            access_token: hashToken,
            status: 'connected',
            metadata: { access_token: hashToken, connected_at: new Date().toISOString() }
          });
          if (!res.success) throw new Error(res.error || 'Falha ao salvar integração no banco.');
          navigate('/minha-empresa', { replace: true });
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Erro ao processar callback OAuth do Google.');
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
            <button onClick={() => navigate('/minha-empresa', { replace: true })} className="mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-gray-800 cursor-pointer">
              Voltar para Minha Empresa
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
            <h2 className="text-base font-bold text-gray-900">Ativando Google Drive Permanente...</h2>
            <p className="text-xs text-gray-500">Salvando chave de renovação automática vinculada à sua empresa.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
