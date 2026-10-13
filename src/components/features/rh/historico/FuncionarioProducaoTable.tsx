import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';
import type { DailyBulletin } from '../../../../types/bde.types';

interface ItemProducao {
  id: string;
  origem: 'LOCACAO' | 'BDE';
  data: string;
  clienteObra: string;
  maquinaNome: string;
  horimetroInicial: number;
  horimetroFinal: number;
  horasTrabalhadas: number;
  status: string;
  descricao?: string;
}

interface Props {
  servicos: ServicoHorimetro[];
  bulletins: DailyBulletin[];
}

export const FuncionarioProducaoTable: React.FC<Props> = ({ servicos, bulletins }) => {
  const [filtroOrigem, setFiltroOrigem] = useState<'TODOS' | 'LOCACAO' | 'BDE'>('TODOS');

  const itensLocacao: ItemProducao[] = servicos.map((s) => ({
    id: s.id,
    origem: 'LOCACAO',
    data: s.data_inicio || '',
    clienteObra: s.cliente_nome || 'Cliente não informado',
    maquinaNome: s.maquina_nome || 'Equipamento',
    horimetroInicial: Number(s.horimetro_inicial) || 0,
    horimetroFinal: Number(s.horimetro_final) || 0,
    horasTrabalhadas: Number(s.horas_trabalhadas) || 0,
    status: s.status || 'FINALIZADO',
    descricao: s.descricao_servico
  }));

  const itensBde: ItemProducao[] = bulletins.map((b) => ({
    id: b.id,
    origem: 'BDE',
    data: b.date || '',
    clienteObra: b.client_name || b.work_location || 'Obra de Campo',
    maquinaNome: b.equipment_name || b.equipment_code || 'Máquina BDE',
    horimetroInicial: Number(b.initial_hourmeter) || 0,
    horimetroFinal: Number(b.final_hourmeter) || 0,
    horasTrabalhadas: Number(b.total_hours) || 0,
    status: b.status_aprovacao || b.status || 'CONCLUÍDO',
    descricao: b.service_description
  }));

  const todos = [...itensLocacao, ...itensBde].sort((a, b) => b.data.localeCompare(a.data));
  const filtrados = todos.filter((i) => (filtroOrigem === 'TODOS' ? true : i.origem === filtroOrigem));

  if (todos.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-xs text-gray-500">
        Nenhum registro de produção ou hora trabalhada encontrado para este colaborador.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Extrato de Produção & Horímetros ({filtrados.length})</span>
        </h4>
        <div className="flex gap-1">
          {(['TODOS', 'LOCACAO', 'BDE'] as const).map((aba) => (
            <button
              key={aba}
              type="button"
              onClick={() => setFiltroOrigem(aba)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer border ${
                filtroOrigem === aba
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {aba === 'TODOS' ? 'Todos' : aba === 'LOCACAO' ? 'Locações' : 'Apontamentos BDE'}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="p-2.5">Data</th>
              <th className="p-2.5">Origem</th>
              <th className="p-2.5">Cliente / Obra</th>
              <th className="p-2.5">Máquina</th>
              <th className="p-2.5 text-right">Inicial</th>
              <th className="p-2.5 text-right">Final</th>
              <th className="p-2.5 text-right">Horas</th>
              <th className="p-2.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filtrados.map((item) => (
              <tr key={`${item.origem}-${item.id}`} className="hover:bg-gray-50/70">
                <td className="p-2.5 font-mono text-[11px] whitespace-nowrap">{item.data || '-'}</td>
                <td className="p-2.5">
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                      item.origem === 'LOCACAO'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {item.origem === 'LOCACAO' ? 'Locação' : 'BDE'}
                  </span>
                </td>
                <td className="p-2.5 font-semibold text-gray-900 max-w-[150px] truncate" title={item.clienteObra}>
                  {item.clienteObra}
                </td>
                <td className="p-2.5 max-w-[130px] truncate" title={item.maquinaNome}>
                  {item.maquinaNome}
                </td>
                <td className="p-2.5 text-right font-mono text-gray-500">{item.horimetroInicial.toFixed(1)}</td>
                <td className="p-2.5 text-right font-mono text-gray-500">{item.horimetroFinal.toFixed(1)}</td>
                <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                  {item.horasTrabalhadas.toFixed(1)}h
                </td>
                <td className="p-2.5 text-center">
                  <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
