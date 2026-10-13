import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Building2, FileText, MapPin, Award, Cloud, Users } from 'lucide-react';
import type { TenantMaster, EmpresaConfigPayload } from '../../../types/tenant.types';
import { EmpresaFiscalTab } from './EmpresaFiscalTab';
import { EmpresaContatoTab } from './EmpresaContatoTab';
import { EmpresaTecnicoTab } from './EmpresaTecnicoTab';
import { MinhaEmpresaIntegracoesTab } from './MinhaEmpresaIntegracoesTab';
import { EmpresaUsuariosTab } from './EmpresaUsuariosTab';

interface EmpresaConfigFormProps {
  empresa: TenantMaster | null;
  isSaving: boolean;
  error: string | null;
  success: boolean;
  onSave: (payload: EmpresaConfigPayload) => Promise<{ success: boolean }>;
}

type TabType = 'fiscais' | 'contato' | 'tecnica' | 'integracoes' | 'usuarios';

export const EmpresaConfigForm: React.FC<EmpresaConfigFormProps> = ({
  empresa, isSaving, error, success, onSave
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('fiscais');
  const [razaoSocial, setRazaoSocial] = useState(''); const [cnpj, setCnpj] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(''); const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
  const [cnae, setCnae] = useState(''); const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState(''); const [endereco, setEndereco] = useState('');
  const [responsavelTecnico, setResponsavelTecnico] = useState(''); const [registroCrea, setRegistroCrea] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!empresa) return;
    setRazaoSocial(empresa.razao_social || empresa.nome || ''); setCnpj(empresa.cnpj || '');
    setInscricaoEstadual(empresa.inscricao_estadual || ''); setInscricaoMunicipal(empresa.inscricao_municipal || '');
    setCnae(empresa.cnae || ''); setTelefone(empresa.contato_telefone || '');
    setEmail(empresa.contato_email || empresa.admin_email || ''); setEndereco(empresa.endereco || '');
    setResponsavelTecnico(empresa.responsavel_tecnico || ''); setRegistroCrea(empresa.registro_crea || '');
    setLogoUrl(empresa.logo_url || null);
    setAssinaturaUrl(empresa.assinatura_digital_url || null);
  }, [empresa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      razao_social: razaoSocial, cnpj, inscricao_estadual: inscricaoEstadual,
      inscricao_municipal: inscricaoMunicipal, cnae, contato_telefone: telefone,
      contato_email: email, endereco, responsavel_tecnico: responsavelTecnico,
      registro_crea: registroCrea, logo_url: logoUrl, assinatura_digital_url: assinaturaUrl
    });
  };

  const tabs = [
    { id: 'fiscais' as TabType, label: 'Identidade & Fiscais', icon: FileText },
    { id: 'contato' as TabType, label: 'Contato & Endereço', icon: MapPin },
    { id: 'tecnica' as TabType, label: 'Responsabilidade Técnica', icon: Award },
    { id: 'integracoes' as TabType, label: 'Integrações (Drive)', icon: Cloud },
    { id: 'usuarios' as TabType, label: 'Usuários & RBAC', icon: Users }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-5 pb-3 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Configuração Cadastral Corporativa</h3>
          <p className="text-xs text-gray-500">Logomarca corporativa, dados fiscais e técnicos para emissão de relatórios, propostas e laudos.</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-gray-50/50 px-6 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                isActive ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /><span>Dados e logomarca da empresa atualizados com sucesso!</span>
          </div>
        )}

        {activeTab === 'fiscais' && (
          <EmpresaFiscalTab
            razaoSocial={razaoSocial} setRazaoSocial={setRazaoSocial} cnpj={cnpj} setCnpj={setCnpj}
            inscricaoEstadual={inscricaoEstadual} setInscricaoEstadual={setInscricaoEstadual}
            inscricaoMunicipal={inscricaoMunicipal} setInscricaoMunicipal={setInscricaoMunicipal}
            cnae={cnae} setCnae={setCnae} logoUrl={logoUrl} setLogoUrl={setLogoUrl}
          />
        )}
        {activeTab === 'contato' && (
          <EmpresaContatoTab
            telefone={telefone} setTelefone={setTelefone} email={email} setEmail={setEmail}
            endereco={endereco} setEndereco={setEndereco}
          />
        )}
        {activeTab === 'tecnica' && (
          <EmpresaTecnicoTab
            responsavelTecnico={responsavelTecnico} setResponsavelTecnico={setResponsavelTecnico}
            registroCrea={registroCrea} setRegistroCrea={setRegistroCrea}
            assinaturaUrl={assinaturaUrl} setAssinaturaUrl={setAssinaturaUrl}
          />
        )}
        {activeTab === 'integracoes' && <MinhaEmpresaIntegracoesTab tenantId={empresa?.id} />}
        {activeTab === 'usuarios' && <EmpresaUsuariosTab tenantId={empresa?.id} />}
      </div>

      {activeTab !== 'integracoes' && activeTab !== 'usuarios' && (
        <div className="flex items-center justify-between p-4 px-6 bg-gray-50 border-t border-gray-100">
          <span className="text-[11px] text-gray-500">Alterações salvas refletem imediatamente nos relatórios e boletins (PDF)</span>
          <button
            type="submit" disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando Configurações...' : 'Salvar Configurações'}</span>
          </button>
        </div>
      )}
    </form>
  );
};
