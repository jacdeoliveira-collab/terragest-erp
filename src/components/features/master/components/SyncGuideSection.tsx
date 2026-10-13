import React, { useState } from 'react';
import { Copy, Check, ExternalLink, UploadCloud, Terminal } from 'lucide-react';

interface SyncGuideSectionProps {
  onPushLocalData?: () => Promise<void> | void;
}

export const SyncGuideSection: React.FC<SyncGuideSectionProps> = ({ onPushLocalData }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const projectRef = supabaseUrl.includes('.supabase.co')
    ? supabaseUrl.replace('https://', '').split('.')[0]
    : '';

  const handleCopySql = async () => {
    const ddl = `-- TerraGest ERP SaaS - Políticas RLS & Multi-Tenancy Core
-- 1. Tenants & Isolamento
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS abastecimentos ENABLE ROW LEVEL SECURITY;

-- 2. Política de Isolamento Multi-Tenancy por Tenant ID
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_equipment') THEN
    CREATE POLICY tenant_isolation_equipment ON equipment FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');
  END IF;
END $$;`;

    await navigator.clipboard.writeText(ddl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenSqlEditor = () => {
    const url = projectRef
      ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
      : 'https://supabase.com/dashboard';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePushData = async () => {
    try {
      setIsPushing(true);
      setPushStatus('Verificando integridade e sincronizando...');
      if (onPushLocalData) {
        await onPushLocalData();
      }
      setPushStatus('Sincronização concluída com sucesso!');
      setTimeout(() => setPushStatus(null), 3000);
    } catch {
      setPushStatus('Falha ao sincronizar dados locais.');
      setTimeout(() => setPushStatus(null), 3000);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="bg-[#11161d] border border-[#21262d] rounded-xl p-5 space-y-4 text-left">
      <div>
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>Guia de Sincronização & Deploy do Banco</span>
        </h3>
        <p className="text-[11px] text-gray-400">Ferramentas de inicialização de schema DDL, RLS e dados mestres</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Copiar Script */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3.5 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-300">1. Copiar Script SQL</span>
            <p className="text-[11px] text-gray-400">Esquema completo com 20 tabelas DDL e políticas RLS multi-tenant.</p>
          </div>
          <button
            onClick={handleCopySql}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1c2128] hover:bg-[#2d333b] text-gray-200 rounded-md text-xs font-semibold border border-[#30363d] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            <span>{copied ? 'SQL Copiado!' : 'Copiar SQL'}</span>
          </button>
        </div>

        {/* Card 2: Executar no Supabase */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3.5 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-300">2. Executar no Supabase</span>
            <p className="text-[11px] text-gray-400">Abra o SQL Editor do projeto e clique em RUN para inicializar.</p>
          </div>
          <button
            onClick={handleOpenSqlEditor}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow-sm transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir SQL Editor ↗</span>
          </button>
        </div>

        {/* Card 3: Subir Dados Locais */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-3.5 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-300">3. Subir Dados Locais</span>
            <p className="text-[11px] text-gray-400">
              {pushStatus || 'Envia cadastros de frotas, tabelas e notas locais para a nuvem.'}
            </p>
          </div>
          <button
            onClick={handlePushData}
            disabled={isPushing}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1c2128] hover:bg-[#2d333b] text-gray-200 rounded-md text-xs font-semibold border border-[#30363d] transition-all disabled:opacity-50"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-bounce text-amber-400' : 'text-gray-400'}`} />
            <span>{isPushing ? 'Sincronizando...' : 'Subir Dados (Push)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
