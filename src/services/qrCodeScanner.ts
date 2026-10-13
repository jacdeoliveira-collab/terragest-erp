import jsQR from 'jsqr';

export interface DadosNfceQrCode {
  chaveAcesso?: string;
  valorTotal?: number;
  data?: string;
  cnpjEmitente?: string;
  numeroDocumento?: string;
  urlBruta: string;
}

export function extrairDadosUrlNfce(url: string): DadosNfceQrCode | null {
  try {
    const matchP = url.match(/[?&]p=([^&]+)/i);
    if (!matchP) return null;

    const parts = decodeURIComponent(matchP[1]).split('|');
    const chave = parts[0]?.replace(/\D/g, '') || '';
    if (chave.length < 44) return null;

    const ano = `20${chave.slice(2, 4)}`;
    const mes = chave.slice(4, 6);
    const cnpjEmitente = chave.slice(6, 20);
    const numNf = parseInt(chave.slice(25, 34), 10);

    // No padrão SEFAZ QR v2: parte 4 ou 5 costuma ser o valor total
    let valorTotal: number | undefined;
    for (let i = 1; i < parts.length; i++) {
      const v = parseFloat(parts[i]);
      if (!isNaN(v) && v > 5 && v < 200000 && !parts[i].includes('-')) {
        valorTotal = v;
        break;
      }
    }

    return {
      chaveAcesso: chave,
      data: `${ano}-${mes}-01`,
      cnpjEmitente,
      numeroDocumento: isNaN(numNf) ? undefined : `NFC-e ${numNf}`,
      valorTotal,
      urlBruta: url
    };
  } catch {
    return null;
  }
}

export async function escanearQrCodeArquivo(arquivo: File): Promise<DadosNfceQrCode | null> {
  if (typeof window === 'undefined') return null;

  try {
    const bitmap = await createImageBitmap(arquivo);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(bitmap, 0, 0);

    // 1. Tentar com BarcodeDetector nativo do navegador (se suportado)
    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(canvas);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          const res = extrairDadosUrlNfce(barcodes[0].rawValue);
          if (res) return res;
        }
      } catch {
        // Fallback silencioso para jsQR
      }
    }

    // 2. Fallback para jsQR em escala completa
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, {
      inversionAttempts: 'attemptBoth'
    });

    if (code && code.data) {
      const res = extrairDadosUrlNfce(code.data);
      if (res) return res;
    }

    return null;
  } catch (err) {
    console.warn('QR Code não detectado na imagem:', err);
    return null;
  }
}
