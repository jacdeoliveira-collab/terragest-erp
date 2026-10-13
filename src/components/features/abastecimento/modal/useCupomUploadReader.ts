import { useState } from 'react';
import { comprimirImagem } from '../../../../services/comprovanteStorageService';
import { extrairTextoDePDF } from '../../../../services/pdfTextExtractor';
import { extrairTextoDeImagem } from '../../../../services/imageOcrExtractor';
import { escanearQrCodeArquivo } from '../../../../services/qrCodeScanner';
import { analisarTextoCupom, type DadosCupomExtraidos } from '../../../../services/cupomParserLocal';
import { uploadParaGoogleDrive } from '../../../../services/driveService';

interface Props {
  onDadosExtraidos: (dados: DadosCupomExtraidos) => void;
}

export function useCupomUploadReader({ onDadosExtraidos }: Props) {
  const [fotoCupomUrl, setFotoCupomUrl] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const processarArquivo = async (file: File) => {
    setUploadingFoto(true);
    setMensagemSucesso(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);

    // 1. Leitura e extração local com QR Code + OCR
    try {
      let qrDados = null;
      if (isImage) {
        qrDados = await escanearQrCodeArquivo(file);
      }

      let texto = '';
      if (isPdf) {
        texto = await extrairTextoDePDF(file);
      } else if (isImage) {
        texto = await extrairTextoDeImagem(file);
      }

      const dados = analisarTextoCupom(texto || '');
      if (qrDados) {
        if (qrDados.valorTotal && !dados.valorTotal) dados.valorTotal = qrDados.valorTotal;
        if (qrDados.numeroDocumento) dados.numeroDocumento = qrDados.numeroDocumento;
        if (qrDados.chaveAcesso) dados.chaveAcesso = qrDados.chaveAcesso;
        if (!dados.data && qrDados.data) dados.data = qrDados.data;
      }

      if (dados.valorTotal || dados.litros || dados.postoFornecedor || dados.numeroDocumento) {
        onDadosExtraidos(dados);
        const tipoDesc = qrDados ? 'QR Code & OCR' : (isPdf ? 'PDF' : 'Cupom');
        setMensagemSucesso(`${tipoDesc} processado com sucesso! Campos preenchidos automaticamente.`);
      }
    } catch (err: unknown) {
      console.warn('Aviso no leitor local:', err);
    }

    // 2. Compressão e persistência leve
    try {
      const urlFinal = await comprimirImagem(file);
      setFotoCupomUrl(urlFinal);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setFotoCupomUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }

    // 3. Upload automático para o Google Drive na pasta de Frota
    try {
      const driveRes = await uploadParaGoogleDrive(file, 'frota');
      if (driveRes.sucesso && driveRes.driveUrl) {
        setFotoCupomUrl(driveRes.driveUrl);
      }
    } catch (driveErr) {
      console.warn('Upload do cupom no Google Drive não concluído:', driveErr);
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleUploadFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
  };

  return { fotoCupomUrl, uploadingFoto, mensagemSucesso, handleUploadFoto, setFotoCupomUrl };
}
