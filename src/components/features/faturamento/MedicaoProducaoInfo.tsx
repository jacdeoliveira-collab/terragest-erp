import React from 'react';
import { Truck } from 'lucide-react';
import type { ProducaoMedicao } from '../../../hooks/useProducaoMedicao';

export const MedicaoProducaoInfo: React.FC<{ producao: ProducaoMedicao | null }> = ({ producao }) => {
  if (!producao) return null;
  return (
    <div className="mb-3 p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center gap-2">
      <Truck className="w-4 h-4 shrink-0 text-sky-600" />
      {producao.viagens > 0
        ? <span>Produção do período (Sinaleiro): <b>{producao.volumeM3.toLocaleString('pt-BR')} m³</b> em {producao.viagens} viagens — será registrada nas observações da medição.</span>
        : <span>Nenhum ticket de viagem registrado no Sinaleiro para esta obra/competência.</span>}
    </div>
  );
};
