import type jsPDF from 'jspdf';
import type { TenantMaster } from '../../types/tenant.types';
import { getEmpresaAtivaCache } from '../../services/empresaAtivaService';

/**
 * Recupera com segurança a logomarca da empresa a partir do parâmetro,
 * do cache ou do armazenamento local (localStorage).
 */
export function obterLogoEmpresa(empresaParam?: Partial<TenantMaster> | null): string | null {
  if (empresaParam?.logo_url && empresaParam.logo_url.trim()) {
    return empresaParam.logo_url.trim();
  }

  const doCache = getEmpresaAtivaCache();
  if (doCache?.logo_url && doCache.logo_url.trim()) {
    return doCache.logo_url.trim();
  }

  if (typeof window === 'undefined') return null;

  const storageKeys = [
    'terragest_empresa_ativa_dados',
    'terragest_empresa_config',
    'terragest_tenant_ativo'
  ];

  for (const key of storageKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.logo_url && typeof parsed.logo_url === 'string' && parsed.logo_url.trim()) {
          return parsed.logo_url.trim();
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Detecta o formato da imagem (JPEG/PNG) para o jsPDF
 */
function obterFormatoImagem(src: string): 'JPEG' | 'PNG' | undefined {
  if (src.includes('data:image/jpeg') || src.includes('data:image/jpg') || src.endsWith('.jpg') || src.endsWith('.jpeg')) {
    return 'JPEG';
  }
  if (src.includes('data:image/png') || src.endsWith('.png')) {
    return 'PNG';
  }
  return undefined;
}

/**
 * Calcula a largura proporcional da logo dentro dos limites maxW e maxH
 */
export function calcularLarguraLogo(
  doc: jsPDF,
  maxW: number,
  maxH: number,
  empresaParam?: Partial<TenantMaster> | null
): number {
  const logo = obterLogoEmpresa(empresaParam);
  if (!logo) return 0;
  try {
    const props = (doc as any).getImageProperties(logo);
    if (props?.width && props?.height && props.width > 0 && props.height > 0) {
      const aspect = props.width / props.height;
      return aspect >= maxW / maxH ? maxW : Number((maxH * aspect).toFixed(1));
    }
  } catch {}
  return maxW;
}

/**
 * Desenha a logomarca no PDF preservando a proporção original (evita distorção de imagens quadradas/retangulares).
 * Retorna true se a logo foi desenhada com sucesso.
 */
export function desenharLogoNoPdf(
  doc: jsPDF,
  x: number,
  y: number,
  maxW: number,
  maxH: number,
  empresaParam?: Partial<TenantMaster> | null
): boolean {
  const logo = obterLogoEmpresa(empresaParam);
  if (!logo) return false;

  try {
    const formato = obterFormatoImagem(logo) || 'PNG';
    let renderW = maxW;
    let renderH = maxH;
    let renderY = y;
    const renderX = x;

    try {
      const props = (doc as any).getImageProperties(logo);
      if (props?.width && props?.height && props.width > 0 && props.height > 0) {
        const aspect = props.width / props.height;
        if (aspect >= maxW / maxH) {
          renderW = maxW;
          renderH = maxW / aspect;
          renderY = y + (maxH - renderH) / 2;
        } else {
          renderH = maxH;
          renderW = maxH * aspect;
        }
      }
    } catch {
      // Fallback para dimensões máximas se getImageProperties falhar
    }

    doc.addImage(logo, formato, renderX, renderY, renderW, renderH);
    return true;
  } catch (err) {
    try {
      doc.addImage(logo, 'PNG', x, y, maxW, maxH);
      return true;
    } catch {
      console.warn('Não foi possível renderizar a logo no PDF:', err);
      return false;
    }
  }
}

/**
 * Recupera com segurança a assinatura digital cadastrada da empresa
 */
export function obterAssinaturaEmpresa(empresa?: { assinatura_digital_url?: string | null } | null): string | null {
  if (empresa?.assinatura_digital_url && empresa.assinatura_digital_url.trim()) {
    return empresa.assinatura_digital_url.trim();
  }
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('terragest_empresa_ativa_dados');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.assinatura_digital_url && typeof parsed.assinatura_digital_url === 'string') {
        return parsed.assinatura_digital_url.trim();
      }
    }
  } catch {}
  return null;
}

