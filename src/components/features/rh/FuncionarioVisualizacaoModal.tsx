import React, { useState } from 'react';
import { User, ShieldCheck, Clock } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { FuncionarioProfile } from './FuncionarioProfile';
import { FuncionarioComplianceTab } from './FuncionarioComplianceTab';
import { FuncionarioProducaoTab } from './historico/FuncionarioProducaoTab';
import type { Funcionario } from '../../../types/rh.types';

interface FuncionarioVisualizacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario: Funcionario | null;
  initialTab?: 'perfil' | 'compliance' | 'producao';
  onUpdateFuncionario?: (id: string, payload: Partial<Funcionario>) => void;
  onEditar?: (f: Funcionario) => void;
}

export const FuncionarioVisualizacaoModal: React.FC<FuncionarioVisualizacaoModalProps> = ({
  isOpen,
  onClose,
  funcionario,
  initialTab = 'perfil',
  onUpdateFuncionario,
  onEditar
}) => {
  const [tab, setTab] = useState<'perfil' | 'compliance' | 'producao'>(initialTab);

  React.useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  if (!funcionario) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ficha do Colaborador: ${funcionario.nome}`} maxWidth="4xl">
      <div className="space-y-4 text-left">
        <div className="flex border-b border-gray-200 gap-1 pb-1">
          <button
            type="button"
            onClick={() => setTab('perfil')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'perfil' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className="w-3.5 h-3.5" /><span>Perfil & EPIs</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('producao')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'producao' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-600" /><span>Produção & Horas</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('compliance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'compliance' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /><span>Compliance & Documentos (Drive)</span>
          </button>
        </div>

        {tab === 'perfil' && (
          <FuncionarioProfile
            funcionario={funcionario}
            onClose={onClose}
            onUpdateFuncionario={onUpdateFuncionario}
            onEditar={onEditar}
          />
        )}
        {tab === 'producao' && (
          <FuncionarioProducaoTab funcionario={funcionario} />
        )}
        {tab === 'compliance' && (
          <FuncionarioComplianceTab funcionarioId={funcionario.id} />
        )}
      </div>
    </Modal>
  );
};
