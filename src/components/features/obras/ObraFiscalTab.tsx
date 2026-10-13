import React from 'react';

interface ObraFiscalTabProps {
  cno: string;
  setCno: (val: string) => void;
  artCrea: string;
  setArtCrea: (val: string) => void;
}

export const ObraFiscalTab: React.FC<ObraFiscalTabProps> = ({
  cno,
  setCno,
  artCrea,
  setArtCrea
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-800">
        <p className="font-semibold mb-0.5">Conformidade Legal & Fiscal da Obra</p>
        <p className="text-[11px] text-emerald-700">
          O CNO (Cadastro Nacional de Obras) e a ART vinculam as movimentações de máquinas e boletins ao centro de custo legal perante a Receita Federal e o CREA.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Inscrição CNO (Receita Federal)
          </label>
          <input
            type="text"
            value={cno}
            onChange={(e) => setCno(e.target.value)}
            placeholder="Ex: 00.000.00000/00"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Número da ART de Execução (CREA)
          </label>
          <input
            type="text"
            value={artCrea}
            onChange={(e) => setArtCrea(e.target.value)}
            placeholder="Ex: ART-SP 2026/0123456"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
