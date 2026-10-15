import type jsPDF from 'jspdf';
import type { TenantMaster } from '../../types/tenant.types';
import { getEmpresaAtivaCache } from '../../services/empresaAtivaService';
import { obterAssinaturaEmpresa } from './pdfLogoHelper';

export interface DadosAssinaturaEmpresa {
  razaoSocial: string;
  cnpj: string;
  responsavelTecnico: string;
  registroCrea: string;
  textoResponsavel: string;
  assinaturaUrl: string | null;
}

export function obterDadosAssinaturaEmpresa(
  empresaParam?: Partial<TenantMaster> | null
): DadosAssinaturaEmpresa {
  const empresa = empresaParam || getEmpresaAtivaCache() || {};
  const razaoSocial = empresa.razao_social || empresa.nome || 'J A C DE OLIVEIRA';
  const cnpj = empresa.cnpj ? `CNPJ: ${empresa.cnpj}` : '';
  const responsavelTecnico = empresa.responsavel_tecnico || '';
  const registroCrea = empresa.registro_crea || '';

  const partesResp: string[] = [];
  if (responsavelTecnico) partesResp.push(responsavelTecnico);
  if (registroCrea) partesResp.push(registroCrea);
  const textoResponsavel = partesResp.length > 0 ? `Resp. Técnico: ${partesResp.join(' • ')}` : '';

  const assinaturaUrl = obterAssinaturaEmpresa(empresa);

  return {
    razaoSocial,
    cnpj,
    responsavelTecnico,
    registroCrea,
    textoResponsavel,
    assinaturaUrl
  };
}

export function desenharAssinaturaDigital(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  empresaParam?: Partial<TenantMaster> | null
): boolean {
  const assinatura = obterAssinaturaEmpresa(empresaParam);
  if (!assinatura || !assinatura.trim()) return false;

  try {
    const isJpeg = assinatura.includes('image/jpeg') || assinatura.includes('image/jpg') || assinatura.endsWith('.jpg') || assinatura.endsWith('.jpeg');
    const formato = isJpeg ? 'JPEG' : 'PNG';
    doc.addImage(assinatura.trim(), formato, x, y, w, h);
    return true;
  } catch (err) {
    try {
      doc.addImage(assinatura.trim(), 'PNG', x, y, w, h);
      return true;
    } catch {
      console.warn('Não foi possível renderizar a assinatura digital no PDF:', err);
      return false;
    }
  }
}
