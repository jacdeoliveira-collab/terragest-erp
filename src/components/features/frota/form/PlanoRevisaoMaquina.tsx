import React from 'react';
import { CalendarClock, AlertCircle } from 'lucide-react';
import { intervalosSugeridos, margemAlertaRevisao } from '../../../../utils/revisaoAlertas';

interface Props {
  isKm: boolean;
  intervalo: number; setIntervalo: (v: number) => void;
  descricao: string; setDescricao: (v: string) => void;
  ultimaLeitura: number; setUltimaLeitura: (v: number) => void;
  mostrarErro: boolean;
}

const inputCls = 'w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500';

export const PlanoRevisaoMaquina: React.FC<Props> = ({
  isKm, intervalo, setIntervalo, descricao, setDescricao, ultimaLeitura, setUltimaLeitura, mostrarErro
}) => {
  const un = isKm ? 'km' : 'h';
  const proxima = (Number(ultimaLeitura) || 0) + (Number(intervalo) || 0);
  const faltando = mostrarErro && !(intervalo > 0);

  return (
    <div className="space-y-3">
      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex gap-2 text-xs text-emerald-900">
        <CalendarClock className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
        <span>
          Defina a cada quantos <b>{isKm ? 'quilômetros' : 'horas'}</b> este equipamento deve passar por revisão.
          O app avisa quando faltarem {margemAlertaRevisao(isKm)} {un} e quando a revisão vencer.
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Revisão a cada ({un}) *</label>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {intervalosSugeridos(isKm).map((v) => (
            <button
              key={v} type="button" onClick={() => setIntervalo(v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-all ${
                intervalo === v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {v.toLocaleString('pt-BR')} {un}
            </button>
          ))}
        </div>
        <input
          type="number" min="1" step="1" value={intervalo || ''} onChange={(e) => setIntervalo(parseFloat(e.target.value) || 0)}
          placeholder={isKm ? 'Ex: 10000' : 'Ex: 250'} className={`${inputCls} ${faltando ? 'border-rose-400 ring-1 ring-rose-300' : ''}`}
        />
        {faltando && (
          <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Informe o intervalo de revisão para cadastrar o equipamento.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Última revisão feita em ({un})</label>
          <input
            type="number" min="0" step={isKm ? '1' : '0.1'} value={ultimaLeitura} onChange={(e) => setUltimaLeitura(parseFloat(e.target.value) || 0)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Próxima revisão em ({un})</label>
          <input readOnly value={intervalo > 0 ? proxima.toLocaleString('pt-BR') : '-'} className={`${inputCls} bg-gray-100 text-gray-600`} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Serviço da revisão</label>
        <input
          value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Troca de óleo e filtros"
          className={inputCls.replace('font-mono', '')}
        />
      </div>
    </div>
  );
};
