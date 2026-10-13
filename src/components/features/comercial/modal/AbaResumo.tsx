import React from 'react';

interface AbaResumoProps {
  horasTrabalhadas: number;
  faturamentoBruto: number;
  despesasTotal: number;
  lucroLiquido: number;
  margemLucro: number;
  combustivelMaquinaLitros: number;
  combustivelMaquinaValor: number;
  combustivelApoioLitros: number;
  combustivelApoioValor: number;
  despesaOperador: number;
  despesaApoio: number;
  despesaManutencao: number;
  observacoes: string;
  setObservacoes: (v: string) => void;
}

export const AbaResumo: React.FC<AbaResumoProps> = ({
  horasTrabalhadas, faturamentoBruto, despesasTotal, lucroLiquido, margemLucro,
  combustivelMaquinaLitros, combustivelMaquinaValor,
  combustivelApoioLitros, combustivelApoioValor,
  despesaOperador, despesaApoio, despesaManutencao,
  observacoes, setObservacoes
}) => {
  return (
    <div className="space-y-4 text-xs text-left">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">Total Horas</span>
          <span className="text-base font-black text-gray-800 font-mono">{horasTrabalhadas.toFixed(1)} h</span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <span className="text-[10px] text-emerald-600 font-bold uppercase block">Faturamento</span>
          <span className="text-base font-black text-emerald-800 font-mono">
            R$ {faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
          <span className="text-[10px] text-rose-600 font-bold uppercase block">Total Despesas</span>
          <span className="text-base font-black text-rose-800 font-mono">
            R$ {despesasTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className={`p-3 border rounded-xl ${lucroLiquido >= 0 ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="text-[10px] font-bold uppercase block">Lucro Líquido</span>
          <span className="text-base font-black font-mono">
            R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] font-bold block mt-0.5">Margem: {margemLucro}%</span>
        </div>
      </div>

      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
        <span className="font-bold text-gray-700 block">Composição dos Custos Operacionais:</span>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">• Diesel Máquina S500 ({combustivelMaquinaLitros.toFixed(1)} L)</span>
          <span className="font-mono font-semibold">R$ {combustivelMaquinaValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">• Diesel Apoio S10 ({combustivelApoioLitros.toFixed(1)} L)</span>
          <span className="font-mono font-semibold">R$ {combustivelApoioValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">• Remuneração / Custo do Operador</span>
          <span className="font-mono font-semibold">R$ {despesaOperador.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-200">
          <span className="text-gray-600">• Logística, Frete Prancha & Apoio</span>
          <span className="font-mono font-semibold">R$ {despesaApoio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        {despesaManutencao > 0 && (
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-600">• Peças, Lubrificantes & Manutenção</span>
            <span className="font-mono font-semibold">R$ {despesaManutencao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Observações Operacionais</label>
        <textarea
          rows={2}
          placeholder="Observações sobre o serviço, condições do terreno ou manutenção"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl outline-none resize-none"
        />
      </div>
    </div>
  );
};
