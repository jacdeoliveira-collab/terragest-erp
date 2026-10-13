import React, { useState, useMemo } from 'react';
import { Fuel, CheckCircle2, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { useAbastecimentos } from '../../../../hooks/useAbastecimentos';
import { isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';
import type { AbastecimentoItem } from '../../../../types/abastecimento.types';

interface Props {
  maquinaNome?: string;
  servicoId?: string;
  abastecimentosIds?: string[];
  onAplicar: (maqL: number, maqV: number, apoioL: number, apoioV: number, foto?: string, ids?: string[]) => void;
}

export const AbastecimentosVinculadosSelector: React.FC<Props> = ({
  maquinaNome, servicoId, abastecimentosIds, onAplicar
}) => {
  const { data: abastecimentos, isLoading } = useAbastecimentos();
  const [expandido, setExpandido] = useState(true);
  const [selecionados, setSelecionados] = useState<Set<string>>(() => new Set(abastecimentosIds || []));

  React.useEffect(() => {
    if (abastecimentosIds && abastecimentosIds.length > 0) {
      setSelecionados(new Set(abastecimentosIds));
    } else if (servicoId && abastecimentos?.length) {
      const vinculados = abastecimentos.filter(a => a.servico_id === servicoId || a.numero_requisicao_nf?.includes(servicoId)).map(a => a.id);
      if (vinculados.length > 0) setSelecionados(new Set(vinculados));
    }
  }, [abastecimentosIds, servicoId, abastecimentos]);

  const codMaq = useMemo(() => {
    if (!maquinaNome) return '';
    const m = maquinaNome.match(/\(([^)]+)\)/);
    return (m ? m[1] : maquinaNome).trim().toUpperCase();
  }, [maquinaNome]);

  const candidatos = useMemo(() => {
    if (!abastecimentos?.length) return [];
    return abastecimentos.filter((ab) => {
      if (ab.servico_id && ab.servico_id !== servicoId) return false;
      if (selecionados.has(ab.id)) return true;
      if (servicoId && ab.servico_id === servicoId) return true;
      const c = (ab.maquina_codigo || '').toUpperCase();
      const n = (ab.maquina_nome || '').toUpperCase();
      return (codMaq && (c.includes(codMaq) || n.includes(codMaq))) || isVehicleOrTruck({ code: c, name: n });
    });
  }, [abastecimentos, codMaq, servicoId, selecionados]);

  const aplicar = (ids: Set<string>) => {
    let [mL, mV, aL, aV] = [0, 0, 0, 0];
    let foto: string | undefined;
    candidatos.forEach((ab) => {
      if (!ids.has(ab.id)) return;
      const isApoio = isVehicleOrTruck({ code: ab.maquina_codigo, name: ab.maquina_nome });
      const lit = Number(ab.quantidade_litros) || 0;
      const val = Number(ab.valor_total) || 0;
      if (isApoio) { aL += lit; aV += val; } else { mL += lit; mV += val; }
      if (ab.foto_comprovante && !foto) foto = ab.foto_comprovante;
    });
    onAplicar(Number(mL.toFixed(2)), Number(mV.toFixed(2)), Number(aL.toFixed(2)), Number(aV.toFixed(2)), foto, Array.from(ids));
  };

  const toggle = (id: string) => {
    const s = new Set(selecionados);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelecionados(s); aplicar(s);
  };

  const todosSelecionados = candidatos.length > 0 && candidatos.every(a => selecionados.has(a.id));
  const alternarTodos = () => {
    const s = todosSelecionados ? new Set<string>() : new Set(candidatos.map((a) => a.id));
    setSelecionados(s); aplicar(s);
  };

  if (isLoading) {
    return <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-400">Carregando abastecimentos...</div>;
  }

  if (candidatos.length === 0) {
    return (
      <div className="p-3 bg-emerald-50/50 border border-dashed border-emerald-200 rounded-xl flex items-center justify-between text-left text-xs">
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="font-semibold text-emerald-950 block">Menu de Vinculação de Abastecimento</span>
            <span className="text-[11px] text-emerald-700">Nenhum abastecimento pendente encontrado para este equipamento. Lançamentos realizados em Combustível aparecem aqui para seleção por caixinha.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
          <Fuel className="w-4 h-4 text-emerald-600" />
          <span>Vincular Abastecimentos na Caixinha ({candidatos.length})</span>
          {selecionados.size > 0 && <span className="text-[10px] text-emerald-700 font-normal">({selecionados.size} fixado{selecionados.size > 1 ? 's' : ''})</span>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={alternarTodos} className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs">
            {todosSelecionados ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{todosSelecionados ? 'Desmarcar Todos' : 'Sincronizar Todos'}</span>
          </button>
          <button type="button" onClick={() => setExpandido(!expandido)} className="text-emerald-700 p-1">
            {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expandido && (
        <div className="divide-y divide-emerald-100 max-h-44 overflow-y-auto pr-1">
          {candidatos.map((ab: AbastecimentoItem) => {
            const isSel = selecionados.has(ab.id);
            const isApoio = isVehicleOrTruck({ code: ab.maquina_codigo, name: ab.maquina_nome });
            return (
              <label key={ab.id} className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer text-[11px] ${isSel ? 'bg-emerald-100/70 font-semibold text-emerald-950' : 'hover:bg-emerald-100/30 text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={isSel} onChange={() => toggle(ab.id)} className="rounded text-emerald-600 cursor-pointer" />
                  <div>
                    <span className="font-mono font-bold text-gray-900 mr-1.5">{ab.maquina_codigo || 'Máq'}</span>
                    <span className="text-[10px] text-gray-500">({ab.data}) {isApoio ? '• Apoio' : '• Principal'}</span>
                    {isSel && <span className="ml-1.5 text-[9px] px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded font-bold">✓ Fixado</span>}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-gray-800 mr-2">{Number(ab.quantidade_litros).toFixed(1)} L</span>
                  <span className="text-emerald-800 font-bold">R$ {Number(ab.valor_total).toFixed(2)}</span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
