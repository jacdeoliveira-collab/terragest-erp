import { useState, useEffect } from 'react';
import { calcularMetricasServico } from '../../../../utils/servicoCalculos';
import { montarPayloadServico } from './servicoSalvarPayload';
import { usePainelUploadReader } from './usePainelUploadReader';
import { aplicarDadosCupomEmDespesas } from './servicoCupomHelper';
import { useServicoDespesasState } from './useServicoDespesasState';
import { useMaquinasItensState } from './useMaquinasItensState';
import { useServicoDadosGeraisState } from './useServicoDadosGeraisState';
import { useServicoPagamentoState } from './useServicoPagamentoState';
import type { ServicoHorimetro, ServicoMaquinaItem } from '../../../../types/servicoHorimetro.types';
import type { Funcionario } from '../../../../types/rh.types';

export function useServicoHorimetroModalState(
  servicoParaEditar: ServicoHorimetro | null | undefined,
  funcionarios: Funcionario[] = [],
  onSave: (servico: Partial<ServicoHorimetro>) => Promise<{ success: boolean; data?: ServicoHorimetro; error?: string }>,
  onClose: () => void
) {
  const gerais = useServicoDadosGeraisState(servicoParaEditar);
  const despesas = useServicoDespesasState(servicoParaEditar);
  const maquinas = useMaquinasItensState(servicoParaEditar);
  const pagamento = useServicoPagamentoState(servicoParaEditar);

  const [maquinaNome, setMaquinaNome] = useState(servicoParaEditar?.maquina_nome || '');
  const [operadorNome, setOperadorNome] = useState(servicoParaEditar?.operador_nome || '');
  const [operadorId, setOperadorId] = useState(servicoParaEditar?.operador_id || '');
  const [valorHoraOperador, setValorHoraOperador] = useState(servicoParaEditar?.valor_hora_operador || 0);
  const [valorHora, setValorHora] = useState<number>(servicoParaEditar?.valor_hora || 0);

  const horasTrabalhadas = maquinas.totaisMaquinas.horasTotais;
  const faturamentoBruto = maquinas.totaisMaquinas.faturamentoTotal;

  const aplicarOperador = (opNome: string) => {
    setOperadorNome(opNome);
    if (maquinas.maquinasItens.length > 0) {
      maquinas.atualizarMaquina(maquinas.maquinasItens[0].id, { operador_nome: opNome });
    }
    const func = funcionarios.find((f) => f.nome?.trim().toLowerCase() === opNome.trim().toLowerCase());
    if (func) {
      if (func.id) setOperadorId(func.id);
      const vHoraOp = Number(func.custo_hora_normal) || 0;
      setValorHoraOperador(vHoraOp);
      if (vHoraOp > 0 && horasTrabalhadas > 0) {
        despesas.setDespesaOperador(Number((horasTrabalhadas * vHoraOp).toFixed(2)));
      }
    } else {
      setOperadorId('');
      setValorHoraOperador(0);
    }
  };

  const atualizarMaquinaSincronizada = (id: string, updates: Partial<ServicoMaquinaItem>) => {
    maquinas.atualizarMaquina(id, updates);
    if (maquinas.maquinasItens[0]?.id === id) {
      if (updates.maquina_nome !== undefined) setMaquinaNome(updates.maquina_nome);
      if (updates.operador_nome !== undefined) aplicarOperador(updates.operador_nome);
      if (updates.valor_hora !== undefined) setValorHora(updates.valor_hora);
    }
  };

  const { uploadingImage, mensagemOcr, setMensagemOcr, handleImageUpload } = usePainelUploadReader({
    onHorimetroDetectado: (valor, campo, maquinaId) => {
      const targetId = maquinaId || maquinas.maquinasItens[0]?.id;
      if (targetId) atualizarMaquinaSincronizada(targetId, campo === 'inicial' ? { horimetro_inicial: valor } : { horimetro_final: valor });
    },
    onAlertaDetectado: (alerta) => gerais.setAlertaPainel((prev) => (prev ? `${prev} | ${alerta}` : alerta)),
    onCupomDetectado: (dados) => aplicarDadosCupomEmDespesas(dados, despesas)
  });

  useEffect(() => {
    if (valorHoraOperador > 0 && horasTrabalhadas > 0) {
      despesas.setDespesaOperador(Number((horasTrabalhadas * valorHoraOperador).toFixed(2)));
    }
  }, [valorHoraOperador, horasTrabalhadas]);

  useEffect(() => {
    setMaquinaNome(servicoParaEditar?.maquina_nome || '');
    setOperadorNome(servicoParaEditar?.operador_nome || '');
    setOperadorId(servicoParaEditar?.operador_id || '');
    setValorHoraOperador(servicoParaEditar?.valor_hora_operador || 0);
    setValorHora(servicoParaEditar?.valor_hora || 0);
    setMensagemOcr(null);
  }, [servicoParaEditar, setMensagemOcr]);

  const metricas = calcularMetricasServico({
    horimetroInicial: 0,
    horimetroFinal: horasTrabalhadas,
    valorHora: valorHora > 0 ? valorHora : (maquinas.maquinasItens[0]?.valor_hora || 0),
    combustivelMaquinaValor: despesas.combustivelMaquinaValor,
    combustivelApoioValor: despesas.combustivelApoioValor,
    despesaOperador: despesas.despesaOperador,
    despesaApoio: despesas.despesaApoio,
    despesaManutencao: despesas.despesaManutencao,
    valorHoraOperador,
    valorAdiantamentoCliente: despesas.valorAdiantamento
  });

  metricas.faturamentoBruto = faturamentoBruto > 0 ? faturamentoBruto : metricas.faturamentoBruto;
  metricas.lucroLiquido = Number((metricas.faturamentoBruto - metricas.despesasTotal).toFixed(2));
  metricas.margemLucro = metricas.faturamentoBruto > 0 ? Number(((metricas.lucroLiquido / metricas.faturamentoBruto) * 100).toFixed(1)) : 0;
  metricas.saldoRestanteCliente = Number(Math.max(0, metricas.faturamentoBruto - (despesas.valorAdiantamento || 0)).toFixed(2));

  const executarSalvar = async (finalizar: boolean, fechar: boolean) => {
    if (gerais.salvando) return false;
    if (!gerais.clienteNome.trim()) { gerais.setErro('Informe o cliente do serviço.'); return false; }
    const pMaq = maquinas.maquinasItens[0];
    const hInicial = pMaq ? Number(pMaq.horimetro_inicial) : 0;
    const hFinal = pMaq && pMaq.horimetro_final !== undefined ? Number(pMaq.horimetro_final) : undefined;
    const vHoraPrincipal = pMaq && Number(pMaq.valor_hora) > 0 ? Number(pMaq.valor_hora) : valorHora;
    gerais.setSalvando(true); gerais.setErro(null);

    const payload = montarPayloadServico(gerais.currentId || servicoParaEditar?.id, finalizar, {
      clienteId: gerais.clienteId, clienteNome: gerais.clienteNome, clienteDocumento: gerais.clienteDocumento,
      clienteTelefone: gerais.clienteTelefone, obraId: gerais.obraId, obraNome: gerais.obraNome,
      maquinaNome: maquinas.totaisMaquinas.nomesResumo || maquinaNome.trim() || 'Equipamentos',
      operadorId, operadorNome, descricaoServico: gerais.descricaoServico,
      dataInicio: gerais.dataInicio, dataFim: gerais.dataFim,
      horimetroInicial: hInicial, horimetroFinal: hFinal,
      fotoHorimetroInicial: pMaq?.foto_horimetro_inicial, fotoHorimetroFinal: pMaq?.foto_horimetro_final,
      alertaPainel: gerais.alertaPainel, valorHora: vHoraPrincipal, valorHoraOperador,
      ...despesas, ...pagamento,
      despesasItens: despesas.getDespesasItensMontados(gerais.dataInicio),
      maquinasItens: maquinas.maquinasItens
    }, { ...metricas, horasTrabalhadas });

    const res = await onSave(payload);
    gerais.setSalvando(false);
    if (res.success) {
      if (res.data?.id) gerais.setCurrentId(res.data.id);
      if (fechar) onClose();
      return true;
    }
    gerais.setErro(res.error || 'Erro ao salvar o serviço.');
    return false;
  };

  return {
    ...gerais, ...despesas, ...maquinas, ...pagamento,
    maquinaNome, setMaquinaNome: (n: string) => { setMaquinaNome(n); if (maquinas.maquinasItens.length > 0) maquinas.atualizarMaquina(maquinas.maquinasItens[0].id, { maquina_nome: n }); },
    operadorId, setOperadorId, operadorNome, setOperadorNome: aplicarOperador, aplicarOperador,
    valorHoraOperador, setValorHoraOperador,
    valorHora, setValorHora: (v: number) => { setValorHora(v); if (maquinas.maquinasItens.length > 0) maquinas.atualizarMaquina(maquinas.maquinasItens[0].id, { valor_hora: v }); },
    atualizarMaquina: atualizarMaquinaSincronizada, uploadingImage, mensagemOcr,
    ...metricas, horasTrabalhadas, faturamentoBruto: metricas.faturamentoBruto, handleImageUpload,
    handleSalvar: (finalizar: boolean) => executarSalvar(finalizar, true),
    handleSalvarSinal: () => executarSalvar(false, false)
  };
}
