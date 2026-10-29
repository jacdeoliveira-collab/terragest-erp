const CHAVES_PRESERVADAS = new Set([
  'terragest_tenant_ativo_id',
  'terragest_empresa_ativa_dados',
  'terragest_obra_ativa'
]);

/**
 * Purgador resiliente de localStorage.
 * Garante que o navegador nunca exceda a cota por resquícios de fotos em Base64
 * ou listas antigas volumosas de serviços salvas em versões anteriores.
 */
export function purgarCachesPesadosLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const totalItens = localStorage.length;
    const chavesParaRemover: string[] = [];

    for (let i = 0; i < totalItens; i++) {
      const chave = localStorage.key(i);
      if (!chave) continue;

      if (CHAVES_PRESERVADAS.has(chave) || chave.startsWith('sb-')) {
        continue;
      }

      try {
        const valor = localStorage.getItem(chave);
        if (!valor) continue;

        // Se contiver dados em Base64 pesados ou for excessivamente volumoso (> 200 KB)
        const temBase64 = valor.includes('data:image/');
        const tamanhoKb = (valor.length * 2) / 1024;

        if (temBase64 || (tamanhoKb > 250 && !chave.startsWith('sb-'))) {
          chavesParaRemover.push(chave);
        }
      } catch {
        chavesParaRemover.push(chave);
      }
    }

    chavesParaRemover.forEach((chave) => {
      try {
        localStorage.removeItem(chave);
        console.warn(`[storagePurge] Item pesado removido do cache local: ${chave}`);
      } catch {}
    });
  } catch (err) {
    console.warn('[storagePurge] Falha na varredura preventiva de storage:', err);
  }
}
