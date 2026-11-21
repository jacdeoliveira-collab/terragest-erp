import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import type { TenantMaster } from '../../../types/tenant.types';

interface ExcluirTenantModalProps {
  tenant: TenantMaster;
  onClose: () => void;
  onConfirm: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const ExcluirTenantModal: React.FC<ExcluirTenantModalProps> = ({
  tenant,
  onClose,
  onConfirm,
}) => {
  const [confirmacao, setConfirmacao] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const confirmado = confirmacao.trim().toUpperCase() === 'EXCLUIR';

  const handleExcluir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmado || excluindo) return;
    setExcluindo(true);
    setErro(null);
    const res = await onConfirm(tenant.id);
    if (res.success) {
      onClose();
    } else {
      setErro(res.error || 'Falha ao excluir assinante.');
      setExcluindo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#11161d] border border-rose-500/40 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-left">
        <div className="p-4 px-5 border-b border-[#21262d] flex items-center justify-between bg-rose-950/40">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm uppercase tracking-wide">Excluir Assinante Permanentemente</h3>
          </div>
          <button type="button" onClick={onClose} disabled={excluindo} className="p-1 text-gray-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleExcluir} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-1">
            <span className="text-[10px] text-gray-400 uppercase block">Empresa selecionada</span>
            <strong className="text-white text-sm block">{tenant.nome}</strong>
            <span className="text-[11px] font-mono text-gray-400">{tenant.cnpj || 'ISENTO'}</span>
          </div>

          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 leading-relaxed">
            Esta ação é <strong className="text-rose-400">irreversível</strong> e apagará completamente do banco de dados todas as obras, máquinas, BDEs, lançamentos financeiros, clientes, colaboradores, abastecimentos e usuários exclusivos deste assinante.
          </div>

          {erro && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">
              Digite <span className="font-mono text-rose-400">EXCLUIR</span> para confirmar:
            </label>
            <input
              type="text"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="EXCLUIR"
              autoComplete="off"
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] focus:border-rose-500 rounded-xl text-white font-mono text-xs outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#21262d]">
            <button type="button" onClick={onClose} disabled={excluindo} className="px-4 py-2 text-gray-400 hover:text-white font-semibold cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!confirmado || excluindo}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold rounded-xl cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{excluindo ? 'Excluindo tudo...' : 'Excluir Tudo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
