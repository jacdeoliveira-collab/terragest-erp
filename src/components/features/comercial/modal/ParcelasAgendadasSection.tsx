import React, { useState } from 'react';
import { CalendarClock, Plus, Trash2, CheckCircle2, Save, Loader2 } from 'lucide-react';
import type { ParcelaItem } from '../../../../types/servicoHorimetro.types';

interface Props {
  saldoRestante: number;
  parcelas: ParcelaItem[];
  onGerarParcelas: (qtd: number, saldo: number) => void;
  onAtualizarParcela: (id: string, updates: Partial<ParcelaItem>) => void;
  onAdicionarParcela: (saldoSugerido?: number) => void;
  onRemoverParcela: (id: string) => void;
  onSalvarParcelas?: () => Promise<boolean>;
}

export const ParcelasAgendadasSection: React.FC<Props> = ({
  saldoRestante, parcelas, onGerarParcelas, onAtualizarParcela,
  onAdicionarParcela, onRemoverParcela, onSalvarParcelas
}) => {
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const somaParcelas = Number(parcelas.reduce((acc, p) => acc + (Number(p.valor) || 0), 0).toFixed(2));
  const diferenca = Number((saldoRestante - somaParcelas).toFixed(2));

  const handleSalvar = async () => {
    if (!onSalvarParcelas) return;
    setSalvando(true);
    const ok = await onSalvarParcelas();
    setSalvando(false);
    if (ok) {
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3500);
    }
  };

  return (
    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2.5 text-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="font-bold text-blue-950 flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4 text-blue-600" />
            Parcelamento do Saldo Restante & Datas de Cobrança
          </span>
          <span className="text-[10px] text-blue-700">Valores e datas editáveis por parcela (refletem no Contas a Receber)</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-blue-800 mr-1">Dividir saldo:</span>
          {[2, 3, 4].map((qtd) => (
            <button
              key={qtd} type="button" onClick={() => onGerarParcelas(qtd, saldoRestante)}
              className="px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded font-bold text-[10px] cursor-pointer"
            >
              {qtd}x
            </button>
          ))}
          <button
            type="button" onClick={() => onAdicionarParcela(diferenca > 0 ? diferenca : undefined)}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] cursor-pointer shadow-xs ml-1"
          >
            <Plus className="w-3 h-3" /><span>Parcela</span>
          </button>
        </div>
      </div>

      {sucesso && (
        <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Parcelamento gravado com sucesso no Supabase e no Contas a Receber!</span>
        </div>
      )}

      {parcelas.length === 0 ? (
        <div className="p-2.5 bg-white border border-blue-200/80 rounded-lg text-center text-gray-500 text-[11px]">
          Nenhum parcelamento agendado. Clique em <b>2x</b>, <b>3x</b> ou <b>+ Parcela</b> para dividir o saldo de <b>R$ {saldoRestante.toFixed(2)}</b> com datas de vencimento.
        </div>
      ) : (
        <div className="space-y-1.5">
          {parcelas.map((p, idx) => (
            <div key={p.id} className="p-2 bg-white border border-blue-200 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <div className="sm:col-span-2 font-bold text-blue-900 flex items-center gap-1 text-[11px]">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">{p.numero || idx + 1}</span>
                <span>Parcela {p.numero || idx + 1}</span>
              </div>
              <div className="sm:col-span-3">
                <label className="text-[9px] font-bold text-gray-500 block">Valor da Parcela (R$)</label>
                <input
                  type="number" step="0.01" min="0" value={p.valor}
                  onChange={(e) => onAtualizarParcela(p.id, { valor: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded font-mono font-bold text-gray-900 text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-[9px] font-bold text-gray-500 block">Vencimento (Lembrete)</label>
                <input
                  type="date" value={p.data_vencimento}
                  onChange={(e) => onAtualizarParcela(p.id, { data_vencimento: e.target.value })}
                  className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded font-medium text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="text-[9px] font-bold text-gray-500 block">Forma / Observação</label>
                <input
                  type="text" value={p.observacao || ''} placeholder="Ex: PIX ou Cheque"
                  onChange={(e) => onAtualizarParcela(p.id, { observacao: e.target.value })}
                  className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded text-xs"
                />
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button" onClick={() => onRemoverParcela(p.id)} title="Remover Parcela"
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between pt-2 px-1 text-[11px] gap-2 border-t border-blue-100">
            <div>
              <span>Soma: <b>R$ {somaParcelas.toFixed(2)}</b> (Saldo: R$ {saldoRestante.toFixed(2)})</span>
              {Math.abs(diferenca) < 0.01 ? (
                <span className="text-emerald-700 font-semibold ml-2">✓ Confere</span>
              ) : (
                <span className="text-amber-700 font-semibold ml-2">⚠️ Dif: R$ {Math.abs(diferenca).toFixed(2)}</span>
              )}
            </div>
            {onSalvarParcelas && (
              <button
                type="button" onClick={handleSalvar} disabled={salvando}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs cursor-pointer transition-all"
              >
                {salvando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{salvando ? 'Gravando...' : 'Gravar Parcelas'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
