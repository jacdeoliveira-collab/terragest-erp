import React, { useState } from 'react';
import { Plus, Shield, FileDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useEpis } from '../../../hooks/useEpis';
import { gerarFichaEpiPDF } from '../../../utils/epiPdfGenerator';
import type { Funcionario } from '../../../types/rh.types';

interface EpiManagerProps {
  funcionario: Funcionario;
}

export const EpiManager: React.FC<EpiManagerProps> = ({ funcionario }) => {
  const { epis, isLoading, error, registrarEpi } = useEpis(funcionario.id);
  const [descricao, setDescricao] = useState('');
  const [numeroCa, setNumeroCa] = useState('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [dataEntrega, setDataEntrega] = useState<string>(new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || !numeroCa.trim()) return;

    setSalvando(true);
    setFeedback(null);
    const res = await registrarEpi({
      funcionario_id: funcionario.id,
      descricao_equipamento: descricao.trim(),
      numero_ca: numeroCa.trim(),
      quantidade: Number(quantidade) || 1,
      data_entrega: dataEntrega,
      motivo: 'Entrega Operacional'
    });
    setSalvando(false);

    if (res.success) {
      setDescricao('');
      setNumeroCa('');
      setQuantidade(1);
      setFeedback('EPI registrado com sucesso!');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-4 text-xs text-left">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            Controle de Fornecimento de EPIs (NR-6)
          </h4>
          <p className="text-[11px] text-gray-500">Histórico de equipamentos com Certificado de Aprovação (C.A.)</p>
        </div>

        <button
          onClick={() => gerarFichaEpiPDF(funcionario, epis)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Ficha de EPI (PDF)</span>
        </button>
      </div>

      {feedback && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2.5">
        <span className="font-bold text-gray-800 block">Registrar Nova Entrega</span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Descrição do EPI *</label>
            <input required placeholder="Ex: Capacete com Jugular, Óculos de Proteção" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Nº C.A. *</label>
            <input required placeholder="Ex: 34158" value={numeroCa} onChange={(e) => setNumeroCa(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">Quantidade</label>
            <input type="number" min="1" required value={quantidade} onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold text-gray-600">Data de Entrega:</label>
            <input type="date" required value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs" />
          </div>
          <button type="submit" disabled={salvando} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>{salvando ? 'Salvando...' : 'Adicionar EPI'}</span>
          </button>
        </div>
      </form>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="p-2.5">Data</th>
              <th className="p-2.5">Equipamento Fornecido</th>
              <th className="p-2.5 font-mono">C.A.</th>
              <th className="p-2.5 text-center">Qtd</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-400">Carregando EPIs...</td></tr>
            ) : epis.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-400">Nenhum EPI entregue registrado para este colaborador.</td></tr>
            ) : (
              epis.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="p-2.5 font-mono">{item.data_entrega.split('-').reverse().join('/')}</td>
                  <td className="p-2.5 font-medium text-gray-800">{item.descricao_equipamento}</td>
                  <td className="p-2.5 font-mono text-emerald-700 font-semibold">{item.numero_ca}</td>
                  <td className="p-2.5 text-center font-mono">{item.quantidade}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
