import React, { useState, useMemo } from 'react';
import { Users, Plus, AlertCircle } from 'lucide-react';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { FuncionarioTableRow } from './FuncionarioTableRow';
import { FuncionarioModalsContainer } from './FuncionarioModalsContainer';
import { ListFilterBar, type OpcaoStatus } from '../../common/ListFilterBar';
import type { Funcionario } from '../../../types/rh.types';
import { exportarFuncionariosPDF } from '../../../utils/exportCorporativoPdf';
import { exportarFuncionariosExcel } from '../../../services/exportExcel';

const OPCOES_STATUS_RH: OpcaoStatus[] = [
  { valor: 'TODOS', label: 'Todos os Status' },
  { valor: 'ATIVO', label: 'Ativos', cor: 'emerald' },
  { valor: 'INATIVO', label: 'Inativos', cor: 'slate' }
];

export const FuncionarioList: React.FC = () => {
  const { data, isLoading, error, refetch, inativarFuncionario, atualizarFuncionario, configurarPin } = useFuncionarios();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colaboradorEdicao, setColaboradorEdicao] = useState<Funcionario | null>(null);
  const [colaboradorPerfil, setColaboradorPerfil] = useState<Funcionario | null>(null);
  const [colaboradorHistorico, setColaboradorHistorico] = useState<Funcionario | null>(null);
  const [modalTab, setModalTab] = useState<'perfil' | 'compliance'>('perfil');
  const [funcionarioPin, setFuncionarioPin] = useState<Funcionario | null>(null);

  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('TODOS');

  const hoje = new Date().toISOString().slice(0, 10);
  const data30Dias = new Date();
  data30Dias.setDate(data30Dias.getDate() + 30);
  const dataLimite30Dias = data30Dias.toISOString().slice(0, 10);

  const dadosFiltrados = useMemo(() => {
    return data.filter((item: Funcionario) => {
      if (statusFiltro !== 'TODOS' && item.status !== statusFiltro) return false;
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const nome = (item.nome || '').toLowerCase();
        const cargo = (item.cargo || '').toLowerCase();
        const cpf = (item.cpf || '').toLowerCase();
        const tel = (item.telefone || '').toLowerCase();
        if (!nome.includes(termo) && !cargo.includes(termo) && !cpf.includes(termo) && !tel.includes(termo)) {
          return false;
        }
      }
      return true;
    });
  }, [data, busca, statusFiltro]);

  const handleSaved = () => { setIsModalOpen(false); setColaboradorEdicao(null); refetch(); };
  const handleNovo = () => { setColaboradorEdicao(null); setIsModalOpen(true); };
  const handleEditar = (item: Funcionario) => { setColaboradorEdicao(item); setIsModalOpen(true); };
  const handleInativar = (id: string, s: 'ATIVO' | 'INATIVO') => inativarFuncionario(id, s);

  if (isLoading) return <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-sm text-gray-400">Carregando quadro de colaboradores...</div>;
  if (error) return <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-sm text-rose-700 flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0 text-rose-500" /><span>{error}</span></div>;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-left">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Quadro de Colaboradores & SST</h2>
          <p className="text-xs text-gray-500">Operadores, motoristas, CNHs, ASOs (NR-7) e gestão de EPIs (NR-6)</p>
        </div>
        <button onClick={handleNovo} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Novo Colaborador
        </button>
      </div>

      <ListFilterBar
        busca={busca}
        setBusca={setBusca}
        placeholderBusca="Buscar por nome, função/cargo, CPF, telefone..."
        statusFiltro={statusFiltro}
        setStatusFiltro={setStatusFiltro}
        opcoesStatus={OPCOES_STATUS_RH}
        onExportarPdf={() => exportarFuncionariosPDF(dadosFiltrados)}
        labelExportar="Exportar PDF"
        onExportarExcel={() => exportarFuncionariosExcel(dadosFiltrados)}
        labelExportarExcel="Exportar Excel"
        totalFiltrados={dadosFiltrados.length}
        totalGeral={data.length}
      />

      {dadosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3"><Users className="w-6 h-6" /></div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Nenhum colaborador encontrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-4">Ajuste os filtros de busca ou cadastre um novo colaborador.</p>
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
              {dadosFiltrados.map((item: Funcionario) => (
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

      <FuncionarioModalsContainer
        isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
        colaboradorEdicao={colaboradorEdicao} setColaboradorEdicao={setColaboradorEdicao}
        colaboradorPerfil={colaboradorPerfil} setColaboradorPerfil={setColaboradorPerfil}
        colaboradorHistorico={colaboradorHistorico} setColaboradorHistorico={setColaboradorHistorico}
        modalTab={modalTab} funcionarioPin={funcionarioPin} setFuncionarioPin={setFuncionarioPin}
        atualizarFuncionario={atualizarFuncionario} configurarPin={configurarPin}
        onSaved={handleSaved} onEditar={handleEditar}
      />
    </div>
  );
};
