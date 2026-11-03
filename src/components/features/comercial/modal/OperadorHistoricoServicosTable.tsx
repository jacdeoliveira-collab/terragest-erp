import React from 'react';
import { Truck, CheckCircle, Clock } from 'lucide-react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';

interface Props {
  servicos: ServicoHorimetro[];
}

export const OperadorHistoricoServicosTable: React.FC<Props> = ({ servicos }) => {
  if (servicos.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 bg-gray-50/50 rounded-xl border border-gray-100">
        Nenhum serviço registrado para este operador.
      </div>
    );
  }

  return (
    <div className="space-y-2 text-left">
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3">Obra / Cliente</th>
              <th className="py-2.5 px-3">Equipamento</th>
              <th className="py-2.5 px-3 text-right">Horas</th>
              <th className="py-2.5 px-3 text-right">Remuneração Calculada</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {servicos.map((s) => {
              const h = Number(s.horas_trabalhadas) || 0;
              const vHoraOp = Number(s.valor_hora_operador) || 0;
              const remun = vHoraOp > 0 ? Number((h * vHoraOp).toFixed(2)) : (Number(s.despesa_operador) || 0);
              const isPago = s.status_pagamento_operador === 'PAGO' || (s.saldo_pagar_operador !== undefined && Number(s.saldo_pagar_operador) <= 0.01 && remun > 0);

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
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isPago ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isPago ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      {isPago ? 'PAGO' : 'PENDENTE'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-500 italic text-right">
        * Para lançar haveres, vales ou pagamentos ao operador, utilize o módulo central de <strong>Recursos Humanos (RH)</strong>.
      </p>
    </div>
  );
};
