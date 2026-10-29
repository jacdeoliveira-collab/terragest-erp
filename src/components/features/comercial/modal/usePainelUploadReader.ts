import { useState } from 'react';
import { comprimirImagem, salvarComprovante } from '../../../../services/comprovanteStorageService';
import { extrairTextoDeImagem } from '../../../../services/imageOcrExtractor';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import { analisarPainelHorimetro } from '../../../../services/painelHorimetroParser';
import { escanearQrCodeArquivo } from '../../../../services/qrCodeScanner';
import { analisarTextoCupom, type DadosCupomExtraidos } from '../../../../services/cupomParserLocal';

interface UsePainelUploadReaderProps {
  onHorimetroDetectado: (valor: number, campo: 'inicial' | 'final', maquinaId?: string) => void;
  onAlertaDetectado: (alerta: string) => void;
  onCupomDetectado?: (dados: DadosCupomExtraidos) => void;
}

export function usePainelUploadReader({
  onHorimetroDetectado,
  onAlertaDetectado,
  onCupomDetectado
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

    let imagemBase64 = '';
    try {
      imagemBase64 = await comprimirImagem(file);
    } catch {
      imagemBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.readAsDataURL(file);
      });
    }

    const chaveIdb = `idb://hor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (imagemBase64) {
      await salvarComprovante(chaveIdb, imagemBase64);
      setter(chaveIdb);
    }

    const isIni = fieldName === 'inicial' || fieldName.startsWith('ini');
    const isFim = fieldName === 'final' || fieldName.startsWith('fim');
    if (isIni || isFim) {
      const campo: 'inicial' | 'final' = isIni ? 'inicial' : 'final';
      const maquinaId = fieldName.includes('_') ? fieldName.substring(fieldName.indexOf('_') + 1) : undefined;
      try {
        const textoExtraido = await extrairTextoDeImagem(imagemBase64 || file);
        if (textoExtraido && textoExtraido.trim().length > 0) {
          const dados = analisarPainelHorimetro(textoExtraido);
          if (dados.horimetro !== undefined) {
            onHorimetroDetectado(dados.horimetro, campo, maquinaId);
            setMensagemOcr(`Leitura realizada! Horímetro ${campo}: ${dados.horimetro}`);
          } else {
            setMensagemOcr('Foto anexada. Digite o horímetro se o reflexo impediu a leitura.');
          }
          if (dados.alertaPainel) onAlertaDetectado(dados.alertaPainel);
        }
      } catch {
        setMensagemOcr('Foto anexada com sucesso!');
      }
    } else if (fieldName === 'cupom' || fieldName.startsWith('cupom')) {
      try {
        let qrDados = null;
        if (file.type.startsWith('image/')) qrDados = await escanearQrCodeArquivo(file);
        const textoExtraido = await extrairTextoDeImagem(imagemBase64 || file);
        const dados = analisarTextoCupom(textoExtraido || '');
        if (qrDados) {
          if (qrDados.valorTotal && !dados.valorTotal) dados.valorTotal = qrDados.valorTotal;
          if (qrDados.numeroDocumento) dados.numeroDocumento = qrDados.numeroDocumento;
          if (!dados.data && qrDados.data) dados.data = qrDados.data;
        }
        if (dados.valorTotal || dados.litros || (dados.itens && dados.itens.length > 0)) {
          onCupomDetectado?.(dados);
          setMensagemOcr(`Cupom fiscal lido com sucesso!`);
        }
      } catch (err) {
        console.warn('OCR do cupom:', err);
      }
    }

    try {
      setMensagemOcr('Foto salva! Tentando sincronizar com Google Drive...');
      const timeoutPromise = new Promise<{ sucesso: boolean; erro: string }>((resolve) => {
        setTimeout(() => resolve({ sucesso: false, erro: 'Tempo limite ao conectar ao Drive' }), 4000);
      });
      const res = await Promise.race([uploadParaGoogleDrive(file, 'frota'), timeoutPromise]);
      if (res.sucesso && (res as any).driveUrl) {
        setter((res as any).driveUrl);
        setMensagemOcr('Foto sincronizada no Google Drive com sucesso!');
      } else {
        setMensagemOcr('Foto salva e vinculada com sucesso.');
      }
    } catch {
      setMensagemOcr('Foto salva e vinculada com sucesso.');
    } finally {
      setUploadingImage(null);
    }
  };


  return { uploadingImage, mensagemOcr, setMensagemOcr, handleImageUpload };
}
