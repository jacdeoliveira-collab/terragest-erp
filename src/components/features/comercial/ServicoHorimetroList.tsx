import React, { useState, useMemo } from 'react';
import { Gauge, Plus, Fuel, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { exportarServicosHorimetroExcel } from '../../../services/exportExcel';
import { useServicosHorimetro } from '../../../hooks/useServicosHorimetro';
import { useAbastecimentos } from '../../../hooks/useAbastecimentos';
import { useObraContext } from '../../../contexts/ObraContext';
import { ServicoHorimetroModal } from './ServicoHorimetroModal';
import { FechamentoDiarioModal } from '../bde/FechamentoDiarioModal';
import { gerarRelatorioServicoPDF } from '../../../utils/servicoHorimetroPdfGenerator';
import { gerarRelatorioConclusaoClientePDF } from '../../../utils/relatorioConclusaoClientePdf';
import { autoSincronizarServicosEAbastecimentos } from '../../../services/servicoCombustivelSync';
import { calcularTotaisListaServicos } from '../../../utils/servicoCalculos';
import { ServicoMetricasCards, ServicoHorimetroTable, ServicoBulkActionsBar, ServicoFiltrosBar, useServicosSelecao, useServicosFiltros } from './list';
import { ServicoExtratosModais } from './ServicoExtratosModais';
import { processarNovoAdiantamentoServico } from './servicoAdiantamentoHelper';
import { sincronizarFotosHorimetroPendentes } from '../../../services/driveSyncService';
import type { Cliente } from '../../../types/comercial.types';
import type { ServicoHorimetro } from '../../../types/servicoHorimetro.types';

export const ServicoHorimetroList: React.FC = () => {
  const { servicos, isLoading, salvarServico, excluirServico, refetch } = useServicosHorimetro();
  const { data: abastecimentos } = useAbastecimentos();

  React.useEffect(() => {
    sincronizarFotosHorimetroPendentes().then((res) => {
      if (res.sincronizadas > 0) refetch();
    }).catch(() => {});
  }, [refetch]);
  const { obraSelecionada } = useObraContext();
  const [modalAberto, setModalAberto] = useState(false);
  const [modalFechamentoDiario, setModalFechamentoDiario] = useState(false);
  const [servicoParaEditar, setServicoParaEditar] = useState<ServicoHorimetro | null>(null);
  const [servicoParaRecibo, setServicoParaRecibo] = useState<ServicoHorimetro | null>(null);
  const [clienteParaExtrato, setClienteParaExtrato] = useState<Cliente | null>(null);
  const [operadorParaExtrato, setOperadorParaExtrato] = useState<{ nome: string; id?: string } | null>(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [avisoSync, setAvisoSync] = useState<string | null>(null);

  const servicosObra = useMemo(() => {
    return obraSelecionada?.id ? servicos.filter((s) => s.obra_id === obraSelecionada.id) : servicos;
  }, [servicos, obraSelecionada?.id]);

  const filtros = useServicosFiltros(servicosObra);
  const selecao = useServicosSelecao();
  const metricasExibidas = useMemo(() => calcularTotaisListaServicos(filtros.servicosFiltrados), [filtros.servicosFiltrados]);

  const handleExcluir = async (id: string, cli: string) => { if (confirm(`Excluir serviço de "${cli}"?`)) await excluirServico(id); };
  const handleSincronizarCombustivel = async () => {
    setSincronizando(true); setAvisoSync(null);
    try {
      const res = await autoSincronizarServicosEAbastecimentos(servicosObra, abastecimentos);
      setAvisoSync(res.atualizados > 0 ? `${res.atualizados} serviço(s) sincronizado(s)!` : 'Diesel já está em dia.');
      if (res.atualizados > 0) await refetch();
    } catch { setAvisoSync('Erro na sincronização de diesel.'); } finally { setSincronizando(false); }
  };
  const handleSalvarAdiantamento = async (valor: number, forma: string, data: string, contaBancariaId?: string) => {
    if (servicoParaRecibo) await processarNovoAdiantamentoServico(servicoParaRecibo, valor, forma, data, salvarServico, contaBancariaId);
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-gray-400">Carregando serviços por horímetro...</div>;

  return (
    <div className="space-y-3.5 text-xs text-left">
      <ServicoMetricasCards metricas={metricasExibidas} />
      {avisoSync && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
          <span>{avisoSync}</span><button onClick={() => setAvisoSync(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      <ServicoFiltrosBar
        busca={filtros.busca} setBusca={filtros.setBusca} statusFiltro={filtros.statusFiltro} setStatusFiltro={filtros.setStatusFiltro}
        dataInicioFiltro={filtros.dataInicioFiltro} setDataInicioFiltro={filtros.setDataInicioFiltro} dataFimFiltro={filtros.dataFimFiltro} setDataFimFiltro={filtros.setDataFimFiltro}
        totalTodos={filtros.totalTodos} totalEmAndamento={filtros.totalEmAndamento} totalFinalizados={filtros.totalFinalizados}
        temFiltroAtivo={filtros.temFiltroAtivo} onLimparFiltros={filtros.limparFiltros}
      />

      <ServicoBulkActionsBar
        totalSelecionados={selecao.selecionados.size} totalDisponiveis={filtros.servicosFiltrados.length}
        onSelecionarTodos={() => selecao.toggleTodos(filtros.servicosFiltrados)}
        onSelecionarEmAndamento={() => selecao.selecionarApenasStatus(filtros.servicosFiltrados, 'EM_ANDAMENTO')}
        onSelecionarConcluidos={() => selecao.selecionarApenasStatus(filtros.servicosFiltrados, 'FINALIZADO')}
        onExportarPdf={() => selecao.exportarPdfSelecionados(filtros.servicosFiltrados)}
        onExportarExcel={() => exportarServicosHorimetroExcel(filtros.servicosFiltrados.filter((s) => selecao.selecionados.has(s.id)))}
        onExcluirSelecionados={() => selecao.excluirSelecionados(filtros.servicosFiltrados, async (id) => (await excluirServico(id)).success)}
        onLimparSelecao={selecao.limparSelecao}
      />

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><Gauge className="w-4 h-4 text-emerald-600" />Gestão de Locação por Horímetro</h3>
            <p className="text-[11px] text-gray-500">Centro de Custo: <strong className="text-emerald-700">{obraSelecionada ? obraSelecionada.nome : 'Todos'}</strong></p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => refetch()} title="Recarregar" className="inline-flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold shadow-2xs cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /><span>Atualizar</span></button>
            <button onClick={() => exportarServicosHorimetroExcel(filtros.servicosFiltrados)} className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-semibold shadow-2xs cursor-pointer"><FileSpreadsheet className="w-3.5 h-3.5" /><span>Excel</span></button>
            <button onClick={handleSincronizarCombustivel} disabled={sincronizando} className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-semibold shadow-2xs cursor-pointer">{sincronizando ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" /> : <Fuel className="w-3.5 h-3.5 text-amber-600" />}<span>Sincronizar Diesel</span></button>
            <button onClick={() => setModalFechamentoDiario(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"><Gauge className="w-3.5 h-3.5" /><span>Fechamento da Tarde</span></button>
            <button onClick={() => { setServicoParaEditar(obraSelecionada ? ({ obra_id: obraSelecionada.id, obra_nome: obraSelecionada.nome } as any) : null); setModalAberto(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"><Plus className="w-3.5 h-3.5" /><span>Novo Lançamento</span></button>
          </div>
        </div>

        {filtros.servicosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2"><Gauge className="w-10 h-10 mx-auto text-gray-300" /><p className="font-semibold text-gray-600">Nenhum serviço encontrado.</p></div>
        ) : (
          <ServicoHorimetroTable
            servicos={filtros.servicosFiltrados} selecionados={selecao.selecionados}
            onToggleSelecionar={selecao.toggleSelecionar} onToggleTodos={() => selecao.toggleTodos(filtros.servicosFiltrados)}
            onEditar={(srv) => { setServicoParaEditar(srv); setModalAberto(true); }}
            onExcluir={handleExcluir} onGerarPdf={gerarRelatorioServicoPDF}
            onGerarRelatorioCliente={gerarRelatorioConclusaoClientePDF} onAbrirRecibo={setServicoParaRecibo}
            onVerCliente={(nome, id) => setClienteParaExtrato({ id: id || '', nome, tenant_id: '' } as Cliente)}
            onVerOperador={(nome, id) => setOperadorParaExtrato({ nome, id })}
          />
        )}
      </div>

      {modalAberto && (
        <ServicoHorimetroModal isOpen={modalAberto} onClose={() => { setModalAberto(false); setServicoParaEditar(null); }} onSave={salvarServico} servicoParaEditar={servicoParaEditar} />
      )}
      <FechamentoDiarioModal isOpen={modalFechamentoDiario} onClose={() => setModalFechamentoDiario(false)} onSuccess={() => refetch()} />
      <ServicoExtratosModais
        clienteParaExtrato={clienteParaExtrato} onFecharCliente={() => setClienteParaExtrato(null)}
        operadorParaExtrato={operadorParaExtrato} onFecharOperador={() => setOperadorParaExtrato(null)}
        servicoParaRecibo={servicoParaRecibo} onFecharRecibo={() => setServicoParaRecibo(null)}
        onConfirmarAdiantamento={handleSalvarAdiantamento}
      />
    </div>
  );
};
