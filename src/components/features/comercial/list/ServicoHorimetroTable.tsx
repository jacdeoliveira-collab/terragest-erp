import React from 'react';
import { ServicoRowItem } from './ServicoRowItem';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';

interface ServicoHorimetroTableProps {
  servicos: ServicoHorimetro[];
  selecionados: Set<string>;
  onToggleSelecionar: (id: string) => void;
  onToggleTodos: () => void;
  onEditar: (srv: ServicoHorimetro) => void;
  onExcluir: (id: string, cliente: string) => void;
  onGerarPdf: (srv: ServicoHorimetro) => void;
  onGerarRelatorioCliente: (srv: ServicoHorimetro) => void;
  onAbrirRecibo: (srv: ServicoHorimetro) => void;
  onVerCliente?: (nome: string, id?: string) => void;
  onVerOperador?: (nome: string, id?: string) => void;
}

export const ServicoHorimetroTable: React.FC<ServicoHorimetroTableProps> = ({
  servicos,
  selecionados,
  onToggleSelecionar,
  onToggleTodos,
  onEditar,
  onExcluir,
  onGerarPdf,
  onGerarRelatorioCliente,
  onAbrirRecibo,
  onVerCliente,
  onVerOperador
}) => {
  const todosSelecionados = servicos.length > 0 && selecionados.size === servicos.length;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left text-xs text-gray-600 min-w-[1100px]">
        <thead className="bg-gray-50/80 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
          <tr>
            <th className="py-2.5 px-3 text-center w-10">
              <input
                type="checkbox"
                checked={todosSelecionados}
                onChange={onToggleTodos}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                title="Selecionar todos os serviços"
              />
            </th>
            <th className="py-2.5 px-4 text-left">Cliente / Obra</th>
            <th className="py-2.5 px-3 text-center">Período</th>
            <th className="py-2.5 px-3 text-center">Horímetro</th>
            <th className="py-2.5 px-3 text-center">Horas</th>
            <th className="py-2.5 px-4 text-right">Faturamento / Recebido</th>
            <th className="py-2.5 px-4 text-right">Diesel</th>
            <th className="py-2.5 px-4 text-right">Lucro Líquido</th>
            <th className="py-2.5 px-3 text-center">Status</th>
            <th className="py-2.5 px-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {servicos.map((s) => (
            <ServicoRowItem
              key={s.id}
              servico={s}
              selecionado={selecionados.has(s.id)}
              onToggleSelecionar={() => onToggleSelecionar(s.id)}
              onEditar={onEditar}
              onExcluir={onExcluir}
              onGerarPdf={onGerarPdf}
              onGerarRelatorioCliente={onGerarRelatorioCliente}
              onAbrirRecibo={onAbrirRecibo}
              onVerCliente={onVerCliente}
              onVerOperador={onVerOperador}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
