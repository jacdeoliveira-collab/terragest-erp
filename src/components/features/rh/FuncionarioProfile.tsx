import React, { useState } from 'react';
import { User, Shield, Phone, MapPin, FileText, Calendar, DollarSign, Edit } from 'lucide-react';
import { EpiManager } from './EpiManager';
import { AcessoColaboradorCard } from './AcessoColaboradorCard';
import type { Funcionario, StatusConviteAcesso } from '../../../types/rh.types';

interface FuncionarioProfileProps {
  funcionario: Funcionario;
  onClose: () => void;
  onUpdateFuncionario?: (id: string, payload: Partial<Funcionario>) => void;
  onEditar?: (f: Funcionario) => void;
}

export const FuncionarioProfile: React.FC<FuncionarioProfileProps> = ({
  funcionario,
  onClose,
  onUpdateFuncionario,
  onEditar
}) => {
  const [activeTab, setActiveTab] = useState<'cadastrais' | 'epis'>('cadastrais');

  const cnhVencida = (funcionario.vencimento_cnh || funcionario.validade_cnh || '') < new Date().toISOString().slice(0, 10);
  const asoVencido = (funcionario.vencimento_aso || funcionario.aso_validade || '') < new Date().toISOString().slice(0, 10);

  const handleUpdateStatusAcesso = (novoStatus: StatusConviteAcesso, email: string) => {
    if (onUpdateFuncionario) {
      onUpdateFuncionario(funcionario.id, { status_convite: novoStatus, email_acesso: email });
    }
  };

  return (
    <div className="space-y-4 text-xs text-left">
      <div className="flex border-b border-gray-200 gap-2 pb-1">
        <button
          type="button" onClick={() => setActiveTab('cadastrais')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'cadastrais' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="w-3.5 h-3.5" /><span>Dados Cadastrais & Acesso</span>
        </button>
        <button
          type="button" onClick={() => setActiveTab('epis')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            activeTab === 'epis' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /><span>Gestão de EPIs (NR-6)</span>
        </button>
      </div>

      {activeTab === 'cadastrais' ? (
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{funcionario.nome}</h3>
              <p className="text-[11px] text-gray-500">{funcionario.cargo.replace('_', ' ')} • Status: {funcionario.status}</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${funcionario.status === 'ATIVO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
              {funcionario.status}
            </span>
          </div>

          <AcessoColaboradorCard funcionario={funcionario} onUpdateStatus={handleUpdateStatusAcesso} />

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1.5">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />Documentação Geral
              </span>
              <p className="text-gray-600">CPF: <span className="font-mono text-gray-900 font-semibold">{funcionario.cpf || '-'}</span></p>
              <p className="text-gray-600">RG: <span className="font-mono text-gray-900">{funcionario.rg || '-'}</span></p>
              <p className="text-gray-600">CTPS: <span className="font-mono text-gray-900">{funcionario.ctps || '-'}</span></p>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1.5">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />Validades Críticas (SST)
              </span>
              <p className="text-gray-600">
                CNH: <span className="font-mono">{funcionario.cnh || '-'}</span> | Venc: 
                <span className={`font-mono font-semibold ml-1 ${cnhVencida ? 'text-rose-600' : 'text-gray-900'}`}>{funcionario.vencimento_cnh || funcionario.validade_cnh || '-'}</span>
              </p>
              <p className="text-gray-600">
                ASO: <span className={`font-mono font-semibold ml-1 ${asoVencido ? 'text-rose-600' : 'text-gray-900'}`}>{funcionario.vencimento_aso || funcionario.aso_validade || '-'}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-gray-200 rounded-xl space-y-1">
              <span className="font-bold text-gray-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />Contato
              </span>
              <p className="text-gray-600">Telefone: <span className="text-gray-900">{funcionario.telefone || '-'}</span></p>
              <p className="text-gray-600 flex items-start gap-1">
                <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                <span className="truncate">{funcionario.endereco_completo || 'Sem endereço'}</span>
              </p>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  {funcionario.custo_hora_normal && (!funcionario.salario_base || funcionario.salario_base === 0) ? 'Remuneração (Horista)' : 'Salário'}
                </span>
                {funcionario.custo_hora_normal && (!funcionario.salario_base || funcionario.salario_base === 0) ? (
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    R$ {Number(funcionario.custo_hora_normal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / hora
                  </span>
                ) : (
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    R$ {Number(funcionario.salario_base || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EpiManager funcionario={funcionario} />
      )}

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        {onEditar && (
          <button
            type="button"
            onClick={() => onEditar(funcionario)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl font-semibold cursor-pointer text-xs"
          >
            <Edit className="w-3.5 h-3.5" /><span>Editar Cadastro & Salário</span>
          </button>
        )}
        <button type="button" onClick={onClose} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer ml-auto">
          Fechar
        </button>
      </div>
    </div>
  );
};
