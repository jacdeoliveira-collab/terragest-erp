import React from 'react';
import { Clock, CalendarDays, MessageSquare, Bell } from 'lucide-react';
import type { ParametrosOperacionaisEmpresa } from '../../../types/agenda.types';

interface Props {
  parametros: ParametrosOperacionaisEmpresa;
  setParametros: (p: ParametrosOperacionaisEmpresa) => void;
}

export const EmpresaOperacionalTab: React.FC<Props> = ({ parametros, setParametros }) => {
  const update = <K extends keyof ParametrosOperacionaisEmpresa>(key: K, val: ParametrosOperacionaisEmpresa[K]) => {
    setParametros({ ...parametros, [key]: val });
  };

  return (
    <div className="space-y-4 text-xs text-left">
      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900">
        Defina os horários reais de operação da sua empresa. A <strong>Agenda de Máquinas</strong> usará estes valores do banco para calcular previsões de término e deslocamento sem nada fixo no código.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" /><span>Mínimo Horas / Dia</span>
          </label>
          <input
            type="number" step="0.5" min="1" max="24"
            value={parametros.horas_dia_min ?? ''}
            onChange={(e) => update('horas_dia_min', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 7"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Média Padrão (Cálculo Agenda)</label>
          <input
            type="number" step="0.5" min="1" max="24"
            value={parametros.horas_dia_padrao ?? ''}
            onChange={(e) => update('horas_dia_padrao', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 8.5"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl font-bold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Máximo Horas / Dia</label>
          <input
            type="number" step="0.5" min="1" max="24"
            value={parametros.horas_dia_max ?? ''}
            onChange={(e) => update('horas_dia_max', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 10"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
          <input
            type="checkbox" checked={Boolean(parametros.trabalha_sabado)}
            onChange={(e) => update('trabalha_sabado', e.target.checked)}
            className="w-4 h-4 accent-emerald-600 rounded"
          />
          <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
          <span>Trabalha aos Sábados</span>
        </label>

        <div>
          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Horas no Sábado (ex: até meio-dia)</label>
          <input
            type="number" step="0.5" min="0" max="24" disabled={!parametros.trabalha_sabado}
            value={parametros.horas_sabado ?? ''}
            onChange={(e) => update('horas_sabado', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 4"
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
          <input
            type="checkbox" checked={Boolean(parametros.trabalha_domingo)}
            onChange={(e) => update('trabalha_domingo', e.target.checked)}
            className="w-4 h-4 accent-emerald-600 rounded"
          />
          <span>Trabalha aos Domingos</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 text-amber-600" /><span>Alertar (dias antes)</span>
          </label>
          <input
            type="number" min="0" max="30"
            value={parametros.alerta_dias_antes ?? ''}
            onChange={(e) => update('alerta_dias_antes', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 2"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /><span>Modelo de Mensagem WhatsApp (Agenda)</span>
          </label>
          <textarea
            rows={3}
            value={parametros.whatsapp_template ?? ''}
            onChange={(e) => update('whatsapp_template', e.target.value)}
            placeholder="Olá {cliente}, nossa máquina {maquina} está prevista para iniciar seu serviço ({horas}h) em {endereco} por volta de {data}. Podemos confirmar?"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[10px] text-gray-400 mt-1">Variáveis disponíveis: {'{cliente}'}, {'{maquina}'}, {'{horas}'}, {'{data}'}, {'{endereco}'}</p>
        </div>
      </div>
    </div>
  );
};
