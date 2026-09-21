import React, { useState } from 'react';
import { AlertCircle, User, FileCheck, DollarSign } from 'lucide-react';
import { useCreateFuncionario } from '../../../hooks/useCreateFuncionario';
import type { CargoFuncionario, StatusFuncionario } from '../../../types/rh.types';
import { DadosPessoais } from './form/DadosPessoais';
import { DadosDocumentais } from './form/DadosDocumentais';
import { DadosFinanceiros } from './form/DadosFinanceiros';

import { uploadParaGoogleDrive } from '../../../services/driveService';

interface ColaboradorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ColaboradorForm: React.FC<ColaboradorFormProps> = ({ onSuccess, onCancel }) => {
  const { createFuncionario, isSubmitting, error, limparErro } = useCreateFuncionario();
  const [activeTab, setActiveTab] = useState<'pessoais' | 'documentais' | 'financeiros'>('pessoais');
  const [uploadingDrive, setUploadingDrive] = useState(false);

  // Estados dos dados
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState<CargoFuncionario>('OPERADOR_MAQUINA');
  const [status, setStatus] = useState<StatusFuncionario>('ATIVO');
  const [telefone, setTelefone] = useState('');
  const [enderecoCompleto, setEnderecoCompleto] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [cnh, setCnh] = useState('');
  const [validadeCnh, setValidadeCnh] = useState('');
  const [ctps, setCtps] = useState('');
  const [asoValidade, setAsoValidade] = useState('');
  const [arquivoDocumento, setArquivoDocumento] = useState<File | null>(null);
  const [driveUrlDocumentos, setDriveUrlDocumentos] = useState('');
  const [salarioBase, setSalarioBase] = useState<number>(3500);
  const [custoHoraNormal, setCustoHoraNormal] = useState<number>(25);
  const [valorHoraExtra, setValorHoraExtra] = useState<number>(37.5);
  const [limiteHorasDiario, setLimiteHorasDiario] = useState<number>(8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    let urlFinal = driveUrlDocumentos;
    if (arquivoDocumento) {
      setUploadingDrive(true);
      const uploadRes = await uploadParaGoogleDrive(arquivoDocumento, 'rh');
      setUploadingDrive(false);
      if (!uploadRes.sucesso || !uploadRes.driveUrl) {
        alert(`Erro no upload para o Google Drive: ${uploadRes.erro || 'Falha ao salvar arquivo'}`);
        return;
      }
      urlFinal = uploadRes.driveUrl;
      setDriveUrlDocumentos(urlFinal);
    }

    const res = await createFuncionario({
      nome, cargo, status,
      telefone: telefone || undefined,
      endereco_completo: enderecoCompleto || undefined,
      cpf: cpf || undefined, rg: rg || undefined,
      cnh: cnh || undefined, validade_cnh: validadeCnh || undefined,
      ctps: ctps || undefined, aso_validade: asoValidade || undefined,
      drive_url_documentos: urlFinal || undefined,
      salario_base: Number(salarioBase) || 0,
      custo_hora_normal: Number(custoHoraNormal) || 0,
      valor_hora_extra: Number(valorHoraExtra) || 0,
      limite_horas_diario: Number(limiteHorasDiario) || 8
    });
    if (res.success) onSuccess();
  };

  const tabs = [
    { id: 'pessoais' as const, label: 'Dados Pessoais', icon: User },
    { id: 'documentais' as const, label: 'Blindagem Legal & CNH', icon: FileCheck },
    { id: 'financeiros' as const, label: 'Folha & Banco de Horas', icon: DollarSign }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex border-b border-gray-200 gap-2 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'pessoais' && (
        <DadosPessoais
          nome={nome} setNome={setNome} cargo={cargo} setCargo={setCargo} status={status}
          setStatus={setStatus} telefone={telefone} setTelefone={setTelefone}
          enderecoCompleto={enderecoCompleto} setEnderecoCompleto={setEnderecoCompleto}
        />
      )}

      {activeTab === 'documentais' && (
        <DadosDocumentais
          cpf={cpf} setCpf={setCpf} rg={rg} setRg={setRg} cnh={cnh} setCnh={setCnh}
          validadeCnh={validadeCnh} setValidadeCnh={setValidadeCnh} ctps={ctps} setCtps={setCtps}
          asoValidade={asoValidade} setAsoValidade={setAsoValidade}
          arquivoDocumento={arquivoDocumento} setArquivoDocumento={setArquivoDocumento}
          driveUrlDocumentos={driveUrlDocumentos}
        />
      )}

      {activeTab === 'financeiros' && (
        <DadosFinanceiros
          salarioBase={salarioBase} setSalarioBase={setSalarioBase} custoHoraNormal={custoHoraNormal}
          setCustoHoraNormal={setCustoHoraNormal} valorHoraExtra={valorHoraExtra} setValorHoraExtra={setValorHoraExtra}
          limiteHorasDiario={limiteHorasDiario} setLimiteHorasDiario={setLimiteHorasDiario}
        />
      )}

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting || uploadingDrive} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
          {uploadingDrive ? 'Enviando ao Drive...' : isSubmitting ? 'Salvando...' : 'Cadastrar Colaborador'}
        </button>
      </div>
    </form>
  );
};

export const FuncionarioForm = ColaboradorForm;
