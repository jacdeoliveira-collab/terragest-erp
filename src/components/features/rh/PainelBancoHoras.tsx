import React from 'react';
import { Clock, TrendingUp, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { useBancoHoras } from '../../../hooks/useBancoHoras';
import { exportarEspelhoBancoHorasPDF } from '../../../utils/pdfGenerator';
import type { ExtratoBancoHoras } from '../../../types/rh.types';

export const PainelBancoHoras: React.FC = () => {
  const { extratos, loading, error } = useBancoHoras();

  const handleExportarPDF = () => {
    if (!extratos.length) return;
    exportarEspelhoBancoHorasPDF(extratos);
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-xs text-gray-400">
        Calculando apontamentos de BDE e fechamento do banco de horas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Extrato de Banco de Horas & Custo Extra (Mês Vigente)
          </h3>
          <p className="text-[11px] text-gray-500">Apontamentos calculados via Boletins Diários de Equipamento (BDE)</p>
        </div>

        <button
          onClick={handleExportarPDF}
          disabled={extratos.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Exportar Espelho (PDF)</span>
        </button>
      </div>

      {extratos.length === 0 ? (
        <div className="p-8 text-center text-gray-400">Nenhum colaborador registrado para apuração.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">Operador / Função</th>
                <th className="p-3 text-right">Total Registrado</th>
                <th className="p-3 text-right">Limite (22d)</th>
                <th className="p-3 text-right">Saldo de Horas</th>
                <th className="p-3 text-right">Horas Extras</th>
                <th className="p-3 text-right">Custo Extra (R$)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {extratos.map((item: ExtratoBancoHoras) => {
                const isEstouro = item.saldoHoras > 0;
                return (
                  <tr key={item.funcionarioId} className="hover:bg-gray-50/60">
                    <td className="p-3 font-semibold text-gray-900">
                      {item.nome}
                      <span className="block text-[10px] text-gray-400 font-normal">{item.cargo}</span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-800">{item.totalHorasMes.toFixed(1)}h</td>
                    <td className="p-3 text-right font-mono text-gray-500">{item.limiteMensal.toFixed(1)}h</td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={isEstouro ? 'text-amber-600' : 'text-emerald-700'}>
                        {item.saldoHoras > 0 ? `+${item.saldoHoras.toFixed(1)}h` : `${item.saldoHoras.toFixed(1)}h`}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={item.horasExtras > 0 ? 'text-rose-600' : 'text-gray-400'}>
                        {item.horasExtras > 0 ? `${item.horasExtras.toFixed(1)}h` : '-'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">
                      R$ {item.custoEstimadoExtra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isEstouro
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isEstouro ? <TrendingUp className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {isEstouro ? 'HORAS EXTRAS' : 'DENTRO DO LIMITE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
