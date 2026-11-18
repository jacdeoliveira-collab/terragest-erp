import type jsPDF from 'jspdf';

interface TerraGestPdfBridge {
  saveAndOpenPdf?: (base64Data: string, fileName: string) => void;
}

/**
 * Salva o PDF no navegador (Web) ou aciona a bridge nativa no APK Android (Capacitor WebView),
 * onde downloads via blob URL (<a download>) são ignorados pelo sistema.
 */
export function salvarPdf(doc: jsPDF, nomeArquivo: string): void {
  const bridge = typeof window !== 'undefined'
    ? (window as unknown as { TerraGestPdf?: TerraGestPdfBridge }).TerraGestPdf
    : undefined;

  if (bridge?.saveAndOpenPdf) {
    const dataUri = doc.output('datauristring');
    const base64 = dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
    bridge.saveAndOpenPdf(base64, nomeArquivo);
    return;
  }

  doc.save(nomeArquivo);
}

