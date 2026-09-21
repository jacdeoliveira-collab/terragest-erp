import React, { useState } from 'react';
import { Wrench, FileText, FileSpreadsheet, Plus, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useManutencoes } from '../../../hooks/useManutencoes';
import { Modal } from '../../ui/Modal';
import { ManutencaoForm } from './ManutencaoForm';
import type { PlanoManutencaoItem } from '../../../types/manutencao.types';

export const ManutencaoList: React.FC = () => {
  const { data, isLoading, error, refetch } = useManutencoes();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">
        Carregando planos de manutenção preventiva...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Planos de Manutenção Preventiva</h2>
          <p className="text-xs text-gray-500">Controle de lubrificação, filtros e revisões periódicas da frota</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log('Exportar Manutenções PDF', data)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => console.log('Exportar Manutenções Excel', data)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Plano</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum plano de manutenção cadastrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">
            Cadastre os intervalos de troca de óleo e filtros para evitar paradas inesperadas no canteiro.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Plano</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Máquina</th>
                <th className="p-3.5">Serviço Programado</th>
                <th className="p-3.5 text-right">Intervalo</th>
                <th className="p-3.5 text-right">Último Feito</th>
                <th className="p-3.5 text-right">Próxima Revisão</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: PlanoManutencaoItem) => {
                const atrasado = item.status === 'ATRASADO';
                const proximo = item.status === 'PROXIMO_VENCIMENTO';

                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      {item.maquina_codigo || item.maquina_nome || '-'}
                    </td>
                    <td className="p-3.5 font-medium text-gray-900">{item.tipo_servico_nome}</td>
                    <td className="p-3.5 text-right font-mono text-gray-500">{item.intervalo_horas}h</td>
                    <td className="p-3.5 text-right font-mono text-gray-500">{item.ultimo_horimetro_realizado.toFixed(1)}h</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-800">
                      {item.proximo_horimetro_alvo?.toFixed(1)}h
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        atrasado
                          ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                          : proximo
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {atrasado ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        {atrasado ? 'REVISÃO ATRASADA' : proximo ? 'PRÓXIMO' : 'EM DIA'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Plano de Manutenção">
        <ManutencaoForm onSuccess={handleCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
