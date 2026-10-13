import React from 'react';
import { Modal } from '../../../ui/Modal';
import { AlertCircle, Receipt, CheckCircle2, RefreshCw } from 'lucide-react';
import { useEquipments } from '../../../../hooks/useEquipments';
import { useObras } from '../../../../hooks/useObras';
import { useServicosHorimetro } from '../../../../hooks/useServicosHorimetro';
import { CupomDadosGeraisSection } from './CupomDadosGeraisSection';
import { CupomItensCombustivelSection } from './CupomItensCombustivelSection';
import { useCupomUploadReader } from './useCupomUploadReader';
import { useCupomFormState } from './useCupomFormState';

interface CupomCombustivelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CupomCombustivelModal: React.FC<CupomCombustivelModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { data: equipments } = useEquipments({ onlyActives: true });
  const { obras } = useObras();
  const { servicos } = useServicosHorimetro();

  const form = useCupomFormState({
    equipments,
    onSuccess,
    onClose
  });

  const { fotoCupomUrl, uploadingFoto, mensagemSucesso, handleUploadFoto } = useCupomUploadReader({
    onDadosExtraidos: form.aplicarDadosExtraidos
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.salvar(fotoCupomUrl);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl" title="Lançamento Integrado de Cupom Fiscal (Combustível)">
      <form onSubmit={handleSubmit} className="space-y-3.5 text-left max-h-[80vh] overflow-y-auto pr-1">
        {uploadingFoto && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 shrink-0 text-blue-600 animate-spin" />
            <span>Processando imagem/PDF e lendo dados com QR Code e OCR local...</span>
          </div>
        )}

        {mensagemSucesso && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {form.erro && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{form.erro}</span>
          </div>
        )}

        <CupomDadosGeraisSection
          data={form.data} setData={form.setData}
          postoFornecedor={form.postoFornecedor} setPostoFornecedor={form.setPostoFornecedor}
          formaPagamento={form.formaPagamento} setFormaPagamento={form.setFormaPagamento}
          statusPagamento={form.statusPagamento} setStatusPagamento={form.setStatusPagamento}
          contaSaida={form.contaSaida} setContaSaida={form.setContaSaida}
          obraId={form.obraId} setObraId={form.setObraId}
          servicoId={form.servicoId} setServicoId={form.setServicoId}
          obras={obras} servicos={servicos} fotoCupomUrl={fotoCupomUrl}
          onUploadFoto={handleUploadFoto} uploadingFoto={uploadingFoto}
        />

        <CupomItensCombustivelSection
          equipments={equipments} maquinaId={form.maquinaId} setMaquinaId={form.setMaquinaId}
          horimetro={form.horimetro} setHorimetro={form.setHorimetro}
          tipoCombMaq={form.tipoCombMaq} setTipoCombMaq={form.setTipoCombMaq}
          litrosMaq={form.litrosMaq} setLitrosMaq={form.setLitrosMaq}
          valorMaq={form.valorMaq} setValorMaq={form.setValorMaq}
          incluirApoio={form.incluirApoio} setIncluirApoio={form.setIncluirApoio}
          veiculoApoioId={form.veiculoApoioId} setVeiculoApoioId={form.setVeiculoApoioId}
          kmApoio={form.kmApoio} setKmApoio={form.setKmApoio}
          tipoCombApoio={form.tipoCombApoio} setTipoCombApoio={form.setTipoCombApoio}
          litrosApoio={form.litrosApoio} setLitrosApoio={form.setLitrosApoio}
          valorApoio={form.valorApoio} setValorApoio={form.setValorApoio}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={form.salvando} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5">
            <Receipt className="w-4 h-4" />
            <span>{form.salvando ? 'Processando Lançamento...' : 'Lançar Cupom nos 3 Módulos'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
