import React, { useState, useMemo } from 'react';
import { Calendar, RefreshCw, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useFechamentoFolha } from './useFechamentoFolha';
import { TabelaFechamentoFolha } from './TabelaFechamentoFolha';
import { ResumoCardsFolha, type FiltroFolha } from './ResumoCardsFolha';

export const FechamentoFolha: React.FC = () => {
  const mesAtualPadrao = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [mesSelecionado, setMesSelecionado] = useState<string>(mesAtualPadrao);
  const [filtroFolha, setFiltroFolha] = useState<FiltroFolha>('TODOS');

  const { itensFolha, totais, loading, error, recarregar } = useFechamentoFolha(mesSelecionado);

  const itensFiltrados = useMemo(() => {
    if (filtroFolha === 'EXTRAS') return itensFolha.filter((it) => it.totalHorasExtras > 0);
    if (filtroFolha === 'ESTOURO') return itensFolha.filter((it) => it.estourouLimite);
    return itensFolha;
  }, [itensFolha, filtroFolha]);

  const exportarCSV = () => {
    if (!itensFolha.length) return;
    const cabecalho = [
      'Operador',
      'Cargo',
      'Salario Base (R$)',
      'Total Horas',
      'Horas Extras',
      'Valor HE (R$)',
      'Adicional HE (R$)',
      'Custo Total (R$)',
      'Estourou Limite'
    ];
    const linhas = itensFolha.map((it) => [
      `"${it.nome}"`,
      `"${it.cargo}"`,
      it.salarioBase.toFixed(2),
      it.totalHorasTrabalhadas.toFixed(1),
      it.totalHorasExtras.toFixed(1),
      it.valorHoraExtra.toFixed(2),
      it.adicionalHorasExtras.toFixed(2),
      it.custoTotal.toFixed(2),
      it.estourouLimite ? 'SIM' : 'NAO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [cabecalho.join(';'), ...linhas.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fechamento_folha_${mesSelecionado}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Ações */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-gray-700">Mês de Competência:</span>
          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-xl font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            disabled={loading || itensFolha.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 border border-gray-200 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Exportar CSV
          </button>

          <button
            onClick={() => recarregar()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 border border-emerald-200 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Alerta de erro */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Cards de Resumo Interativos */}
      <ResumoCardsFolha
        totalFolha={totais.totalFolha}
        totalHorasExtrasValor={totais.totalHorasExtrasValor}
        totalHorasExtrasQtd={totais.totalHorasExtrasQtd}
        operadoresComEstouro={totais.operadoresComEstouro}
        totalOperadores={itensFolha.length}
        filtroAtivo={filtroFolha}
        onSelectFiltro={setFiltroFolha}
      />

      {/* Tabela Principal */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              Fechamento Mensal de Folha & Apuração de Jornada
            </h3>
            <p className="text-[11px] text-gray-500">
              Cruzamento financeiro com base nas jornadas e boletins de Linha Amarela / Terraplanagem
            </p>
          </div>
          {filtroFolha !== 'TODOS' && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              Filtro ativo: {filtroFolha === 'EXTRAS' ? 'Horas Extras' : 'Estouro de Limite'} ({itensFiltrados.length} operador(es))
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            Processando jornadas e fechamento de folha do mês...
          </div>
        ) : (
          <TabelaFechamentoFolha itens={itensFiltrados} />
        )}
      </div>
    </div>
  );
};
