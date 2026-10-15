import React, { useState, useEffect } from 'react';
import { Modal } from '../../../ui/Modal';
import { useEquipments } from '../../../../hooks/useEquipments';
import { useObras } from '../../../../hooks/useObras';
import { useServicosHorimetro } from '../../../../hooks/useServicosHorimetro';
import { AbastecimentoEditFields } from './AbastecimentoEditFields';
import { AbastecimentoEditVinculoFields } from './AbastecimentoEditVinculoFields';
import type { AbastecimentoItem, TipoCombustivel } from '../../../../types/abastecimento.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  abastecimento: AbastecimentoItem | null;
  onSalvar: (id: string, updates: Partial<AbastecimentoItem>) => Promise<{ success: boolean; error?: string }>;
}

export const AbastecimentoEditModal: React.FC<Props> = ({ isOpen, onClose, abastecimento, onSalvar }) => {
  const { data: equipments } = useEquipments();
  const { obras } = useObras();
  const { servicos } = useServicosHorimetro();

  const [maquinaId, setMaquinaId] = useState('');
  const [data, setData] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState<TipoCombustivel>('DIESEL_S10');
  const [horimetro, setHorimetro] = useState<number>(0);
  const [litros, setLitros] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [postoFornecedor, setPostoFornecedor] = useState('');
  const [obraId, setObraId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [fotoComprovante, setFotoComprovante] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (abastecimento) {
      setMaquinaId(abastecimento.maquina_id || '');
      setData(abastecimento.data || '');
      setTipoCombustivel(abastecimento.tipo_combustivel || 'DIESEL_S10');
      setHorimetro(Number(abastecimento.horimetro_momento) || 0);
      setLitros(Number(abastecimento.quantidade_litros) || 0);
      setValorTotal(Number(abastecimento.valor_total) || 0);
      setPostoFornecedor(abastecimento.posto_fornecedor || '');
      setObraId(abastecimento.obra_id || '');
      setServicoId(abastecimento.servico_id || '');
      setFotoComprovante(abastecimento.foto_comprovante || undefined);
      setError(null);
    }
  }, [abastecimento]);

  if (!abastecimento) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maquinaId) return setError('Selecione um equipamento.');
    if (litros <= 0) return setError('Informe a quantidade de litros.');

    try {
      setIsSaving(true);
      setError(null);
      const srv = servicos.find((s) => s.id === servicoId);
      const res = await onSalvar(abastecimento.id, {
        maquina_id: maquinaId,
        data,
        tipo_combustivel: tipoCombustivel,
        horimetro_momento: horimetro,
        quantidade_litros: litros,
        valor_total: valorTotal,
        posto_fornecedor: postoFornecedor,
        obra_id: obraId || srv?.obra_id || undefined,
        servico_id: servicoId || undefined,
        cliente_id: srv?.cliente_id || undefined,
        cliente_nome: srv?.cliente_nome || undefined,
        foto_comprovante: fotoComprovante || undefined
      });

      if (!res.success) throw new Error(res.error || 'Falha ao salvar');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl" title="Editar Registro de Abastecimento">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left max-h-[82vh] overflow-y-auto pr-1">
        {error && <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">{error}</div>}

        <AbastecimentoEditFields
          equipments={equipments} maquinaId={maquinaId} setMaquinaId={setMaquinaId}
          data={data} setData={setData} tipoCombustivel={tipoCombustivel} setTipoCombustivel={setTipoCombustivel}
          horimetro={horimetro} setHorimetro={setHorimetro} litros={litros} setLitros={setLitros}
          valorTotal={valorTotal} setValorTotal={setValorTotal} postoFornecedor={postoFornecedor} setPostoFornecedor={setPostoFornecedor}
        />

        <AbastecimentoEditVinculoFields
          obraId={obraId} setObraId={setObraId} servicoId={servicoId} setServicoId={setServicoId}
          fotoComprovante={fotoComprovante} setFotoComprovante={setFotoComprovante} obras={obras} servicos={servicos}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">
            Cancelar
          </button>
          <button type="submit" disabled={isSaving} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 shadow-sm">
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
