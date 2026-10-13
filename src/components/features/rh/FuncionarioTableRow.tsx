import React from 'react';
import { AlertTriangle, Clock, Eye, Edit3, UserX, ShieldCheck, Key } from 'lucide-react';
import type { Funcionario } from '../../../types/rh.types';

interface FuncionarioTableRowProps {
  item: Funcionario;
  hoje: string;
  dataLimite30Dias: string;
  onVerPerfil: (f: Funcionario) => void;
  onVerHistorico?: (f: Funcionario) => void;
  onEditar: (f: Funcionario) => void;
  onVerCompliance?: (f: Funcionario) => void;
  onConfigurarPin?: (f: Funcionario) => void;
  onInativar: (id: string, novoStatus: 'ATIVO' | 'INATIVO') => void;
}

const renderStatusValidade = (dataStr?: string, hojeStr: string = '', limiteStr: string = '') => {
  if (!dataStr) return <span className="text-gray-400 font-mono">-</span>;
  if (dataStr < hojeStr) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
        <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
        {dataStr} <span className="text-[9px] uppercase">(Vencido)</span>
      </span>
    );
  }
  if (dataStr <= limiteStr) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
        {dataStr} <span className="text-[9px] uppercase">(30d)</span>
      </span>
    );
  }
  return <span className="font-mono text-gray-700 text-[11px]">{dataStr}</span>;
};

export const FuncionarioTableRow: React.FC<FuncionarioTableRowProps> = ({
  item,
  hoje,
  dataLimite30Dias,
  onVerPerfil,
  onVerHistorico,
  onEditar,
  onVerCompliance,
  onConfigurarPin,
  onInativar
}) => {
  const isAtivo = item.status === 'ATIVO';
  const cnhData = item.vencimento_cnh || item.validade_cnh;
  const asoData = item.vencimento_aso || item.aso_validade;

  return (
    <tr className="hover:bg-gray-50/60 transition-colors text-xs">
      <td className="p-3 font-semibold text-gray-900">
        <div>
          {onVerHistorico ? (
            <button
              type="button"
              onClick={() => onVerHistorico(item)}
              className="text-left font-bold text-gray-900 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
              title="Clique para ver o histórico de produção e máquinas operadas"
            >
              <span>{item.nome}</span>
            </button>
          ) : (
            <span>{item.nome}</span>
          )}
          <span className="block text-[10px] text-gray-400 font-mono">
            CPF: {item.cpf || item.registro_documento || '-'}
          </span>
        </div>
      </td>
      <td className="p-3 text-gray-600">{item.cargo.replace('_', ' ')}</td>
      <td className="p-3">{renderStatusValidade(cnhData, hoje, dataLimite30Dias)}</td>
      <td className="p-3">{renderStatusValidade(asoData, hoje, dataLimite30Dias)}</td>
      <td className="p-3 text-center">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isAtivo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
          {item.status}
        </span>
      </td>
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {onVerHistorico && (
            <button
              onClick={() => onVerHistorico(item)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer"
              title="Histórico de Produção & Horímetros"
            >
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Produção</span>
            </button>
          )}
          <button
            onClick={() => onVerPerfil(item)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
            title="Ver Perfil e EPIs"
          >
            <Eye className="w-3 h-3 text-slate-500" />
            <span>Perfil</span>
          </button>
          <button
            onClick={() => onEditar(item)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold cursor-pointer"
            title="Editar Colaborador"
          >
            <Edit3 className="w-3 h-3 text-amber-600" />
            <span>Editar</span>
          </button>
          {onVerCompliance && (
            <button
              onClick={() => onVerCompliance(item)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-[11px] font-semibold cursor-pointer"
              title="Compliance e Anexos (Drive)"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Anexos</span>
            </button>
          )}
          {onConfigurarPin && (
            <button
              onClick={() => onConfigurarPin(item)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-semibold cursor-pointer"
              title="Configurar PIN de Assinatura"
            >
              <Key className="w-3 h-3 text-purple-600" />
              <span>PIN</span>
            </button>
          )}
          <button
            onClick={() => onInativar(item.id, isAtivo ? 'INATIVO' : 'ATIVO')}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${isAtivo ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'}`}
            title={isAtivo ? 'Inativar Colaborador (não deleta)' : 'Reativar Colaborador'}
          >
            {isAtivo ? <UserX className="w-3 h-3 text-rose-500" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
            <span>{isAtivo ? 'Inativar' : 'Ativar'}</span>
          </button>
        </div>
      </td>
    </tr>
  );
};
