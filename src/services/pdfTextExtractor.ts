import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extrairTextoDePDF(arquivo: File): Promise<string> {
  try {
    const arrayBuffer = await arquivo.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;

    let textoCompleto = '';

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      const stringsPagina = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter((str) => str.trim().length > 0);

      textoCompleto += stringsPagina.join(' ') + '\n';
    }

    return textoCompleto;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao processar arquivo PDF';
    throw new Error(`Erro na extração de texto do PDF: ${msg}`);
  }
}
