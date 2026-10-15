/**
 * Utilitário para conversão e pré-carregamento robusto de imagens para jsPDF
 */
export async function prepararImagemParaPdf(urlOrBase64?: string): Promise<string | null> {
  if (!urlOrBase64) return null;
  const src = urlOrBase64.trim();
  if (!src) return null;

  // Se já for data URL em JPEG ou PNG compatível
  if (src.startsWith('data:image/jpeg') || src.startsWith('data:image/png')) {
    return src;
  }

  let targetUrl = src;
  // Converte links do Google Drive para endpoint de thumbnail/imagem direta
  if (src.includes('drive.google.com')) {
    const match = src.match(/[-\w]{25,}/);
    if (match) {
      targetUrl = `https://drive.google.com/thumbnail?id=${match[0]}&sz=w800`;
    }
  }

  return new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 400;
        canvas.height = img.naturalHeight || img.height || 300;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch {
        tentarCarregarViaBlob(targetUrl).then(resolve);
      }
    };

    img.onerror = () => {
      tentarCarregarViaBlob(targetUrl).then(resolve);
    };

    img.src = targetUrl;
  });
}

async function tentarCarregarViaBlob(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Renderiza uma imagem no PDF preservando estritamente a proporção original (aspect ratio),
 * centralizando horizontal e verticalmente dentro da área delimitada (maxW, maxH).
 */
export function desenharImagemProporcional(
  doc: any,
  imgBase64: string,
  x: number,
  y: number,
  maxW: number,
  maxH: number
): { x: number; y: number; w: number; h: number } {
  let renderW = maxW;
  let renderH = maxH;
  let renderX = x;
  let renderY = y;

  try {
    const props = doc.getImageProperties ? doc.getImageProperties(imgBase64) : null;
    if (props?.width && props?.height && props.width > 0 && props.height > 0) {
      const aspect = props.width / props.height;
      if (aspect >= maxW / maxH) {
        renderW = maxW;
        renderH = maxW / aspect;
        renderX = x;
        renderY = y + (maxH - renderH) / 2;
      } else {
        renderH = maxH;
        renderW = maxH * aspect;
        renderX = x + (maxW - renderW) / 2;
        renderY = y;
      }
    }
  } catch {}

  const formato = imgBase64.includes('image/png') || imgBase64.endsWith('.png') ? 'PNG' : 'JPEG';
  try {
    doc.addImage(imgBase64, formato, renderX, renderY, renderW, renderH);
  } catch (err) {
    try {
      doc.addImage(imgBase64, 'JPEG', renderX, renderY, renderW, renderH);
    } catch (e2) {
      console.warn('Erro ao renderizar imagem proporcional:', e2);
    }
  }

  return { x: renderX, y: renderY, w: renderW, h: renderH };
}
