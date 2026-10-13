import React, { useState } from 'react';
import { Plus, Link2, FileCheck, Calendar, Building2 } from 'lucide-react';
import type { TipoDocumentoFuncionario, CreateFuncionarioDocumentoDTO } from '../../../types/funcionarioDocumentos.types';

interface FuncionarioDocumentoFormProps {
  onAdicionar: (doc: Omit<CreateFuncionarioDocumentoDTO, 'funcionario_id'>) => Promise<{ success: boolean; error?: string } | boolean>;
}

export const FuncionarioDocumentoForm: React.FC<FuncionarioDocumentoFormProps> = ({ onAdicionar }) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TipoDocumentoFuncionario>('ASO');
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
        Anexar Documento do Colaborador (Google Drive)
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="sm:col-span-2">
          <label className="block font-semibold text-gray-600 mb-1">Nome do Documento / Certificado *</label>
          <input
            type="text"
            required
            placeholder="Ex: Atestado de Saúde Ocupacional (ASO Periódico)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-600 mb-1">Tipo de Documento *</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoDocumentoFuncionario)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-900"
          >
            <option value="ASO">ASO (Saúde Ocupacional)</option>
            <option value="CNH">CNH (Habilitação Motorista/Operador)</option>
            <option value="FICHA_EPI">Ficha de Entrega de EPI</option>
            <option value="TREINAMENTO_NR">Treinamento / Certificado NR</option>
            <option value="CONTRATO">Contrato de Trabalho / CTPS</option>
            <option value="CERTIFICADO">Certificado de Operador</option>
            <option value="OUTROS">Outros Documentos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-600 mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-gray-400" /> Órgão / Clínica Emissora
          </label>
          <input
            type="text"
            placeholder="Ex: Clínica SST / DETRAN / SENAI"
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
            <Link2 className="w-3 h-3 text-emerald-600" /> Link Drive *
          </label>
          <input
            type="url"
            required
            placeholder="https://drive.google.com/..."
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          {isSubmitting ? 'Salvando...' : 'Salvar Documento'}
        </button>
      </div>
    </form>
  );
};
