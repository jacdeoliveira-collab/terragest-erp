import React from 'react';
import { AlertCircle, User, FileCheck, DollarSign } from 'lucide-react';
import type { Funcionario } from '../../../types/rh.types';
import { DadosPessoais } from './form/DadosPessoais';
import { DadosDocumentais } from './form/DadosDocumentais';
import { DadosFinanceiros } from './form/DadosFinanceiros';
import { useColaboradorFormState } from './form/useColaboradorFormState';

interface ColaboradorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  funcionarioParaEditar?: Funcionario | null;
  onUpdateFuncionario?: (id: string, payload: Partial<Funcionario>) => Promise<{ success: boolean; error?: string }>;
}

export const ColaboradorForm: React.FC<ColaboradorFormProps> = ({
  onSuccess,
  onCancel,
  funcionarioParaEditar,
  onUpdateFuncionario
}) => {
  const form = useColaboradorFormState({ funcionarioParaEditar, onSuccess, onUpdateFuncionario });

  const tabs = [
    { id: 'pessoais' as const, label: 'Dados Pessoais', icon: User },
    { id: 'documentais' as const, label: 'Blindagem Legal & CNH', icon: FileCheck },
    { id: 'financeiros' as const, label: 'Folha & Remuneração', icon: DollarSign }
  ];

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4 text-left text-xs">
      {form.error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{form.error}</span>
        </div>
      )}

      <div className="flex border-b border-gray-200 gap-2 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = form.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => form.setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {form.activeTab === 'pessoais' && (
        <DadosPessoais
          nome={form.nome} setNome={form.setNome} cargo={form.cargo} setCargo={form.setCargo}
          status={form.status} setStatus={form.setStatus} telefone={form.telefone} setTelefone={form.setTelefone}
          enderecoCompleto={form.enderecoCompleto} setEnderecoCompleto={form.setEnderecoCompleto}
          pinAssinatura={form.pinAssinatura} setPinAssinatura={form.setPinAssinatura}
        />
      )}

      {form.activeTab === 'documentais' && (
        <DadosDocumentais
          cpf={form.cpf} setCpf={form.setCpf} rg={form.rg} setRg={form.setRg}
          cnh={form.cnh} setCnh={form.setCnh} validadeCnh={form.validadeCnh} setValidadeCnh={form.setValidadeCnh}
          ctps={form.ctps} setCtps={form.setCtps} pisPasep={form.pisPasep} setPisPasep={form.setPisPasep}
          tituloEleitor={form.tituloEleitor} setTituloEleitor={form.setTituloEleitor}
          reservista={form.reservista} setReservista={form.setReservista}
          asoValidade={form.asoValidade} setAsoValidade={form.setAsoValidade}
          arquivoDocumento={form.arquivoDocumento} setArquivoDocumento={form.setArquivoDocumento}
          driveUrlDocumentos={form.driveUrlDocumentos}
        />
      )}

      {form.activeTab === 'financeiros' && (
        <DadosFinanceiros
          salarioBase={form.salarioBase} setSalarioBase={form.setSalarioBase}
          custoHoraNormal={form.custoHoraNormal} setCustoHoraNormal={form.setCustoHoraNormal}
          valorHoraExtra={form.valorHoraExtra} setValorHoraExtra={form.setValorHoraExtra}
          limiteHorasDiario={form.limiteHorasDiario} setLimiteHorasDiario={form.setLimiteHorasDiario}
          diaPagamento={form.diaPagamento} setDiaPagamento={form.setDiaPagamento}
          diaFechamento={form.diaFechamento} setDiaFechamento={form.setDiaFechamento}
        />
      )}

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={form.isSubmitting || form.uploadingDrive}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer"
        >
          {form.uploadingDrive
            ? 'Enviando ao Drive...'
            : form.isSubmitting
            ? 'Salvando...'
            : form.isEdicao
            ? 'Salvar Alterações'
            : 'Cadastrar Colaborador'}
        </button>
      </div>
    </form>
  );
};

export const FuncionarioForm = ColaboradorForm;
