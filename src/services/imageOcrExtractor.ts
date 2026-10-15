import { createWorker } from 'tesseract.js';

/**
 * Pré-processa a imagem no navegador (upscaling suave para imagens de baixa resolução
 * e calibração de escala de cinza) para maximizar o reconhecimento do OCR em DANFEs e cupons.
 */
async function preProcessarImagemParaOcr(arquivo: File | Blob | string | HTMLCanvasElement): Promise<HTMLCanvasElement | File | Blob | string> {
  if (typeof window === 'undefined' || typeof arquivo === 'string' || (arquivo instanceof HTMLCanvasElement)) return arquivo;

  try {
    const bitmap = await createImageBitmap(arquivo);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return arquivo;

    // Resolução calibrada para OCR rápido sem estourar memória em celulares
    const maxDim = 1100;
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > maxDim || height > maxDim) {
      if (width > height) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(bitmap, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    // Aumento de contraste para display digital e papel
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const contrast = (gray - 128) * 1.25 + 128;
      const finalVal = Math.min(255, Math.max(0, contrast));
      d[i] = finalVal;
      d[i + 1] = finalVal;
      d[i + 2] = finalVal;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch (err: unknown) {
    console.warn('Fallback para imagem original sem pré-processamento:', err);
    return arquivo;
  }
}

export async function extrairTextoDeImagem(
  arquivo: File | Blob | string | HTMLCanvasElement,
  onProgress?: (progresso: number) => void
): Promise<string> {
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    const entrada = await preProcessarImagemParaOcr(arquivo);
    worker = await createWorker('por');
    const ret = await worker.recognize(entrada);
    if (onProgress) onProgress(100);
    return ret.data.text || '';
  } catch (err: unknown) {
    console.warn('Tentando OCR com fallback eng ou seguro:', err);
    try {
      if (worker) await worker.terminate().catch(() => {});
      worker = await createWorker('eng');
      const ret = await worker.recognize(arquivo);
      return ret.data.text || '';
    } catch (fallbackErr: unknown) {
      console.warn('Falha suave no reconhecimento ótico (não bloqueia upload):', fallbackErr);
      return '';
    }
  } finally {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
  }
}
