import { useState } from 'react';
import { extrairTextoDePDF } from '../../../services/pdfTextExtractor';
import { extrairTextoDeImagem } from '../../../services/imageOcrExtractor';
import { comprimirImagem } from '../../../services/comprovanteStorageService';
import { analisarNfAlmoxarifado, type DadosNfAlmoxarifadoExtraidos } from '../../../services/almoxarifadoParserLocal';

interface Props {
  onDadosExtraidos: (dados: DadosNfAlmoxarifadoExtraidos) => void;
}

export function useAlmoxarifadoOcrReader({ onDadosExtraidos }: Props) {
  const [comprovanteUrl, setComprovanteUrl] = useState('');
  const [lendoOcr, setLendoOcr] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const processarArquivo = async (file: File) => {
    setLendoOcr(true);
    setMensagemSucesso(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name);

    // 1. Leitura 100% Local com OCR / PDF
    try {
      let texto = '';
      if (isPdf) {
        texto = await extrairTextoDePDF(file);
      } else if (isImage) {
        texto = await extrairTextoDeImagem(file);
      }

      if (texto && texto.trim().length > 0) {
        const dados = analisarNfAlmoxarifado(texto);
        onDadosExtraidos(dados);
        const tipoDesc = isPdf ? 'PDF da Nota Fiscal' : 'Foto da Nota / Ticket';
        setMensagemSucesso(`${tipoDesc} lido com sucesso! Dados preenchidos automaticamente.`);
      }
    } catch (err: unknown) {
      console.warn('Aviso no leitor local do almoxarifado:', err);
    }

    // 2. Compressão e visualização rápida
    try {
      const urlFinal = await comprimirImagem(file);
      setComprovanteUrl(urlFinal);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setComprovanteUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setLendoOcr(false);
    }
  };

  const handleUploadArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processarArquivo(file);
  };

  return { comprovanteUrl, lendoOcr, mensagemSucesso, handleUploadArquivo, setComprovanteUrl };
}
