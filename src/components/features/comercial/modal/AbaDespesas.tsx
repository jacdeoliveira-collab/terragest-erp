import React from 'react';
import { Fuel, Truck, Camera, X } from 'lucide-react';
import { CombustivelCardItem } from './CombustivelCardItem';
import { AbastecimentosVinculadosSelector } from './AbastecimentosVinculadosSelector';
import { OperadorRemuneracaoCard } from './OperadorRemuneracaoCard';
import { PecasLubrificantesCard } from './PecasLubrificantesCard';
import { LogisticaDespesasCard } from './LogisticaDespesasCard';

interface AbaDespesasProps {
  combustivelMaquinaLitros: number; setCombustivelMaquinaLitros: (v: number) => void;
  combustivelMaquinaValor: number; setCombustivelMaquinaValor: (v: number) => void;
  combustivelApoioLitros: number; setCombustivelApoioLitros: (v: number) => void;
  combustivelApoioValor: number; setCombustivelApoioValor: (v: number) => void;
  combustivelTotalValor: number; fotoCupom: string | undefined; setFotoCupom: (v: string | undefined) => void;
  despesaOperador: number; setDespesaOperador: (v: number) => void;
  despesaApoio: number; setDespesaApoio: (v: number) => void;
  descricaoApoio: string; setDescricaoApoio: (v: string) => void;
  fornecedorApoio: string; setFornecedorApoio: (v: string) => void;
  formaPagamentoApoio: string; setFormaPagamentoApoio: (v: string) => void;
  statusPagamentoApoio: 'PAGO' | 'PENDENTE'; setStatusPagamentoApoio: (v: 'PAGO' | 'PENDENTE') => void;
  fotoCupomApoio?: string; setFotoCupomApoio: (v: string | undefined) => void;
  despesaManutencao: number; setDespesaManutencao: (v: number) => void;
  descricaoManutencao: string; setDescricaoManutencao: (v: string) => void;
  fornecedorManutencao: string; setFornecedorManutencao: (v: string) => void;
  formaPagamentoManutencao: string; setFormaPagamentoManutencao: (v: string) => void;
  statusPagamentoManutencao: 'PAGO' | 'PENDENTE'; setStatusPagamentoManutencao: (v: 'PAGO' | 'PENDENTE') => void;
  fotoCupomManutencao?: string; setFotoCupomManutencao: (v: string | undefined) => void;
  abastecimentosIds?: string[]; setAbastecimentosIds?: (ids: string[]) => void;
  uploadingImage: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, setter: (url: string) => void) => void;
  maquinaNome?: string; servicoId?: string; operadorNome?: string;
  horasTrabalhadas?: number; valorHoraOperador: number;
}

export const AbaDespesas: React.FC<AbaDespesasProps> = (props) => {
  return (
    <div className="space-y-4 text-xs text-left">
      <AbastecimentosVinculadosSelector
        maquinaNome={props.maquinaNome} servicoId={props.servicoId} abastecimentosIds={props.abastecimentosIds}
        onAplicar={(mL, mV, aL, aV, foto, ids) => {
          props.setCombustivelMaquinaLitros(mL); props.setCombustivelMaquinaValor(mV);
          props.setCombustivelApoioLitros(aL); props.setCombustivelApoioValor(aV);
          if (foto && !props.fotoCupom) props.setFotoCupom(foto);
          if (ids && props.setAbastecimentosIds) props.setAbastecimentosIds(ids);
        }}
      />

      <CombustivelCardItem
        titulo="1. Combustível da Máquina (Diesel S500 / Comum)" icon={Fuel}
        litros={props.combustivelMaquinaLitros} onChangeLitros={props.setCombustivelMaquinaLitros}
        valor={props.combustivelMaquinaValor} onChangeValor={props.setCombustivelMaquinaValor}
        placeholderLitros="0.00" placeholderValor="0.00"
        containerClass="bg-amber-50/70 border-amber-200" headerTextClass="text-amber-900" iconClass="text-amber-600"
      />

      <CombustivelCardItem
        titulo="2. Combustível de Apoio (Caminhonete Diesel S10)" icon={Truck}
        litros={props.combustivelApoioLitros} onChangeLitros={props.setCombustivelApoioLitros}
        valor={props.combustivelApoioValor} onChangeValor={props.setCombustivelApoioValor}
        placeholderLitros="0.00" placeholderValor="0.00"
        containerClass="bg-blue-50/70 border-blue-200" headerTextClass="text-blue-900" iconClass="text-blue-600"
      />

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-800 text-xs">Total do Combustível do Serviço:</span>
          <span className="font-mono text-sm font-black text-rose-700">
            R$ {props.combustivelTotalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 hover:border-amber-500 bg-white rounded-lg cursor-pointer transition-all">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] text-gray-600">
              {props.uploadingImage === 'cupom' ? 'Enviando...' : 'Anexar Cupom Fiscal / Comprovante de Diesel'}
            </span>
            <input type="file" accept="image/*,application/pdf" disabled={props.uploadingImage !== null} className="hidden" onChange={(e) => props.handleImageUpload(e, 'cupom', props.setFotoCupom)} />
          </label>
          {props.fotoCupom && (
            <button type="button" onClick={() => props.setFotoCupom(undefined)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <OperadorRemuneracaoCard
        operadorNome={props.operadorNome || ''} horasTrabalhadas={props.horasTrabalhadas || 0}
        valorHoraOperador={props.valorHoraOperador} despesaOperador={props.despesaOperador}
        setDespesaOperador={props.setDespesaOperador}
      />

      <PecasLubrificantesCard
        valor={props.despesaManutencao} onChangeValor={props.setDespesaManutencao}
        descricao={props.descricaoManutencao} onChangeDescricao={props.setDescricaoManutencao}
        fornecedor={props.fornecedorManutencao} onChangeFornecedor={props.setFornecedorManutencao}
        formaPagamento={props.formaPagamentoManutencao} onChangeFormaPagamento={props.setFormaPagamentoManutencao}
        statusPagamento={props.statusPagamentoManutencao} onChangeStatusPagamento={props.setStatusPagamentoManutencao}
        comprovanteUrl={props.fotoCupomManutencao}
        onUploadComprovante={(e) => props.handleImageUpload(e, 'cupom_manut', props.setFotoCupomManutencao)}
        onRemoverComprovante={() => props.setFotoCupomManutencao(undefined)}
        uploading={props.uploadingImage === 'cupom_manut'}
      />

      <LogisticaDespesasCard
        valor={props.despesaApoio} onChangeValor={props.setDespesaApoio}
        descricao={props.descricaoApoio} onChangeDescricao={props.setDescricaoApoio}
        fornecedor={props.fornecedorApoio} onChangeFornecedor={props.setFornecedorApoio}
        formaPagamento={props.formaPagamentoApoio} onChangeFormaPagamento={props.setFormaPagamentoApoio}
        statusPagamento={props.statusPagamentoApoio} onChangeStatusPagamento={props.setStatusPagamentoApoio}
        comprovanteUrl={props.fotoCupomApoio}
        onUploadComprovante={(e) => props.handleImageUpload(e, 'cupom_apoio', props.setFotoCupomApoio)}
        onRemoverComprovante={() => props.setFotoCupomApoio(undefined)}
        uploading={props.uploadingImage === 'cupom_apoio'}
      />
    </div>
  );
};
