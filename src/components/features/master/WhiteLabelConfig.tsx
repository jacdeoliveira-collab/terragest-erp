import React, { useState } from 'react';
import { Building2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import type { TenantMaster, UpdateTenantDTO } from '../../../types/tenant.types';

interface WhiteLabelConfigProps {
  tenant: TenantMaster;
  onSave: (id: string, payload: UpdateTenantDTO) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export const WhiteLabelConfig: React.FC<WhiteLabelConfigProps> = ({ tenant, onSave, onClose }) => {
  const [slogan, setSlogan] = useState(tenant.slogan || '');
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '');
  const [planoValor, setPlanoValor] = useState<number>(tenant.plano_valor || 0);
  const [assinaturaFim, setAssinaturaFim] = useState(tenant.assinatura_fim || '');
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setFeedback(null);

    const res = await onSave(tenant.id, {
      slogan: slogan.trim() || undefined,
      logo_url: logoUrl.trim() || undefined,
      plano_valor: Number(planoValor),
      assinatura_fim: assinaturaFim || undefined
    });

    setSalvando(false);
    if (res.success) {
      setFeedback({ tipo: 'ok', msg: 'Configurações atualizadas com sucesso!' });
      setTimeout(() => onClose(), 1200);
    } else {
      setFeedback({ tipo: 'erro', msg: res.error || 'Erro ao atualizar' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
      <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <span className="font-bold text-gray-900 block">{tenant.nome}</span>
          <span className="text-[11px] text-gray-500 font-mono">CNPJ: {tenant.cnpj || 'Não cadastrado'}</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 ${
            feedback.tipo === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.tipo === 'ok' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Valor Mensal (R$) *</label>
          <input
            type="number" step="0.01" required min="0" value={planoValor}
            onChange={(e) => setPlanoValor(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-900 font-bold"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Data Término do Contrato</label>
          <input
            type="date" value={assinaturaFim}
            onChange={(e) => setAssinaturaFim(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Slogan Personalizado da Empresa</label>
        <input
          type="text"
          placeholder="Ex: Terraplanagem, Pavimentação e Obras Pesadas"
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900"
        />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">URL do Logotipo da Empresa (White-Label)</label>
        <input
          type="url"
          placeholder="https://exemplo.com/logo-empresa.png"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono"
        />
        {logoUrl && (
          <div className="mt-2 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center gap-2">
            <span className="text-[10px] text-gray-400">Prévia:</span>
            <img src={logoUrl} alt="Logo preview" className="h-7 max-w-[120px] object-contain rounded" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{salvando ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>
    </form>
  );
};
