import React from 'react';
import { FileText } from 'lucide-react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import { ClienteHistoricoTableRow } from './ClienteHistoricoTableRow';

interface Props {
  servicos: ServicoHorimetro[];
}

export const ClienteHistoricoServicosTable: React.FC<Props> = ({ servicos }) => {
  return (
    <div className="text-left">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Extrato de Serviços, Adiantamentos e Recebimentos</span>
        </h4>
        <span className="text-[11px] text-gray-400">Total de {servicos.length} registro(s)</span>
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
                <ClienteHistoricoTableRow key={s.id} servico={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
