import { deduplicarServicos, sincronizarAdiantamentosServicos } from '../services/servicoDeduplicacaoHelper';
import { DEFAULT_LEGACY_TENANT } from '../utils/tenantFilter';
import type { ServicoHorimetro } from '../types/servicoHorimetro.types';

export function obterKeyStorage(tId: string | null): string {
  return `terragest_servicos_horimetro_${tId || DEFAULT_LEGACY_TENANT}`;
}

function limparFotoParaCache(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('data:image/') || url.length > 500) {
    return undefined;
  }
  return url;
}

export function sanitizarServicosParaCache(servicos: ServicoHorimetro[]): ServicoHorimetro[] {
  return servicos.map((s) => ({
    ...s,
    foto_horimetro_inicial: limparFotoParaCache(s.foto_horimetro_inicial),
    foto_horimetro_final: limparFotoParaCache(s.foto_horimetro_final),
    foto_cupom_combustivel: limparFotoParaCache(s.foto_cupom_combustivel),
    maquinas_itens: Array.isArray(s.maquinas_itens)
      ? s.maquinas_itens.map((m) => ({
          ...m,
          foto_horimetro_inicial: limparFotoParaCache(m.foto_horimetro_inicial),
          foto_horimetro_final: limparFotoParaCache(m.foto_horimetro_final),
        }))
      : s.maquinas_itens,
    fotos_trabalho: Array.isArray(s.fotos_trabalho)
      ? s.fotos_trabalho.map((f) => ({
          ...f,
          url: limparFotoParaCache(f.url) || '',
        }))
      : s.fotos_trabalho,
    adiantamentos_historico: Array.isArray(s.adiantamentos_historico)
      ? s.adiantamentos_historico.map((a) => ({
          ...a,
          comprovante_url: limparFotoParaCache(a.comprovante_url),
        }))
      : s.adiantamentos_historico,
  }));
}

export function salvarServicosCache(tId: string | null, lista: ServicoHorimetro[]): void {
  try {
    const key = obterKeyStorage(tId);
    const sanitizada = sanitizarServicosParaCache(lista);
    const limitada = sanitizada.slice(0, 40);
    localStorage.setItem(key, JSON.stringify(limitada));
  } catch (err) {
    console.warn('Aviso: Falha ao gravar cache local no localStorage:', err);
    try {
      localStorage.removeItem(obterKeyStorage(tId));
      localStorage.removeItem('terragest_servicos_horimetro');
    } catch {}
  }
}

export function obterServicosCache(tId: string | null): ServicoHorimetro[] {
  try {
    const key = obterKeyStorage(tId);
    const raw = localStorage.getItem(key) || localStorage.getItem('terragest_servicos_horimetro');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      sincronizarAdiantamentosServicos(parsed);
      const res = deduplicarServicos(parsed).lista;
      if (raw.includes('data:image/')) {
        salvarServicosCache(tId, res);
      }
      return res;
    }
  } catch {
    try {
      localStorage.removeItem(obterKeyStorage(tId));
    } catch {}
  }
  return [];
}
