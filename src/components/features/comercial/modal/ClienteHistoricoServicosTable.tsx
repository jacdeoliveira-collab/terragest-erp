import React, { useState } from 'react';
import { FileText, Printer } from 'lucide-react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import { ClienteHistoricoTableRow } from './ClienteHistoricoTableRow';
import { gerarRelatorioServicosConsolidadoPDF } from '../../../../utils/relatorioServicosConsolidadoPdf';

interface Props {
  servicos: ServicoHorimetro[];
  clienteNome?: string;
}

export const ClienteHistoricoServicosTable: React.FC<Props> = ({ servicos, clienteNome }) => {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const todosSelecionados = servicos.length > 0 && selecionados.size === servicos.length;

  const toggleTodos = () => {
    if (todosSelecionados) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(servicos.map((s) => s.id)));
    }
  };

  const toggleItem = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImprimirConsolidado = () => {
    const lista = selecionados.size > 0
      ? servicos.filter((s) => selecionados.has(s.id))
      : servicos;
    gerarRelatorioServicosConsolidadoPDF(lista, clienteNome);
  };

  return (
    <div className="text-left space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Extrato de Serviços, Adiantamentos e Recebimentos</span>
          </h4>
          <span className="text-[11px] text-gray-500">
            {selecionados.size > 0 ? (
              <strong className="text-emerald-700">{selecionados.size} de {servicos.length} selecionado(s)</strong>
            ) : (
              `Total de ${servicos.length} registro(s)`
            )}
          </span>
        </div>

        {servicos.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimirConsolidado}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
              title="Gera um único PDF com os serviços selecionados juntos"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>
                {selecionados.size > 0 ? `Imprimir ${selecionados.size} Selecionados (PDF)` : 'Imprimir Todos Juntos (PDF)'}
              </span>
            </button>
          </div>
        )}
      </div>

      {servicos.length === 0 ? (
        <div className="text-center py-8 text-xs text-gray-400 border border-gray-200 rounded-xl bg-gray-50/50">
          Nenhum serviço de horímetro registrado para este cliente até o momento.
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200 sticky top-0 bg-opacity-95">
              <tr>
                <th className="p-2.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={todosSelecionados}
                    onChange={toggleTodos}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                    title="Selecionar todos os serviços"
                  />
                </th>
                <th className="p-2.5">Data / Máquina</th>
                <th className="p-2.5">Serviço / Operador</th>
                <th className="p-2.5 text-right">Faturamento</th>
                <th className="p-2.5 text-right">Adiant. / A Haver</th>
                <th className="p-2.5 text-right">Saldo Aberto</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {servicos.map((s) => (
                <ClienteHistoricoTableRow
                  key={s.id}
                  servico={s}
                  selecionado={selecionados.has(s.id)}
                  onToggleSelecionar={() => toggleItem(s.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
