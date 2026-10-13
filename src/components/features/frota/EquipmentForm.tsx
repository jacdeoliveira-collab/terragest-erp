import React, { useState } from 'react';
import { AlertCircle, Wrench, ShieldCheck, DollarSign, FolderCheck, CalendarClock } from 'lucide-react';
import { useEquipmentFormState } from './form/useEquipmentFormState';
import { DadosPrincipaisMaquina } from './form/DadosPrincipaisMaquina';
import { DadosPatrimonioMaquina } from './form/DadosPatrimonioMaquina';
import { DadosDocumentaisMaquina } from './form/DadosDocumentaisMaquina';
import { PlanoRevisaoMaquina } from './form/PlanoRevisaoMaquina';
import { EquipmentComplianceTab } from './EquipmentComplianceTab';
import type { Equipment } from '../../../types/equipment.types';

interface EquipmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  equipamentoId?: string;
  equipmentParaEditar?: Equipment | null;
}

type TabType = 'tecnicos' | 'revisao' | 'patrimonio' | 'documentais' | 'compliance';

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  onSuccess,
  onCancel,
  equipamentoId,
  equipmentParaEditar
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tecnicos');
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const { state, setters, isSubmitting, uploadingDrive, error, handleSubmit, isEdicao } = useEquipmentFormState(onSuccess, equipmentParaEditar);

  const tabs = [
    { id: 'tecnicos' as TabType, label: 'Dados Técnicos', icon: Wrench },
    ...(isEdicao ? [] : [{ id: 'revisao' as TabType, label: 'Revisões *', icon: CalendarClock }]),
    { id: 'patrimonio' as TabType, label: 'Patrimônio & Contrato', icon: DollarSign },
    { id: 'documentais' as TabType, label: 'Chassi & NR-12', icon: ShieldCheck },
    { id: 'compliance' as TabType, label: 'Compliance / Anexos', icon: FolderCheck }
  ];

  const onSubmit = (e: React.FormEvent) => {
    if (!isEdicao && !(state.intervaloRevisao > 0)) {
      e.preventDefault();
      setTentouSalvar(true);
      setActiveTab('revisao');
      return;
    }
    handleSubmit(e);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex border-b border-gray-200 gap-1 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[220px]">
        {activeTab === 'tecnicos' && (
          <DadosPrincipaisMaquina
            name={state.name} setName={setters.setName} code={state.code} setCode={setters.setCode}
            categoriaOpcao={state.categoriaOpcao} setCategoriaOpcao={setters.setCategoriaOpcao}
            marca={state.marca} setMarca={setters.setMarca} model={state.model} setModel={setters.setModel}
            serialNumber={state.serialNumber} setSerialNumber={setters.setSerialNumber}
            hourmeter={state.hourmeter} setHourmeter={setters.setHourmeter}
            potenciaHp={state.potenciaHp} setPotenciaHp={setters.setPotenciaHp}
            combustivelPadrao={state.combustivelPadrao} setCombustivelPadrao={setters.setCombustivelPadrao}
            capacidadeTanque={state.capacidadeTanque} setCapacidadeTanque={setters.setCapacidadeTanque}
          />
        )}
        {activeTab === 'revisao' && (
          <PlanoRevisaoMaquina
            isKm={state.unidadeKm}
            intervalo={state.intervaloRevisao} setIntervalo={setters.setIntervaloRevisao}
            descricao={state.descricaoRevisao} setDescricao={setters.setDescricaoRevisao}
            ultimaLeitura={state.ultimaRevisao} setUltimaLeitura={setters.setUltimaRevisao}
            mostrarErro={tentouSalvar}
          />
        )}
        {activeTab === 'patrimonio' && (
          <DadosPatrimonioMaquina
            placa={state.placa} setPlaca={setters.setPlaca}
            tipoPropriedade={state.tipoPropriedade} setTipoPropriedade={setters.setTipoPropriedade}
            fornecedorLocacao={state.fornecedorLocacao} setFornecedorLocacao={setters.setFornecedorLocacao}
            valorLocacaoMensal={state.valorLocacaoMensal} setValorLocacaoMensal={setters.setValorLocacaoMensal}
            valorAquisicao={state.valorAquisicao} setValorAquisicao={setters.setValorAquisicao}
            custoHoraEstimado={state.custoHoraEstimado} setCustoHoraEstimado={setters.setCustoHoraEstimado}
          />
        )}
        {activeTab === 'documentais' && (
          <DadosDocumentaisMaquina
            chassi={state.chassi} setChassi={setters.setChassi} renavam={state.renavam} setRenavam={setters.setRenavam}
            anoFabricacao={state.anoFabricacao} setAnoFabricacao={setters.setAnoFabricacao}
            laudoArtValidade={state.laudoArtValidade} setLaudoArtValidade={setters.setLaudoArtValidade}
            seguroApolice={state.seguroApolice} setSeguroApolice={setters.setSeguroApolice}
            seguroValidade={state.seguroValidade} setSeguroValidade={setters.setSeguroValidade}
            tagRastreador={state.tagRastreador} setTagRastreador={setters.setTagRastreador}
            arquivoFoto={state.arquivoFoto} setArquivoFoto={setters.setArquivoFoto} driveUrlFoto={state.driveUrlFoto}
          />
        )}
        {activeTab === 'compliance' && (
          <EquipmentComplianceTab equipamentoId={equipamentoId || equipmentParaEditar?.id} />
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting || uploadingDrive} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer transition-all">
          {uploadingDrive ? 'Enviando Foto...' : isSubmitting ? 'Salvando...' : isEdicao ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
        </button>
      </div>
    </form>
  );
};
