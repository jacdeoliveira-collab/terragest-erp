import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useCreateObra } from '../../../hooks/useCreateObra';
import type { StatusObra } from '../../../types/obras.types';

interface ObraFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ObraForm: React.FC<ObraFormProps> = ({ onSuccess, onCancel }) => {
  const { createObra, isSubmitting, error, limparErro } = useCreateObra();

  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<StatusObra>('ATIVA');
  const [cliente, setCliente] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    const result = await createObra({
      nome,
      localizacao,
      data_inicio: dataInicio,
      cliente,
      status
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Nome da Obra / Loteamento *</label>
        <input
          required
          placeholder="Ex: Terraplanagem Loteamento Sul"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Cliente / Incorporadora</label>
          <input
            placeholder="Ex: Construtora Horizonte"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Status do Canteiro *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusObra)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ATIVA">Ativa (Em Operação)</option>
            <option value="PARALISADA">Paralisada (Aguardando)</option>
            <option value="CONCLUIDA">Concluída (Entregue)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Localização / Bairro</label>
          <input
            placeholder="Ex: Setor Sul - Gleba 4"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Data de Início</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm"
        >
          {isSubmitting ? 'Salvando...' : 'Cadastrar Obra'}
        </button>
      </div>
    </form>
  );
};
