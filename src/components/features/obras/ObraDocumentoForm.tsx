import React, { useState } from 'react';
import { Plus, Link2, FileCheck, Calendar, Building2 } from 'lucide-react';
import type { TipoDocumentoObra, CreateObraDocumentoDTO } from '../../../types/obras.types';

interface ObraDocumentoFormProps {
  onAdicionar: (doc: Omit<CreateObraDocumentoDTO, 'obra_id'>) => Promise<{ success: boolean; error?: string } | boolean>;
}

export const ObraDocumentoForm: React.FC<ObraDocumentoFormProps> = ({ onAdicionar }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoDocumentoObra>('LICENCA_AMBIENTAL');
  const [orgaoEmissor, setOrgaoEmissor] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !driveUrl) return;

    setIsSubmitting(true);
    const res = await onAdicionar({
      nome,
      tipo,
      orgao_emissor: orgaoEmissor,
      data_validade: dataValidade || undefined,
      drive_url: driveUrl
    });

    setIsSubmitting(false);
    const success = typeof res === 'boolean' ? res : res.success;
    if (success) {
      setNome('');
      setOrgaoEmissor('');
      setDataValidade('');
      setDriveUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3 text-xs text-left">
      <span className="font-bold text-gray-800 flex items-center gap-1.5 text-xs">
        <FileCheck className="w-4 h-4 text-emerald-600" />
        Anexar Nova Licença / Documento (Google Drive)
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2">
          <label className="block font-semibold text-gray-600 mb-1">Nome do Documento / Licença *</label>
          <input
            type="text"
            required
            placeholder="Ex: Licença de Instalação (LI) n° 458/2026"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-600 mb-1">Tipo de Documento *</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoDocumentoObra)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-900"
          >
            <option value="LICENCA_AMBIENTAL">Licença Ambiental (LP/LI/LO)</option>
            <option value="ART">ART (CREA)</option>
            <option value="CNO">CNO (Receita Federal)</option>
            <option value="ALVARA">Alvará de Construção</option>
            <option value="ASV">ASV (Supressão Vegetal)</option>
            <option value="OUTORGA_AGUA">Outorga de Água</option>
            <option value="PGR">PGR (Segurança do Trabalho)</option>
            <option value="PCMSO">PCMSO / SST</option>
            <option value="LTCAT">LTCAT / Laudo Técnico</option>
            <option value="OUTROS">Outros Documentos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-600 mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-gray-400" /> Órgão Emissor
          </label>
          <input
            type="text"
            placeholder="Ex: CETESB / IBAMA / CREA"
            value={orgaoEmissor}
            onChange={(e) => setOrgaoEmissor(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" /> Data de Validade
          </label>
          <input
            type="date"
            value={dataValidade}
            onChange={(e) => setDataValidade(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-gray-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-600 mb-1 flex items-center gap-1">
            <Link2 className="w-3 h-3 text-blue-600" /> Link Google Drive *
          </label>
          <input
            type="url"
            required
            placeholder="https://drive.google.com/..."
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono text-gray-900"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting || !nome || !driveUrl}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isSubmitting ? 'Salvando...' : 'Adicionar ao Acervo'}</span>
        </button>
      </div>
    </form>
  );
};
