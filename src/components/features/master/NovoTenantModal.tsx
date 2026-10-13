import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import type { CreateTenantDTO, TipoPlanoTenant } from '../../../types/tenant.types';

interface NovoTenantModalProps {
  onSave: (payload: CreateTenantDTO) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

const PRECOS_SUGERIDOS: Record<TipoPlanoTenant, number> = {
  START: 1200,
  PRO: 2400,
  ENTERPRISE: 4900
};

export const NovoTenantModal: React.FC<NovoTenantModalProps> = ({ onSave, onClose }) => {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [plano, setPlano] = useState<TipoPlanoTenant>('START');
  const [valorMensalidade, setValorMensalidade] = useState<number>(PRECOS_SUGERIDOS.START);
  const [adminEmail, setAdminEmail] = useState('');
  const [diaVencimento, setDiaVencimento] = useState<number>(10);
  const [mesesContrato, setMesesContrato] = useState<number>(12);
  const [slogan, setSlogan] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);

  const handlePlanoChange = (novoPlano: TipoPlanoTenant) => {
    setPlano(novoPlano);
    setValorMensalidade(PRECOS_SUGERIDOS[novoPlano] || 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !adminEmail.trim()) return;

    setSalvando(true);
    setFeedback(null);
    const hoje = new Date();
    const dataInicio = hoje.toISOString().slice(0, 10);
    const dataFimObj = new Date(hoje);
    dataFimObj.setMonth(dataFimObj.getMonth() + (Number(mesesContrato) || 12));

    const res = await onSave({
      nome: nome.trim(), cnpj: cnpj.trim() || undefined,
      slogan: slogan.trim() || undefined, logo_url: logoUrl.trim() || undefined,
      plano, valor_mensalidade: Number(valorMensalidade) || 0, plano_valor: Number(valorMensalidade) || 0,
      admin_email: adminEmail.trim(), contato_email: adminEmail.trim(),
      data_vencimento_fatura: Number(diaVencimento) || 10,
      limite_usuarios: plano === 'ENTERPRISE' ? 50 : plano === 'PRO' ? 20 : 5,
      status_conta: 'ativo', assinatura_inicio: dataInicio,
      assinatura_fim: dataFimObj.toISOString().slice(0, 10), meses_contrato: Number(mesesContrato) || 12
    });

    setSalvando(false);
    if (res.success) {
      setFeedback({ tipo: 'ok', msg: 'Construtora cadastrada com sucesso!' });
      setTimeout(() => onClose(), 1000);
    } else {
      setFeedback({ tipo: 'erro', msg: res.error || 'Erro ao cadastrar' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs text-left">
      {feedback && (
        <div className={`p-2.5 rounded-xl flex items-center gap-2 ${feedback.tipo === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {feedback.tipo === 'ok' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Razão Social / Nome da Construtora *</label>
        <input type="text" required placeholder="Ex: Construtora Horizonte Sul Ltda" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Plano de Assinatura *</label>
          <select value={plano} onChange={(e) => handlePlanoChange(e.target.value as TipoPlanoTenant)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-semibold cursor-pointer">
            <option value="START">Plano Start (Até 5 usuários)</option>
            <option value="PRO">Plano Pro (Até 20 usuários)</option>
            <option value="ENTERPRISE">Plano Enterprise (Ilimitado / 50+)</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Valor da Mensalidade (R$) *</label>
          <input type="number" step="0.01" min="0" required value={valorMensalidade} onChange={(e) => setValorMensalidade(parseFloat(e.target.value) || 0)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono font-bold" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">E-mail do Administrador *</label>
          <input type="email" required placeholder="admin@construtora.com.br" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900" />
          <span className="text-[10px] text-gray-400 block mt-0.5">Define a senha via link por e-mail ou no "Primeiro Acesso" da tela de login.</span>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Tempo de Contrato (Meses) *</label>
          <select value={mesesContrato} onChange={(e) => setMesesContrato(Number(e.target.value))} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-semibold cursor-pointer">
            <option value={1}>1 Mês (Mensal / Piloto)</option>
            <option value={3}>3 Meses (Trimestral)</option>
            <option value={6}>6 Meses (Semestral)</option>
            <option value={12}>12 Meses (Anual - Padrão)</option>
            <option value={24}>24 Meses (Bienal)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Dia Vencimento</label>
          <input type="number" min="1" max="31" value={diaVencimento} onChange={(e) => setDiaVencimento(parseInt(e.target.value) || 10)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">CNPJ</label>
          <input type="text" placeholder="00.000.000/0001-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono" />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Slogan</label>
          <input type="text" placeholder="Obras e Pavimentação" value={slogan} onChange={(e) => setSlogan(e.target.value)} className="w-full px-2 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900" />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">URL Logotipo White-Label</label>
        <input type="url" placeholder="https://exemplo.com/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono" />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onClose} className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={salvando || !nome.trim() || !adminEmail.trim()} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>{salvando ? 'Provisionando...' : 'Cadastrar Tenant'}</span>
        </button>
      </div>
    </form>
  );
};
