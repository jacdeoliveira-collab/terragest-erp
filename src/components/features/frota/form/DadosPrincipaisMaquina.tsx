import React from 'react';

interface DadosPrincipaisMaquinaProps {
  name: string;
  setName: (val: string) => void;
  code: string;
  setCode: (val: string) => void;
  categoriaOpcao: string;
  setCategoriaOpcao: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
  serialNumber: string;
  setSerialNumber: (val: string) => void;
  hourmeter: number;
  setHourmeter: (val: number) => void;
}

export const DadosPrincipaisMaquina: React.FC<DadosPrincipaisMaquinaProps> = ({
  name,
  setName,
  code,
  setCode,
  categoriaOpcao,
  setCategoriaOpcao,
  model,
  setModel,
  serialNumber,
  setSerialNumber,
  hourmeter,
  setHourmeter
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Nome / Identificação *</label>
        <input
          required
          placeholder="Ex: Trator de Esteira Cat D6T"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Código / Frota</label>
          <input
            placeholder="Ex: TRAT-01"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria *</label>
          <select
            value={categoriaOpcao}
            onChange={(e) => setCategoriaOpcao(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="LINHA_AMARELA">Linha Amarela (Pesado)</option>
            <option value="DRONE_AGRICOLA">Drone Agrícola</option>
            <option value="EQUIPAMENTO_APOIO">Equipamento de Apoio (Gerador)</option>
            <option value="VEICULO_LEVE">Veículo Leve / Utilitário</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Marca / Modelo *</label>
          <input
            required
            placeholder="Ex: Caterpillar 320D"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Número de Série *</label>
          <input
            required
            placeholder="Ex: CAT0320D9821"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Horímetro Inicial (h)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={hourmeter}
          onChange={(e) => setHourmeter(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};
