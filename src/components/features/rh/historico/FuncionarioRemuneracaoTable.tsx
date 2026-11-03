import React, { useState } from 'react';
import { DollarSign, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';
import type { FuncionarioRemuneracaoItem } from '../../../../types/funcionarioHistorico.types';
import { FiltroExportacaoBar } from '../../../common/FiltroExportacaoBar';
import { exportarRemuneracoesOperadorExcel, exportarRemuneracoesOperadorPDF } from '../../../../utils/exportRemuneracaoOperador';

interface Props {
  remuneracoes: FuncionarioRemuneracaoItem[];
  operadorNome: string;
  onQuitarItem: (item: FuncionarioRemuneracaoItem) => void;
}

const OPCOES_STATUS = [
  { valor: 'TODOS', label: 'Todos os Status' },
  { valor: 'PAGO', label: 'Quitados / Pagos' },
  { valor: 'PENDENTE', label: 'Pendentes' }
];

export const FuncionarioRemuneracaoTable: React.FC<Props> = ({ remuneracoes, operadorNome, onQuitarItem }) => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [status, setStatus] = useState('TODOS');

  const filtrados = React.useMemo(() => {
    return remuneracoes.filter((r) => {
      if (status === 'PAGO' && r.status !== 'PAGO' && r.saldoRestante > 0.01) return false;
      if (status === 'PENDENTE' && (r.status === 'PAGO' || r.saldoRestante <= 0.01)) return false;
      if (dataInicio && r.data && r.data < dataInicio) return false;
      if (dataFim && r.data && r.data > dataFim) return false;
      return true;
    });
  }, [remuneracoes, status, dataInicio, dataFim]);

  return (
    <div className="space-y-2.5 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Extrato Financeiro de Ganhos & Pagamentos ({filtrados.length})</span>
        </h4>
        <span className="text-[11px] text-gray-500">Sincronizado automaticamente com Contas a Pagar</span>
      </div>

      <FiltroExportacaoBar
        dataInicio={dataInicio} setDataInicio={setDataInicio}
        dataFim={dataFim} setDataFim={setDataFim}
        status={status} setStatus={setStatus}
        statusOptions={OPCOES_STATUS}
        onExportarExcel={() => exportarRemuneracoesOperadorExcel(operadorNome, filtrados)}
        onExportarPdf={() => exportarRemuneracoesOperadorPDF(operadorNome, filtrados)}
        totalFiltrados={filtrados.length}
      />

      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="p-2.5">Data</th>
              <th className="p-2.5">Cliente / Serviço</th>
              <th className="p-2.5">Máquina</th>
              <th className="p-2.5 text-right">Horas</th>
              <th className="p-2.5 text-right">R$/h</th>
              <th className="p-2.5 text-right">Ganho Total</th>
              <th className="p-2.5 text-right">Já Pago</th>
              <th className="p-2.5 text-right">Saldo</th>
              <th className="p-2.5 text-center">Status</th>
              <th className="p-2.5 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filtrados.length === 0 ? (
              <tr><td colSpan={10} className="p-8 text-center text-gray-400">Nenhum serviço encontrado no período ou filtro selecionado.</td></tr>
            ) : filtrados.map((item) => {
              const isQuitado = item.status === 'PAGO' || (item.totalGanho > 0 && item.saldoRestante <= 0.01);
              return (
                <tr key={item.servicoId} className="hover:bg-gray-50/70">
                  <td className="p-2.5 font-mono text-[11px] whitespace-nowrap">{item.data || '-'}</td>
                  <td className="p-2.5 font-semibold text-gray-900 max-w-[130px] truncate" title={item.clienteNome}>{item.clienteNome}</td>
                  <td className="p-2.5 max-w-[110px] truncate text-gray-600" title={item.maquinaNome}>{item.maquinaNome}</td>
                  <td className="p-2.5 text-right font-mono text-gray-700">{item.horasTrabalhadas.toFixed(1)}h</td>
                  <td className="p-2.5 text-right font-mono text-gray-500">R$ {item.valorHora.toFixed(2)}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-gray-900">R$ {item.totalGanho.toFixed(2)}</td>
                  <td className="p-2.5 text-right font-mono text-blue-700 font-semibold">R$ {item.valorAdiantado.toFixed(2)}</td>
                  <td className={`p-2.5 text-right font-mono font-bold ${item.saldoRestante > 0 ? 'text-amber-700' : 'text-gray-400'}`}>R$ {item.saldoRestante.toFixed(2)}</td>
                  <td className="p-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${isQuitado ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {isQuitado ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isQuitado ? 'PAGO' : 'PENDENTE'}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <button type="button" onClick={() => onQuitarItem(item)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border ${isQuitado ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-xs'}`}>
                      <CheckCircle2 className="w-3 h-3" /><span>{isQuitado ? 'Ver Baixa' : 'Quitar'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
