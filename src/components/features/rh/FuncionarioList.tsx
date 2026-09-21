import React, { useState } from 'react';
import { Users, FileText, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { Modal } from '../../ui/Modal';
import { FuncionarioForm } from './FuncionarioForm';
import { FuncionarioTableRow } from './FuncionarioTableRow';
import type { Funcionario } from '../../../types/rh.types';

export const FuncionarioList: React.FC = () => {
  const { data, isLoading, error, refetch } = useFuncionarios();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hoje = new Date().toISOString().slice(0, 10);

  const handleCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">
        Carregando quadro de colaboradores...
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
          <h2 className="text-base font-bold text-gray-900">Quadro de Colaboradores</h2>
          <p className="text-xs text-gray-500">Operadores de máquinas pesadas, motoristas e mecânicos</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log('Exportar RH para PDF', data)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => console.log('Exportar RH para Excel', data)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum colaborador cadastrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-5">
            Cadastre os operadores e pilotos para vinculá-los aos boletins e checklists diários.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Colaborador</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Nome</th>
                <th className="p-3.5">Cargo</th>
                <th className="p-3.5">Documento</th>
                <th className="p-3.5">Validade</th>
                <th className="p-3.5 text-center">Ações / Docs</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: Funcionario) => (
                <FuncionarioTableRow key={item.id} item={item} hoje={hoje} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Colaborador">
        <FuncionarioForm onSuccess={handleCreated} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
