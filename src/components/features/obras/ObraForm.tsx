import React, { useState } from 'react';
import { AlertCircle, FileText, MapPin, ShieldCheck, DollarSign, FolderCheck } from 'lucide-react';
import { useCreateObra } from '../../../hooks/useCreateObra';
import type { Obra, StatusObra } from '../../../types/obras.types';
import { ObraContratoTab } from './ObraContratoTab';
import { ObraLocalizacaoTab } from './ObraLocalizacaoTab';
import { ObraFiscalTab } from './ObraFiscalTab';
import { ObraFinanceiroTab } from './ObraFinanceiroTab';
import { ObraComplianceTab } from './ObraComplianceTab';

interface ObraFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  obraInicial?: Obra | null;
  obraId?: string;
}

type TabType = 'contrato' | 'localizacao' | 'fiscal' | 'financeiro' | 'compliance';

export const ObraForm: React.FC<ObraFormProps> = ({ onSuccess, onCancel, obraInicial, obraId }) => {
  const { createObra, isSubmitting, error, limparErro } = useCreateObra();
  const currentObraId = obraId || obraInicial?.id;

  const [activeTab, setActiveTab] = useState<TabType>('contrato');
  const [nome, setNome] = useState(obraInicial?.nome || '');
  const [clienteNome, setClienteNome] = useState(obraInicial?.cliente_nome || obraInicial?.cliente || '');
  const [clienteCnpj, setClienteCnpj] = useState(obraInicial?.cliente_cnpj || '');
  const [status, setStatus] = useState<StatusObra>(obraInicial?.status || 'EM_ANDAMENTO');
  const [enderecoCompleto, setEnderecoCompleto] = useState(obraInicial?.endereco_completo || obraInicial?.localizacao || '');
  const [dataInicio, setDataInicio] = useState(obraInicial?.data_inicio || new Date().toISOString().slice(0, 10));
  const [previsaoTermino, setPrevisaoTermino] = useState(obraInicial?.previsao_termino || '');
  const [cno, setCno] = useState(obraInicial?.cno || '');
  const [artCrea, setArtCrea] = useState(obraInicial?.art_crea || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    const result = await createObra({
      nome,
      cliente_nome: clienteNome,
      cliente: clienteNome,
      cliente_cnpj: clienteCnpj,
      status,
      endereco_completo: enderecoCompleto,
      localizacao: enderecoCompleto,
      data_inicio: dataInicio,
      previsao_termino: previsaoTermino || undefined,
      cno,
      art_crea: artCrea
    }, currentObraId);

    if (result.success) {
      onSuccess();
    }
  };

  const tabs = [
    { id: 'contrato' as TabType, label: 'Contrato', icon: FileText },
    { id: 'localizacao' as TabType, label: 'Localização', icon: MapPin },
    { id: 'fiscal' as TabType, label: 'Engenharia & CNO', icon: ShieldCheck },
    { id: 'financeiro' as TabType, label: 'Financeiro / DRE', icon: DollarSign },
    { id: 'compliance' as TabType, label: 'Compliance & Anexos', icon: FolderCheck }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex border-b border-gray-200 bg-gray-50/70 rounded-xl p-1 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isActive ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="py-1 min-h-[220px]">
        {activeTab === 'contrato' && (
          <ObraContratoTab
            nome={nome} setNome={setNome}
            clienteNome={clienteNome} setClienteNome={setClienteNome}
            clienteCnpj={clienteCnpj} setClienteCnpj={setClienteCnpj}
            status={status} setStatus={setStatus}
          />
        )}
        {activeTab === 'localizacao' && (
          <ObraLocalizacaoTab
            enderecoCompleto={enderecoCompleto} setEnderecoCompleto={setEnderecoCompleto}
            dataInicio={dataInicio} setDataInicio={setDataInicio}
            previsaoTermino={previsaoTermino} setPrevisaoTermino={setPrevisaoTermino}
          />
        )}
        {activeTab === 'fiscal' && (
          <ObraFiscalTab cno={cno} setCno={setCno} artCrea={artCrea} setArtCrea={setArtCrea} />
        )}
        {activeTab === 'financeiro' && (
          <ObraFinanceiroTab obraId={currentObraId} />
        )}
        {activeTab === 'compliance' && (
          <ObraComplianceTab obraId={currentObraId} />
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Obra'}
        </button>
      </div>
    </form>
  );
};
