import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Building2, Calendar, Sprout } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import type { CentroCusto, CreateCentroCustoDTO, StatusCentroCusto } from '../../../types/centroCusto.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: CentroCusto | null;
  isSubmitting: boolean;
  onSave: (dto: CreateCentroCustoDTO, id?: string) => Promise<{ success: boolean; error?: string }>;
}

const getDefaultSafra = () => {
  const y = new Date().getFullYear();
  return `${y}/${y + 1}`;
};

export const CentroCustoFormModal: React.FC<Props> = ({ isOpen, onClose, initialData, isSubmitting, onSave }) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cliente, setCliente] = useState('');
  const [dataRegistro, setDataRegistro] = useState(hoje);
  const [anoSafra, setAnoSafra] = useState(getDefaultSafra());
  const [status, setStatus] = useState<StatusCentroCusto>('EM_ANDAMENTO');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNome(initialData.nome || '');
      setDescricao(initialData.descricao || initialData.localizacao || '');
      setCliente(initialData.cliente || initialData.cliente_nome || '');
      setDataRegistro(initialData.data_registro || initialData.data_inicio || hoje);
      setAnoSafra(initialData.ano_safra || getDefaultSafra());
      setStatus(initialData.status || 'EM_ANDAMENTO');
    } else {
      setNome('');
      setDescricao('');
      setCliente('');
      setDataRegistro(hoje);
      setAnoSafra(getDefaultSafra());
      setStatus('EM_ANDAMENTO');
    }
    setError(null);
  }, [initialData, isOpen, hoje]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !dataRegistro || !anoSafra.trim()) {
      setError('Preencha Nome, Data e Ano Safra.');
      return;
    }
    const res = await onSave({ nome, descricao, cliente, data_registro: dataRegistro, ano_safra: anoSafra, status }, initialData?.id);
    if (res.success) onClose();
    else setError(res.error || 'Erro ao salvar centro de custo');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}>
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-left">
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Nome do Centro de Custo *
          </label>
          <input type="text" required placeholder="Ex: Frente Terraplanagem Sul / Fazenda Santa Helena" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-medium" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Data *
            </label>
            <input type="date" required value={dataRegistro} onChange={(e) => setDataRegistro(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-amber-600" /> Ano Safra *
            </label>
            <input type="text" required placeholder="Ex: 2026/2027" value={anoSafra} onChange={(e) => setAnoSafra(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Descrição / Localização</label>
            <input type="text" placeholder="Ex: Setor 02 / Pátio / Cliente" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusCentroCusto)} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-semibold">
              <option value="EM_ANDAMENTO">Ativo / Em Andamento</option>
              <option value="PARALISADA">Pausado</option>
              <option value="CONCLUIDA">Encerrado</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50">
            <Check className="w-4 h-4" /><span>{isSubmitting ? 'Salvando...' : 'Salvar Centro de Custo'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
