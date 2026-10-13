import { useState, useEffect } from 'react';
import { useObraContext } from '../../../../contexts/ObraContext';
import type { ServicoHorimetro } from '../../../../types/servicoHorimetro.types';

export function useServicoDadosGeraisState(servicoParaEditar?: ServicoHorimetro | null) {
  const { obraSelecionada } = useObraContext();
  const [currentId, setCurrentId] = useState<string | undefined>(servicoParaEditar?.id);
  const [aba, setAba] = useState<'geral' | 'horimetros' | 'despesas' | 'fotos' | 'resumo'>('geral');
  const [clienteId, setClienteId] = useState(servicoParaEditar?.cliente_id || '');
  const [clienteNome, setClienteNome] = useState(servicoParaEditar?.cliente_nome || '');
  const [clienteDocumento, setClienteDocumento] = useState(servicoParaEditar?.cliente_documento || '');
  const [clienteTelefone, setClienteTelefone] = useState(servicoParaEditar?.cliente_telefone || '');
  const [obraId, setObraId] = useState(servicoParaEditar?.obra_id || obraSelecionada?.id || '');
  const [obraNome, setObraNome] = useState(servicoParaEditar?.obra_nome || obraSelecionada?.nome || '');
  const [descricaoServico, setDescricaoServico] = useState(servicoParaEditar?.descricao_servico || '');
  const [dataInicio, setDataInicio] = useState(servicoParaEditar?.data_inicio || new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(servicoParaEditar?.data_fim || '');
  const [alertaPainel, setAlertaPainel] = useState<string>(servicoParaEditar?.alerta_painel || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setCurrentId(servicoParaEditar?.id);
    setClienteId(servicoParaEditar?.cliente_id || '');
    setClienteNome(servicoParaEditar?.cliente_nome || '');
    setClienteDocumento(servicoParaEditar?.cliente_documento || '');
    setClienteTelefone(servicoParaEditar?.cliente_telefone || '');
    setObraId(servicoParaEditar?.obra_id || obraSelecionada?.id || '');
    setObraNome(servicoParaEditar?.obra_nome || obraSelecionada?.nome || '');
    setDescricaoServico(servicoParaEditar?.descricao_servico || '');
    setDataInicio(servicoParaEditar?.data_inicio || new Date().toISOString().split('T')[0]);
    setDataFim(servicoParaEditar?.data_fim || '');
    setAlertaPainel(servicoParaEditar?.alerta_painel || '');
    setAba('geral');
    setErro(null);
  }, [servicoParaEditar, obraSelecionada]);

  return {
    currentId, setCurrentId,
    aba, setAba,
    clienteId, setClienteId,
    clienteNome, setClienteNome,
    clienteDocumento, setClienteDocumento,
    clienteTelefone, setClienteTelefone,
    obraId, setObraId,
    obraNome, setObraNome,
    descricaoServico, setDescricaoServico,
    dataInicio, setDataInicio,
    dataFim, setDataFim,
    alertaPainel, setAlertaPainel,
    salvando, setSalvando,
    erro, setErro
  };
}
