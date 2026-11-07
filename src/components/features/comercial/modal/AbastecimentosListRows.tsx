import React from 'react';
import { Trash2, Eye, Truck, Fuel, HandCoins } from 'lucide-react';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';
import { isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';
import { abrirVisualizacaoImagem } from '../../../../utils/visualizadorImagem';
import { extrairInfoEmprestimo } from '../../../../utils/emprestimoHelper';

interface Props {
  itens: AbastecimentoItem[];
  onRemover: (id: string) => void;
  carregando?: boolean;
}

export const AbastecimentosListRows: React.FC<Props> = ({ itens, onRemover, carregando }) => {
  if (itens.length === 0) return null;

  return (
    <div className="divide-y divide-amber-100 bg-white border border-amber-200 rounded-lg max-h-52 overflow-y-auto">
      {itens.map((item, idx) => {
        const isApoio = isVehicleOrTruck({ code: item.maquina_codigo, name: item.maquina_nome }) ||
          item.tipo_combustivel === 'DIESEL_S10';
        const nomeEquipamento = item.maquina_codigo && item.maquina_nome
          ? `${item.maquina_codigo} - ${item.maquina_nome}`
          : (item.maquina_nome || item.maquina_codigo || (isApoio ? 'Veículo de Apoio' : 'Máquina Principal'));
        const combLabel = item.tipo_combustivel === 'DIESEL_S10' ? 'S10' : item.tipo_combustivel === 'DIESEL_S500' ? 'S500' : item.tipo_combustivel;
        const litros = Number(item.quantidade_litros) || 0;
        const total = Number(item.valor_total) || 0;
        const unitario = item.valor_unitario ? Number(item.valor_unitario) : (litros > 0 ? total / litros : 0);
        const empInfo = extrairInfoEmprestimo({ observacoes: item.numero_requisicao_nf, fornecedor: item.posto_fornecedor });

        return (
          <div key={item.id || idx} className="p-2 flex flex-wrap items-center justify-between gap-2 hover:bg-amber-50/40 text-[11px]">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span className="font-mono text-gray-500 font-bold shrink-0">{item.data}</span>
              <span className={`px-1.5 py-0.5 font-bold rounded text-[10px] flex items-center gap-1 shrink-0 ${
                isApoio ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}>
                {isApoio ? <Truck className="w-3 h-3" /> : <Fuel className="w-3 h-3" />}
                <span>{nomeEquipamento} ({combLabel})</span>
              </span>
              <span className="text-gray-600 truncate">
                {item.posto_fornecedor || 'Posto'}
                {item.horimetro_momento ? ` • ${item.horimetro_momento}h` : ''}
              </span>
              {empInfo.isEmprestimo && (
                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold text-[10px] inline-flex items-center gap-1">
                  <HandCoins className="w-3 h-3 text-purple-700" />
                  <span>Empréstimo: {empInfo.credorNome} • Pagar: {empInfo.dataPagamentoPrevista.split('-').reverse().join('/')}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 ml-auto">
              <span className="font-mono text-gray-700 font-semibold">
                {litros.toFixed(2)} L {unitario > 0 ? <span className="text-[10px] text-gray-500">(R$ {unitario.toFixed(2)}/L)</span> : null}
              </span>
              <span className="font-mono font-bold text-amber-900">
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {item.foto_comprovante && (
                <button
                  type="button"
                  onClick={() => abrirVisualizacaoImagem(item.foto_comprovante!, `Comprovante - ${nomeEquipamento}`)}
                  title="Ver Foto da Bomba / Cupom"
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemover(item.id)}
                disabled={carregando}
                title="Excluir este Abastecimento"
                className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
