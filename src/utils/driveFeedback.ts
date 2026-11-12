/**
 * Exibe alerta imediato e claro ao usuário quando o envio de um arquivo/foto
 * para o Google Drive falha, evitando perda silenciosa de comprovantes.
 */
export function notificarFalhaDrive(erro?: string, salvouLocal = false): void {
  const detalhe = erro || 'Conexão com o Google Drive expirada ou indisponível.';
  const localMsg = salvouLocal
    ? '\n\n⚠️ O arquivo foi guardado apenas localmente neste navegador (NÃO está na nuvem).'
    : '\n\n❌ O arquivo NÃO foi anexado!';

  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(
      `⚠️ Falha ao enviar foto para o Google Drive!${localMsg}\n\nMotivo: ${detalhe}\n\nPara corrigir: vá em Minha Empresa > Bancos e Drive e clique em "Reconectar Google Drive".`
    );
  }
}
