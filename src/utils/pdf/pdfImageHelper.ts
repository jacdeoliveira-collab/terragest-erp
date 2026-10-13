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
