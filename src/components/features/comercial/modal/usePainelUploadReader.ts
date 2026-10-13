import { useState } from 'react';
import { comprimirImagem } from '../../../../services/comprovanteStorageService';
import { extrairTextoDeImagem } from '../../../../services/imageOcrExtractor';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import { analisarPainelHorimetro } from '../../../../services/painelHorimetroParser';

interface UsePainelUploadReaderProps {
  onHorimetroDetectado: (valor: number, campo: 'inicial' | 'final', maquinaId?: string) => void;
  onAlertaDetectado: (alerta: string) => void;
}

export function usePainelUploadReader({
  onHorimetroDetectado,
  onAlertaDetectado
}: UsePainelUploadReaderProps) {
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [mensagemOcr, setMensagemOcr] = useState<string | null>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(fieldName);
    setMensagemOcr(null);

    // 1. Comprime a imagem imediatamente para exibição e salvamento local leve
    let imagemBase64 = '';
    try {
      imagemBase64 = await comprimirImagem(file);
      setter(imagemBase64);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          imagemBase64 = reader.result;
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }

    // 2. Reconhecimento OCR Inteligente do Painel da Máquina / Veículo
    const isIni = fieldName === 'inicial' || fieldName.startsWith('ini');
    const isFim = fieldName === 'final' || fieldName.startsWith('fim');
    if (isIni || isFim) {
      const campo: 'inicial' | 'final' = isIni ? 'inicial' : 'final';
      const maquinaId = fieldName.includes('_') ? fieldName.substring(fieldName.indexOf('_') + 1) : undefined;
      try {
        const imagemParaOcr = imagemBase64 || file;
        const textoExtraido = await extrairTextoDeImagem(imagemParaOcr);
        if (textoExtraido && textoExtraido.trim().length > 0) {
          const dados = analisarPainelHorimetro(textoExtraido);

          if (dados.horimetro !== undefined) {
            onHorimetroDetectado(dados.horimetro, campo, maquinaId);
            setMensagemOcr(
              `Leitura do painel realizada! Horímetro ${campo} identificado: ${dados.horimetro}`
            );
          } else {
            setMensagemOcr('Foto anexada. Digite o horímetro se o reflexo impediu a leitura automática.');
          }

          if (dados.alertaPainel) {
            onAlertaDetectado(dados.alertaPainel);
          }
        } else {
          setMensagemOcr('Foto anexada. Digite o horímetro se o reflexo impediu a leitura automática.');
        }
      } catch (ocrErr) {
        console.warn('OCR do painel completou sem leitura automática:', ocrErr);
        setMensagemOcr('Foto anexada. Digite o valor do horímetro caso não tenha sido preenchido.');
      }
    }

    // 3. Tenta salvar no Google Drive caso a API esteja ativa no projeto
    try {
      const res = await uploadParaGoogleDrive(file, 'frota');
      if (res.sucesso && res.driveUrl) {
        setter(res.driveUrl);
      }
      // Se falhar no Drive (ex: API não ativada na GCP), a imagem já está salva em alta qualidade no estado/serviço
    } catch {
      // Ignora silenciosamente para não emitir alerta de console técnico ao operador
    } finally {
      setUploadingImage(null);
    }
  };

  return {
    uploadingImage,
    mensagemOcr,
    setMensagemOcr,
    handleImageUpload
  };
}
