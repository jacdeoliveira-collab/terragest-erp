import React from 'react';
import { EmpresaLogoUpload } from './EmpresaLogoUpload';

export interface EmpresaFiscalTabProps {
  razaoSocial: string;
  setRazaoSocial: (val: string) => void;
  cnpj: string;
  setCnpj: (val: string) => void;
  inscricaoEstadual: string;
  setInscricaoEstadual: (val: string) => void;
  inscricaoMunicipal: string;
  setInscricaoMunicipal: (val: string) => void;
  cnae: string;
  setCnae: (val: string) => void;
  logoUrl?: string | null;
  setLogoUrl: (val: string | null) => void;
}

export const EmpresaFiscalTab: React.FC<EmpresaFiscalTabProps> = ({
  razaoSocial,
  setRazaoSocial,
  cnpj,
  setCnpj,
  inscricaoEstadual,
  setInscricaoEstadual,
  inscricaoMunicipal,
  setInscricaoMunicipal,
  cnae,
  setCnae,
  logoUrl,
  setLogoUrl
}) => {
  return (
    <div className="space-y-4">
      <EmpresaLogoUpload logoUrl={logoUrl} onChangeLogo={setLogoUrl} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Razão Social / Nome Empresarial *
          </label>
          <input
            type="text"
            required
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            placeholder="Ex: Construtora e Terraplanagem Alfa LTDA"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            CNPJ *
          </label>
          <input
            type="text"
            required
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="00.000.000/0000-00"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Inscrição Estadual (IE)
          </label>
          <input
            type="text"
            value={inscricaoEstadual}
            onChange={(e) => setInscricaoEstadual(e.target.value)}
            placeholder="Ex: 123.456.789.000"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Inscrição Municipal (IM)
          </label>
          <input
            type="text"
            value={inscricaoMunicipal}
            onChange={(e) => setInscricaoMunicipal(e.target.value)}
            placeholder="Ex: 9876543-2"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            CNAE Principal
          </label>
          <input
            type="text"
            value={cnae}
            onChange={(e) => setCnae(e.target.value)}
            placeholder="Ex: 43.13-4-00 (Obras de terraplenagem)"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
