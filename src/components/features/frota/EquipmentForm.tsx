import React, { useState } from 'react';
import { AlertCircle, Wrench, ShieldCheck } from 'lucide-react';
import { useCreateEquipment } from '../../../hooks/useCreateEquipment';
import { DadosPrincipaisMaquina } from './form/DadosPrincipaisMaquina';
import { DadosDocumentaisMaquina } from './form/DadosDocumentaisMaquina';

import { uploadParaGoogleDrive } from '../../../services/driveService';

interface EquipmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type TabType = 'principais' | 'documentais';

export const EquipmentForm: React.FC<EquipmentFormProps> = ({ onSuccess, onCancel }) => {
  const { createEquipment, isSubmitting, error, limparErro } = useCreateEquipment();
  const [activeTab, setActiveTab] = useState<TabType>('principais');
  const [uploadingDrive, setUploadingDrive] = useState(false);

  // Dados Principais
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [categoriaOpcao, setCategoriaOpcao] = useState('LINHA_AMARELA');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [hourmeter, setHourmeter] = useState<number>(0);

  // Compliance & Patrimônio (Blindagem Legal)
  const [chassi, setChassi] = useState('');
  const [renavam, setRenavam] = useState('');
  const [anoFabricacao, setAnoFabricacao] = useState('');
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
  const [driveUrlFoto, setDriveUrlFoto] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();

    let urlFinal = driveUrlFoto;
    if (arquivoFoto) {
      setUploadingDrive(true);
      const uploadRes = await uploadParaGoogleDrive(arquivoFoto, 'frota');
      setUploadingDrive(false);
      if (!uploadRes.sucesso || !uploadRes.driveUrl) {
        alert(`Erro no upload da foto para o Google Drive: ${uploadRes.erro || 'Falha ao salvar arquivo'}`);
        return;
      }
      urlFinal = uploadRes.driveUrl;
      setDriveUrlFoto(urlFinal);
    }

    const isDrone = categoriaOpcao === 'DRONE_AGRICOLA';

    const result = await createEquipment({
      code: code || `EQ-${Date.now().toString().slice(-4)}`,
      name,
      category: isDrone ? 'AGRICULTURAL_DRONE' : 'HEAVY_MACHINERY',
      type: categoriaOpcao,
      model,
      serial_number: serialNumber,
      chassi: chassi || undefined,
      renavam: renavam || undefined,
      ano_fabricacao: anoFabricacao ? Number(anoFabricacao) : undefined,
      drive_url_foto: urlFinal || undefined,
      current_hourmeter: hourmeter
    });

    if (result.success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Abas */}
      <div className="flex border-b border-gray-200 gap-2 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('principais')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'principais'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Dados Técnicos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documentais')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'documentais'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Compliance & Patrimônio</span>
        </button>
      </div>

      {/* Conteúdo */}
      {activeTab === 'principais' && (
        <DadosPrincipaisMaquina
          name={name} setName={setName}
          code={code} setCode={setCode}
          categoriaOpcao={categoriaOpcao} setCategoriaOpcao={setCategoriaOpcao}
          model={model} setModel={setModel}
          serialNumber={serialNumber} setSerialNumber={setSerialNumber}
          hourmeter={hourmeter} setHourmeter={setHourmeter}
        />
      )}

      {activeTab === 'documentais' && (
        <DadosDocumentaisMaquina
          chassi={chassi} setChassi={setChassi}
          renavam={renavam} setRenavam={setRenavam}
          anoFabricacao={anoFabricacao} setAnoFabricacao={setAnoFabricacao}
          arquivoFoto={arquivoFoto} setArquivoFoto={setArquivoFoto}
          driveUrlFoto={driveUrlFoto}
        />
      )}

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploadingDrive}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          {uploadingDrive ? 'Enviando ao Drive...' : isSubmitting ? 'Salvando...' : 'Cadastrar Máquina'}
        </button>
      </div>
    </form>
  );
};
