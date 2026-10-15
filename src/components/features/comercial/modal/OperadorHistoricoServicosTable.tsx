import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import type { FuncionarioRemuneracaoItem } from '../../../../types/funcionarioHistorico.types';

interface Props {
  servicos: ServicoHorimetro[];
  onQuitarItem?: (item: FuncionarioRemuneracaoItem) => void;
}

export const OperadorHistoricoServicosTable: React.FC<Props> = ({ servicos, onQuitarItem }) => {
  if (servicos.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-gray-100">
        Nenhum serviço registrado para este operador.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl text-left">
      <table className="w-full text-left text-xs">
        <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
          <tr>
            <th className="py-2.5 px-3">Data</th>
            <th className="py-2.5 px-3">Obra / Cliente</th>
            <th className="py-2.5 px-3">Equipamento</th>
            <th className="py-2.5 px-3 text-right">Horas</th>
            <th className="py-2.5 px-3 text-right">Remuneração</th>
            <th className="py-2.5 px-3 text-right">Vales/Adiant.</th>
            <th className="py-2.5 px-3 text-right">Saldo Restante</th>
            <th className="py-2.5 px-3 text-center">Status</th>
            <th className="py-2.5 px-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {servicos.map((s) => {
            const h = Number(s.horas_trabalhadas) || 0;
            const vHoraOp = Number(s.valor_hora_operador) || 0;
            const remun = vHoraOp > 0 ? Number((h * vHoraOp).toFixed(2)) : (Number(s.despesa_operador) || 0);
            const vale = Number(s.adiantamento_operador_valor) || 0;
            const saldo = Math.max(0, Number((remun - vale).toFixed(2)));
            const statusPago = s.status_pagamento_operador === 'PAGO' || (remun > 0 && saldo === 0);

            return (
              <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="py-2.5 px-3 font-mono text-gray-600">{s.data_inicio}</td>
                <td className="py-2.5 px-3">
                  <span className="font-bold text-gray-900 block">{s.descricao_servico || 'Locação'}</span>
                  <span className="text-[10px] text-gray-500">{s.cliente_nome}</span>
                </td>
                <td className="py-2.5 px-3 text-gray-700">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Truck className="w-3 h-3 text-emerald-600" />
                    <span>{s.maquina_nome}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-gray-800 text-right">{h.toFixed(1)} h</td>
                <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 text-right">
                  R$ {remun.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 font-mono text-purple-700 text-right">
                  R$ {vale.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-amber-700 text-right">
                  R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    statusPago ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {statusPago ? 'PAGO' : 'PENDENTE'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  {onQuitarItem && (
                    <button
                      type="button"
                      onClick={() => onQuitarItem({
                        servicoId: s.id,
                        data: s.data_inicio,
                        clienteNome: s.cliente_nome,
                        maquinaNome: s.maquina_nome,
                        horasTrabalhadas: h,
                        valorHora: vHoraOp,
                        totalGanho: remun,
                        valorAdiantado: vale,
                        saldoRestante: saldo,
                        status: statusPago ? 'PAGO' : 'PENDENTE',
                        dataPagamento: s.data_pagamento_operador
                      })}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                        statusPago
                          ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-2xs'
                      }`}
                      title={statusPago ? 'Ver/Alterar Pagamento' : 'Dar Vale / Quitar'}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{statusPago ? 'Ver/Editar' : 'Dar Vale'}</span>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
