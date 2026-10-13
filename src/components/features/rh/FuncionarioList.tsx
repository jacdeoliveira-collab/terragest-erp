import React, { useState } from 'react';
import { Users, FileText, FileSpreadsheet, Plus, AlertCircle } from 'lucide-react';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { Modal } from '../../ui/Modal';
import { FuncionarioForm } from './FuncionarioForm';
import { FuncionarioTableRow } from './FuncionarioTableRow';
import { FuncionarioVisualizacaoModal } from './FuncionarioVisualizacaoModal';
import { FuncionarioHistoricoModal } from './historico/FuncionarioHistoricoModal';
import { DefinirPinModal } from './DefinirPinModal';
import type { Funcionario } from '../../../types/rh.types';
import { exportarFuncionariosPDF } from '../../../utils/exportCorporativoPdf';
import { exportToExcel } from '../../../services/exportExcel';

export const FuncionarioList: React.FC = () => {
  const { data, isLoading, error, refetch, inativarFuncionario, atualizarFuncionario, configurarPin } = useFuncionarios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colaboradorEdicao, setColaboradorEdicao] = useState<Funcionario | null>(null);
  const [colaboradorPerfil, setColaboradorPerfil] = useState<Funcionario | null>(null);
  const [colaboradorHistorico, setColaboradorHistorico] = useState<Funcionario | null>(null);
  const [modalTab, setModalTab] = useState<'perfil' | 'compliance'>('perfil');
  const [funcionarioPin, setFuncionarioPin] = useState<Funcionario | null>(null);

  const hoje = new Date().toISOString().slice(0, 10);
  const data30Dias = new Date();
  data30Dias.setDate(data30Dias.getDate() + 30);
  const dataLimite30Dias = data30Dias.toISOString().slice(0, 10);

  const handleSaved = () => { setIsModalOpen(false); setColaboradorEdicao(null); refetch(); };
  const handleNovo = () => { setColaboradorEdicao(null); setIsModalOpen(true); };
  const handleEditar = (item: Funcionario) => { setColaboradorEdicao(item); setIsModalOpen(true); };
  const handleInativar = (id: string, s: 'ATIVO' | 'INATIVO') => inativarFuncionario(id, s);

  if (isLoading) {
    return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">Carregando quadro de colaboradores...</div>;
  }
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-700 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" /><span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Quadro de Colaboradores & SST</h2>
          <p className="text-xs text-gray-500">Operadores, CNHs, ASOs (NR-7) e gestão de EPIs (NR-6)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportarFuncionariosPDF(data)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <FileText className="w-4 h-4 text-rose-600" /><span>PDF</span>
          </button>
          <button onClick={() => exportToExcel(data, 'Colaboradores_TerraGest')} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /><span>Excel</span>
          </button>
          <button onClick={handleNovo} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer ml-1">
            <Plus className="w-4 h-4" /><span>Novo Colaborador</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3"><Users className="w-6 h-6" /></div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum colaborador cadastrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-4">Cadastre os operadores e motoristas para controle de SST e remuneração.</p>
          <button onClick={handleNovo} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /><span>Novo Colaborador</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Colaborador</th><th className="p-3.5">Função</th><th className="p-3.5">Validade CNH</th><th className="p-3.5">Validade ASO</th>
                <th className="p-3.5 text-center">Status</th><th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((item: Funcionario) => (
                <FuncionarioTableRow
                  key={item.id} item={item} hoje={hoje} dataLimite30Dias={dataLimite30Dias}
                  onVerPerfil={(f) => { setColaboradorPerfil(f); setModalTab('perfil'); }}
                  onVerHistorico={(f) => setColaboradorHistorico(f)}
                  onEditar={handleEditar}
                  onVerCompliance={(f) => { setColaboradorPerfil(f); setModalTab('compliance'); }}
                  onConfigurarPin={setFuncionarioPin} onInativar={handleInativar}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setColaboradorEdicao(null); }} title={colaboradorEdicao ? `Editar Colaborador: ${colaboradorEdicao.nome}` : 'Cadastrar Novo Colaborador'}>
        <FuncionarioForm
          key={colaboradorEdicao?.id || 'novo'} funcionarioParaEditar={colaboradorEdicao}
          onUpdateFuncionario={atualizarFuncionario} onSuccess={handleSaved}
          onCancel={() => { setIsModalOpen(false); setColaboradorEdicao(null); }}
        />
      </Modal>

      <FuncionarioVisualizacaoModal
        isOpen={Boolean(colaboradorPerfil)} onClose={() => setColaboradorPerfil(null)}
        funcionario={colaboradorPerfil} initialTab={modalTab} onUpdateFuncionario={atualizarFuncionario}
        onEditar={(func) => { setColaboradorPerfil(null); handleEditar(func); }}
      />

      <FuncionarioHistoricoModal
        isOpen={Boolean(colaboradorHistorico)}
        onClose={() => setColaboradorHistorico(null)}
        funcionario={colaboradorHistorico}
        onEditar={(func) => { setColaboradorHistorico(null); handleEditar(func); }}
      />

      {funcionarioPin && (
        <DefinirPinModal
          isOpen={Boolean(funcionarioPin)} onClose={() => setFuncionarioPin(null)}
          funcionarioId={funcionarioPin.id} funcionarioNome={funcionarioPin.nome} onSalvarPin={configurarPin}
        />
      )}
    </div>
  );
};
