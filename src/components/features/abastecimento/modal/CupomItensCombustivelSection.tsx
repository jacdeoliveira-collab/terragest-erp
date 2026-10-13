import React from 'react';
import { Fuel, Plus } from 'lucide-react';
import type { Equipment } from '../../../../types/equipment.types';
import type { TipoCombustivel } from '../../../../types/abastecimento.types';
import { CupomItemPrincipalCard } from './CupomItemPrincipalCard';
import { CupomItemApoioCard } from './CupomItemApoioCard';

interface CupomItensCombustivelSectionProps {
  equipments: Equipment[];
  maquinaId: string; setMaquinaId: (val: string) => void;
  horimetro: number; setHorimetro: (val: number) => void;
  tipoCombMaq: TipoCombustivel; setTipoCombMaq: (val: TipoCombustivel) => void;
  litrosMaq: number; setLitrosMaq: (val: number) => void;
  valorMaq: number; setValorMaq: (val: number) => void;
  incluirApoio: boolean; setIncluirApoio: (val: boolean) => void;
  veiculoApoioId: string; setVeiculoApoioId: (val: string) => void;
  kmApoio: number; setKmApoio: (val: number) => void;
  tipoCombApoio: TipoCombustivel; setTipoCombApoio: (val: TipoCombustivel) => void;
  litrosApoio: number; setLitrosApoio: (val: number) => void;
  valorApoio: number; setValorApoio: (val: number) => void;
}

export const CupomItensCombustivelSection: React.FC<CupomItensCombustivelSectionProps> = ({
  equipments, maquinaId, setMaquinaId, horimetro, setHorimetro, tipoCombMaq, setTipoCombMaq,
  litrosMaq, setLitrosMaq, valorMaq, setValorMaq, incluirApoio, setIncluirApoio,
  veiculoApoioId, setVeiculoApoioId, kmApoio, setKmApoio, tipoCombApoio, setTipoCombApoio,
  litrosApoio, setLitrosApoio, valorApoio, setValorApoio
}) => {
  const handleSelectMaq = (id: string) => {
    setMaquinaId(id);
    const eq = equipments.find((e) => e.id === id);
    if (eq?.current_hourmeter) setHorimetro(eq.current_hourmeter);
  };

  const handleSelectApoio = (id: string) => {
    setVeiculoApoioId(id);
    const eq = equipments.find((e) => e.id === id);
    if (eq?.current_hourmeter) setKmApoio(eq.current_hourmeter);
  };

  const totalLitros = (Number(litrosMaq) || 0) + (incluirApoio ? (Number(litrosApoio) || 0) : 0);
  const totalValor = (Number(valorMaq) || 0) + (incluirApoio ? (Number(valorApoio) || 0) : 0);

  return (
    <div className="space-y-3">
      {/* 2. Equipamento Principal */}
      <CupomItemPrincipalCard
        equipments={equipments}
        maquinaId={maquinaId}
        onSelectMaq={handleSelectMaq}
        tipoComb={tipoCombMaq}
        setTipoComb={setTipoCombMaq}
        horimetro={horimetro}
        setHorimetro={setHorimetro}
        litros={litrosMaq}
        setLitros={setLitrosMaq}
        valor={valorMaq}
        setValor={setValorMaq}
      />

      {/* 3. Veículo de Apoio */}
      {incluirApoio ? (
        <CupomItemApoioCard
          equipments={equipments}
          veiculoApoioId={veiculoApoioId}
          onSelectApoio={handleSelectApoio}
          tipoComb={tipoCombApoio}
          setTipoComb={setTipoCombApoio}
          km={kmApoio}
          setKm={setKmApoio}
          litros={litrosApoio}
          setLitros={setLitrosApoio}
          valor={valorApoio}
          setValor={setValorApoio}
          onRemover={() => setIncluirApoio(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIncluirApoio(true)}
          className="w-full py-2.5 px-4 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Incluir Combustível da Caminhonete / Veículo de Apoio no mesmo Cupom</span>
        </button>
      )}

      {/* Resumo do Cupom */}
      <div className="p-3.5 bg-emerald-950 text-white rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <Fuel className="w-4 h-4 text-emerald-400" />
          <span className="font-medium text-emerald-200">Volume Total:</span>
          <span className="font-mono font-bold text-white text-sm">{totalLitros.toFixed(2)} L</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Total a Pagar / Despesa</span>
          <span className="text-base font-bold font-mono text-emerald-400">R$ {totalValor.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
