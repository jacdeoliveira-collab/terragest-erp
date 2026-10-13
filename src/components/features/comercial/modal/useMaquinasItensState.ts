import { useState, useEffect, useMemo } from 'react';
import type { ServicoHorimetro, ServicoMaquinaItem } from '../../../../types/servicoHorimetro.types';

function criarItemPadrao(id?: string, maqNome = '', opNome = '', vHora = 0, hIni = 0): ServicoMaquinaItem {
  return {
    id: id || (crypto.randomUUID ? crypto.randomUUID() : 'maq_' + Math.random().toString(36).substring(2, 9)),
    maquina_nome: maqNome,
    operador_nome: opNome,
    valor_hora: vHora,
    horimetro_inicial: hIni,
    horas_trabalhadas: 0,
    faturamento_bruto: 0
  };
}

export function useMaquinasItensState(servicoParaEditar?: ServicoHorimetro | null) {
  const [maquinasItens, setMaquinasItens] = useState<ServicoMaquinaItem[]>(() => {
    if (servicoParaEditar?.maquinas_itens && servicoParaEditar.maquinas_itens.length > 0) {
      return servicoParaEditar.maquinas_itens;
    }
    return [
      criarItemPadrao(
        undefined,
        servicoParaEditar?.maquina_nome || '',
        servicoParaEditar?.operador_nome || '',
        servicoParaEditar?.valor_hora || 0,
        servicoParaEditar?.horimetro_inicial || 0
      )
    ];
  });

  useEffect(() => {
    if (servicoParaEditar?.maquinas_itens && servicoParaEditar.maquinas_itens.length > 0) {
      setMaquinasItens(servicoParaEditar.maquinas_itens);
    } else if (servicoParaEditar) {
      setMaquinasItens([
        {
          id: 'maq_principal',
          maquina_id: servicoParaEditar.maquina_id,
          maquina_nome: servicoParaEditar.maquina_nome || '',
          operador_id: servicoParaEditar.operador_id,
          operador_nome: servicoParaEditar.operador_nome || '',
          valor_hora: servicoParaEditar.valor_hora || 0,
          horimetro_inicial: servicoParaEditar.horimetro_inicial || 0,
          horimetro_final: servicoParaEditar.horimetro_final,
          foto_horimetro_inicial: servicoParaEditar.foto_horimetro_inicial,
          foto_horimetro_final: servicoParaEditar.foto_horimetro_final,
          alerta_painel: servicoParaEditar.alerta_painel,
          horas_trabalhadas: servicoParaEditar.horas_trabalhadas || 0,
          faturamento_bruto: servicoParaEditar.faturamento_bruto || 0,
          valor_hora_operador: servicoParaEditar.valor_hora_operador,
          despesa_operador: servicoParaEditar.despesa_operador
        }
      ]);
    } else {
      setMaquinasItens([criarItemPadrao()]);
    }
  }, [servicoParaEditar]);

  const adicionarMaquina = () => {
    setMaquinasItens((prev) => [...prev, criarItemPadrao()]);
  };

  const removerMaquina = (id: string) => {
    setMaquinasItens((prev) => (prev.length > 1 ? prev.filter((m) => m.id !== id) : prev));
  };

  const atualizarMaquina = (id: string, updates: Partial<ServicoMaquinaItem>) => {
    setMaquinasItens((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates };
        const hIni = Number(merged.horimetro_inicial) || 0;
        const hFim = merged.horimetro_final !== undefined ? Number(merged.horimetro_final) : undefined;
        const horas = hFim !== undefined ? Math.max(0, Number((hFim - hIni).toFixed(1))) : 0;
        const vHora = Number(merged.valor_hora) || 0;
        const fat = Number((horas * vHora).toFixed(2));
        const vHoraOp = Number(merged.valor_hora_operador) || 0;
        const despOp = vHoraOp > 0 ? Number((horas * vHoraOp).toFixed(2)) : merged.despesa_operador;
        return { ...merged, horas_trabalhadas: horas, faturamento_bruto: fat, despesa_operador: despOp };
      })
    );
  };

  const totaisMaquinas = useMemo(() => {
    const horas = maquinasItens.reduce((acc, m) => acc + (Number(m.horas_trabalhadas) || 0), 0);
    const faturamento = maquinasItens.reduce((acc, m) => acc + (Number(m.faturamento_bruto) || 0), 0);
    const despesaOp = maquinasItens.reduce((acc, m) => acc + (Number(m.despesa_operador) || 0), 0);
    return {
      horasTotais: Number(horas.toFixed(1)),
      faturamentoTotal: Number(faturamento.toFixed(2)),
      despesaOperadorTotal: Number(despesaOp.toFixed(2)),
      nomesResumo: maquinasItens.map((m) => m.maquina_nome).filter(Boolean).join(' + ')
    };
  }, [maquinasItens]);

  return { maquinasItens, setMaquinasItens, adicionarMaquina, removerMaquina, atualizarMaquina, totaisMaquinas };
}
