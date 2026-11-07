import { createWorker } from 'tesseract.js';

/**
 * Pré-processa a imagem no navegador e valida se o arquivo é uma imagem decodificável
 * antes de enviá-lo ao worker do Tesseract (evitando Uncaught Error no worker).
 */
async function preProcessarImagemParaOcr(
  arquivo: File | Blob | string | HTMLCanvasElement
): Promise<string | HTMLCanvasElement | null> {
  if (typeof window === 'undefined') return null;
  if (arquivo instanceof HTMLCanvasElement) return arquivo;

  if (typeof arquivo === 'string') {
    if (arquivo.startsWith('data:image/')) return arquivo;
    return null;
  }

  if (arquivo instanceof Blob) {
    if (arquivo.type && !arquivo.type.startsWith('image/')) return null;
    if (arquivo.size < 64) return null;
  }

  try {
    const bitmap = await createImageBitmap(arquivo);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

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
  } catch {
    return null;
  }
}

export async function extrairTextoDeImagem(
  arquivo: File | Blob | string | HTMLCanvasElement,
  onProgress?: (progresso: number) => void
): Promise<string> {
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    const entrada = await preProcessarImagemParaOcr(arquivo);
    if (!entrada) return '';

    worker = await createWorker('por');
    const ret = await worker.recognize(entrada);
    if (onProgress) onProgress(100);
    return ret.data.text || '';
  } catch {
    return '';
  } finally {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
  }
}
