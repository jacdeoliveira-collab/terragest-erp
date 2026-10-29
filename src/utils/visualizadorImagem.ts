import { obterComprovante } from '../services/comprovanteStorageService';

function renderizarJanelaVisualizador(imgSrc: string, titulo: string): void {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.title = titulo;
  win.document.body.style.margin = '0';
  win.document.body.style.backgroundColor = '#0f172a';
  win.document.body.style.display = 'flex';
  win.document.body.style.flexDirection = 'column';
  win.document.body.style.alignItems = 'center';
  win.document.body.style.justifyContent = 'center';
  win.document.body.style.height = '100vh';
  win.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  const toolbar = win.document.createElement('div');
  toolbar.style.position = 'fixed';
  toolbar.style.top = '12px';
  toolbar.style.left = '50%';
  toolbar.style.transform = 'translateX(-50%)';
  toolbar.style.background = 'rgba(30, 41, 59, 0.9)';
  toolbar.style.backdropFilter = 'blur(8px)';
  toolbar.style.color = '#f8fafc';
  toolbar.style.padding = '8px 16px';
  toolbar.style.borderRadius = '9999px';
  toolbar.style.fontSize = '12px';
  toolbar.style.fontWeight = '600';
  toolbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
  toolbar.innerText = titulo;

  const img = win.document.createElement('img');
  img.src = imgSrc;
  img.alt = titulo;
  img.style.maxWidth = '92vw';
  img.style.maxHeight = '88vh';
  img.style.objectFit = 'contain';
  img.style.borderRadius = '8px';
  img.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.7)';
  img.style.cursor = 'zoom-in';

  let ampliado = false;
  img.onclick = () => {
    ampliado = !ampliado;
    img.style.maxWidth = ampliado ? 'none' : '92vw';
    img.style.maxHeight = ampliado ? 'none' : '88vh';
    img.style.cursor = ampliado ? 'zoom-out' : 'zoom-in';
  };

  win.document.body.appendChild(toolbar);
  win.document.body.appendChild(img);
}

export async function abrirVisualizacaoImagem(url?: string, titulo = 'Comprovante / Foto'): Promise<void> {
  if (!url || typeof window === 'undefined') return;

  if (url.startsWith('idb://') || url.startsWith('ref_')) {
    const dados = await obterComprovante(url);
    if (dados) {
      renderizarJanelaVisualizador(dados, titulo);
      return;
    }
  }

  if (url.startsWith('data:image') || url.startsWith('blob:')) {
    renderizarJanelaVisualizador(url, titulo);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

