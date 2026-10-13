import type { ServicoHorimetro } from '../../types/servicoHorimetro.types';

/**
 * Garante que os dados mais completos do serviço (como fotos e parcelas)
 * sejam recuperados mesmo se o item em tela estiver parcialmente preenchido.
 */
export function obterServicoCompleto(servico: ServicoHorimetro): ServicoHorimetro {
  try {
    const raw = localStorage.getItem('terragest_servicos_horimetro');
    if (raw) {
      const list = JSON.parse(raw) as ServicoHorimetro[];
      const match = list.find((s) => s.id === servico.id);
      if (match) {
        return {
          ...match,
          ...servico,
          foto_horimetro_inicial: servico.foto_horimetro_inicial || match.foto_horimetro_inicial,
          foto_horimetro_final: servico.foto_horimetro_final || match.foto_horimetro_final,
          fotos_trabalho: (servico.fotos_trabalho && servico.fotos_trabalho.length > 0)
            ? servico.fotos_trabalho
            : (match.fotos_trabalho || []),
          horimetro_inicial: servico.horimetro_inicial ?? match.horimetro_inicial,
          horimetro_final: servico.horimetro_final ?? match.horimetro_final
        };
      }
    }
  } catch {}
  return servico;
}
