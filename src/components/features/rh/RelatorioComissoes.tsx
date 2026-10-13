import React from 'react';
import { Calendar, DollarSign, RefreshCw, AlertCircle, HardHat } from 'lucide-react';
import { useRelatorioComissoes } from '../../../hooks/useRelatorioComissoes';
import { ComissaoTableRow } from './ComissaoTableRow';

export const RelatorioComissoes: React.FC = () => {
  const {
    dataInicio, setDataInicio, dataFim, setDataFim,
    relatorio, loading, error, recarregar, handleSetValorHora
  } = useRelatorioComissoes();

  const totalGeralHoras = relatorio.reduce((acc, cur) => acc + cur.totalHorasTrabalhadas, 0);
  const totalGeralPagar = relatorio.reduce((acc, cur) => acc + cur.totalPagar, 0);

  return (
    <div className="space-y-4">
      {/* Barra de Filtros de Período */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Comissões & Pagamento de Operadores</h2>
            <p className="text-[11px] text-gray-500">Apuração de horas do BDE e emissão de recibos físicos assinados</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400 ml-1" />
            <span className="text-gray-500 font-medium">De:</span>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-800 font-medium outline-none"
            />
            <span className="text-gray-500 font-medium">Até:</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-800 font-medium outline-none"
            />
          </div>

          <button
            onClick={() => recarregar()}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Operadores no Período</p>
            <p className="text-lg font-bold text-gray-900">{relatorio.length}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <HardHat className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Horas Produtivas Totais</p>
            <p className="text-lg font-bold text-amber-600">{totalGeralHoras.toFixed(2)} hrs</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Total de Comissões</p>
            <p className="text-lg font-bold text-emerald-600">
              R$ {totalGeralPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabela de Operadores */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Operador</th>
                <th className="px-4 py-3">Máquinas Operadas</th>
                <th className="px-4 py-3 text-center">Horas Trabalhadas</th>
                <th className="px-4 py-3">Valor da Hora / Comissão</th>
                <th className="px-4 py-3 text-right">Total a Pagar</th>
                <th className="px-4 py-3 text-center">Recibo PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-xs">
                    Carregando dados dos boletins diários...
                  </td>
                </tr>
              ) : relatorio.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-xs">
                    Nenhum apontamento de BDE encontrado para o período selecionado.
                  </td>
                </tr>
              ) : (
                relatorio.map((item) => (
                  <ComissaoTableRow
                    key={item.operadorId}
                    item={item}
                    periodo={{ dataInicio, dataFim }}
                    onUpdateValorHora={handleSetValorHora}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
