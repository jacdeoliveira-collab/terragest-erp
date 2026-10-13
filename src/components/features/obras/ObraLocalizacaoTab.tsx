import React from 'react';

interface ObraLocalizacaoTabProps {
  enderecoCompleto: string;
  setEnderecoCompleto: (val: string) => void;
  dataInicio: string;
  setDataInicio: (val: string) => void;
  previsaoTermino: string;
  setPrevisaoTermino: (val: string) => void;
}

export const ObraLocalizacaoTab: React.FC<ObraLocalizacaoTabProps> = ({
  enderecoCompleto,
  setEnderecoCompleto,
  dataInicio,
  setDataInicio,
  previsaoTermino,
  setPrevisaoTermino
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Endereço Completo / Localização do Canteiro
        </label>
        <textarea
          rows={3}
          value={enderecoCompleto}
          onChange={(e) => setEnderecoCompleto(e.target.value)}
          placeholder="Ex: Rodovia SP-300, KM 145 - Fazenda Boa Vista, Bairro Rural, Campinas - SP"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Data de Início das Operações
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Previsão Contratual de Término
          </label>
          <input
            type="date"
            value={previsaoTermino}
            onChange={(e) => setPrevisaoTermino(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
