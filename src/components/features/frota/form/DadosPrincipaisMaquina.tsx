import React, { useMemo } from 'react';
import { useCatalogoEquipamentos } from '../../../../hooks/useCatalogoEquipamentos';
import { isVehicleOrTruck, getMeasurementLabel } from '../../../../utils/equipmentMeasurement';

interface Props {
  name: string; setName: (val: string) => void;
  code: string; setCode: (val: string) => void;
  categoriaOpcao: string; setCategoriaOpcao: (val: string) => void;
  marca: string; setMarca: (val: string) => void;
  model: string; setModel: (val: string) => void;
  serialNumber: string; setSerialNumber: (val: string) => void;
  hourmeter: number; setHourmeter: (val: number) => void;
  potenciaHp: number; setPotenciaHp: (val: number) => void;
  combustivelPadrao: string; setCombustivelPadrao: (val: string) => void;
  capacidadeTanque: number; setCapacidadeTanque: (val: number) => void;
}

export const DadosPrincipaisMaquina: React.FC<Props> = ({
  name, setName, code, setCode, categoriaOpcao, setCategoriaOpcao,
  marca, setMarca, model, setModel, serialNumber, setSerialNumber, hourmeter, setHourmeter,
  potenciaHp, setPotenciaHp, combustivelPadrao, setCombustivelPadrao, capacidadeTanque, setCapacidadeTanque
}) => {
  const { catalogo } = useCatalogoEquipamentos();

  const marcasSugeridas = useMemo(() => {
    const list = catalogo.filter((c) => !categoriaOpcao || c.categoria === categoriaOpcao);
    return Array.from(new Set(list.map((c) => c.marca))).filter(Boolean);
  }, [catalogo, categoriaOpcao]);

  const modelosSugeridos = useMemo(() => {
    const list = catalogo.filter((c) => {
      const matchCat = !categoriaOpcao || c.categoria === categoriaOpcao;
      const matchMarca = !marca || c.marca.toLowerCase() === marca.trim().toLowerCase();
      return matchCat && matchMarca;
    });
    return Array.from(new Set(list.map((c) => c.modelo))).filter(Boolean);
  }, [catalogo, categoriaOpcao, marca]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Nome / Identificação *</label>
        <input
          required placeholder="Ex: Trator de Esteira Cat D6T" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Código / Prefixo Frota</label>
          <input
            placeholder="Ex: TRAT-01" value={code} onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Categoria Operacional *</label>
          <select
            value={categoriaOpcao} onChange={(e) => setCategoriaOpcao(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="LINHA_AMARELA">Linha Amarela (Escavadeira, Trator, Pá)</option>
            <option value="CAMINHAO_TRANSPORTE">Caminhão / Basculante</option>
            <option value="EQUIPAMENTO_APOIO">Equipamento de Apoio (Gerador, Compressor)</option>
            <option value="VEICULO_LEVE">Veículo Leve / Utilitário de Obra</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Fabricante / Marca *</label>
          <input
            required list="lista-marcas-equipamentos" placeholder="Ex: Caterpillar" value={marca} onChange={(e) => setMarca(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
          <datalist id="lista-marcas-equipamentos">{marcasSugeridas.map((m) => <option key={m} value={m} />)}</datalist>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Modelo *</label>
          <input
            required list="lista-modelos-equipamentos" placeholder="Ex: 320D" value={model} onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          />
          <datalist id="lista-modelos-equipamentos">{modelosSugeridos.map((mod) => <option key={mod} value={mod} />)}</datalist>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Número de Série / PIN *</label>
          <input
            required placeholder="Ex: CAT0320D9821" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {getMeasurementLabel({ category: categoriaOpcao, name, code }, 'inicial')}
          </label>
          <input
            type="number"
            step={isVehicleOrTruck({ category: categoriaOpcao, name, code }) ? "1" : "0.1"}
            min="0"
            value={hourmeter}
            onChange={(e) => setHourmeter(parseFloat(e.target.value) || 0)}
            placeholder={isVehicleOrTruck({ category: categoriaOpcao, name, code }) ? "Ex: 158420" : "Ex: 0.0"}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Potência (HP)</label>
          <input
            type="number" step="1" placeholder="Ex: 148" value={potenciaHp || ''} onChange={(e) => setPotenciaHp(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Combustível</label>
          <select
            value={combustivelPadrao} onChange={(e) => setCombustivelPadrao(e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="DIESEL_S10">Diesel S10</option>
            <option value="DIESEL_S500">Diesel S500</option>
            <option value="GASOLINA">Gasolina Comum</option>
            <option value="ARLA_32">Arla 32</option>
            <option value="ELETRICO">Elétrico / Bateria</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Tanque (L)</label>
          <input
            type="number" placeholder="Ex: 400" value={capacidadeTanque || ''} onChange={(e) => setCapacidadeTanque(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
