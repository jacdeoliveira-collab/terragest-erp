import { EmpresaAssinaturaUpload } from './EmpresaAssinaturaUpload';

export interface EmpresaTecnicoTabProps {
  responsavelTecnico: string;
  setResponsavelTecnico: (val: string) => void;
  registroCrea: string;
  setRegistroCrea: (val: string) => void;
  assinaturaUrl?: string | null;
  setAssinaturaUrl: (val: string | null) => void;
}

export const EmpresaTecnicoTab: React.FC<EmpresaTecnicoTabProps> = ({
  responsavelTecnico,
  setResponsavelTecnico,
  registroCrea,
  setRegistroCrea,
  assinaturaUrl,
  setAssinaturaUrl
}) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-800">
        <p className="font-semibold mb-0.5">Responsabilidade Técnica Operacional</p>
        <p className="text-[11px] text-blue-700">
          Estes dados identificam o Engenheiro ou Responsável Técnico perante o CREA/CAU na emissão de relatórios, ARTs e laudos operacionais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Nome do Responsável Técnico
          </label>
          <input
            type="text"
            value={responsavelTecnico}
            onChange={(e) => setResponsavelTecnico(e.target.value)}
            placeholder="Ex: Eng. Roberto Carlos de Oliveira"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Número de Registro (ex: CREA-MA / CAU)
          </label>
          <input
            type="text"
            value={registroCrea}
            onChange={(e) => setRegistroCrea(e.target.value)}
            placeholder="Ex: CREA-MA 12345/D"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      <EmpresaAssinaturaUpload assinaturaUrl={assinaturaUrl} onChangeAssinatura={setAssinaturaUrl} />
    </div>
  );
};
