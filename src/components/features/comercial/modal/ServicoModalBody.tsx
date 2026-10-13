import React from 'react';
import { AbaDadosGerais } from './AbaDadosGerais';
import { AbaHorimetros } from './AbaHorimetros';
import { AbaDespesas } from './AbaDespesas';
import { AbaFotosEAdiantamento } from './AbaFotosEAdiantamento';
import { AbaResumo } from './AbaResumo';
import type { Cliente } from '../../../../types/comercial.types';

interface ServicoModalBodyProps {
  state: any;
  clientes: Cliente[];
  maquinasDisponiveis: string[];
  operadoresDisponiveis: string[];
  servicoId?: string;
  onAbrirNovoCliente: () => void;
  onAbrirNovaMaquina: () => void;
  onEditarCliente: (c: Cliente) => void;
  onSelectOperador?: (nome: string) => void;
}

export const ServicoModalBody: React.FC<ServicoModalBodyProps> = ({
  state,
  clientes,
  maquinasDisponiveis,
  operadoresDisponiveis,
  servicoId,
  onAbrirNovoCliente,
  onAbrirNovaMaquina,
  onEditarCliente,
  onSelectOperador,
}) => {
  return (
    <div className="p-5 overflow-y-auto space-y-4 flex-1 text-left">
      {state.aba === 'geral' && (
        <AbaDadosGerais
          clienteNome={state.clienteNome} setClienteNome={state.setClienteNome}
          clienteId={state.clienteId} setClienteId={state.setClienteId}
          setClienteDocumento={state.setClienteDocumento} setClienteTelefone={state.setClienteTelefone}
          obraId={state.obraId} setObraId={state.setObraId}
          obraNome={state.obraNome} setObraNome={state.setObraNome}
          maquinaNome={state.maquinaNome} setMaquinaNome={state.setMaquinaNome}
          operadorNome={state.operadorNome} setOperadorNome={state.setOperadorNome}
          descricaoServico={state.descricaoServico} setDescricaoServico={state.setDescricaoServico}
          dataInicio={state.dataInicio} setDataInicio={state.setDataInicio}
          dataFim={state.dataFim} setDataFim={state.setDataFim}
          clientes={clientes} maquinasDisponiveis={maquinasDisponiveis} operadoresDisponiveis={operadoresDisponiveis}
          onAbrirNovoCliente={onAbrirNovoCliente}
          onAbrirNovaMaquina={onAbrirNovaMaquina}
          onEditarCliente={onEditarCliente}
          onSelectOperador={onSelectOperador}
        />
      )}

      {state.aba === 'horimetros' && (
        <AbaHorimetros
          maquinasItens={state.maquinasItens}
          onAdicionarMaquina={state.adicionarMaquina}
          onRemoverMaquina={state.removerMaquina}
          onAtualizarMaquina={state.atualizarMaquina}
          maquinasDisponiveis={maquinasDisponiveis}
          operadoresDisponiveis={operadoresDisponiveis}
          onAbrirNovaMaquina={onAbrirNovaMaquina}
          alertaPainel={state.alertaPainel}
          setAlertaPainel={state.setAlertaPainel}
          horasTrabalhadas={state.horasTrabalhadas}
          faturamentoBruto={state.faturamentoBruto}
          mensagemOcr={state.mensagemOcr}
          handleImageUpload={state.handleImageUpload}
          fotosTrabalho={state.fotosTrabalho}
          setFotosTrabalho={state.setFotosTrabalho}
        />
      )}

      {state.aba === 'despesas' && (
        <AbaDespesas
          combustivelMaquinaLitros={state.combustivelMaquinaLitros} setCombustivelMaquinaLitros={state.setCombustivelMaquinaLitros}
          combustivelMaquinaValor={state.combustivelMaquinaValor} setCombustivelMaquinaValor={state.setCombustivelMaquinaValor}
          combustivelApoioLitros={state.combustivelApoioLitros} setCombustivelApoioLitros={state.setCombustivelApoioLitros}
          combustivelApoioValor={state.combustivelApoioValor} setCombustivelApoioValor={state.setCombustivelApoioValor}
          combustivelTotalValor={state.combustivelTotalValor} fotoCupom={state.fotoCupom} setFotoCupom={state.setFotoCupom}
          despesaOperador={state.despesaOperador} setDespesaOperador={state.setDespesaOperador}
          despesaApoio={state.despesaApoio} setDespesaApoio={state.setDespesaApoio}
          descricaoApoio={state.descricaoApoio} setDescricaoApoio={state.setDescricaoApoio}
          fornecedorApoio={state.fornecedorApoio} setFornecedorApoio={state.setFornecedorApoio}
          formaPagamentoApoio={state.formaPagamentoApoio} setFormaPagamentoApoio={state.setFormaPagamentoApoio}
          statusPagamentoApoio={state.statusPagamentoApoio} setStatusPagamentoApoio={state.setStatusPagamentoApoio}
          fotoCupomApoio={state.fotoCupomApoio} setFotoCupomApoio={state.setFotoCupomApoio}
          despesaManutencao={state.despesaManutencao} setDespesaManutencao={state.setDespesaManutencao}
          descricaoManutencao={state.descricaoManutencao} setDescricaoManutencao={state.setDescricaoManutencao}
          fornecedorManutencao={state.fornecedorManutencao} setFornecedorManutencao={state.setFornecedorManutencao}
          formaPagamentoManutencao={state.formaPagamentoManutencao} setFormaPagamentoManutencao={state.setFormaPagamentoManutencao}
          statusPagamentoManutencao={state.statusPagamentoManutencao} setStatusPagamentoManutencao={state.setStatusPagamentoManutencao}
          fotoCupomManutencao={state.fotoCupomManutencao} setFotoCupomManutencao={state.setFotoCupomManutencao}
          abastecimentosIds={state.abastecimentosIds} setAbastecimentosIds={state.setAbastecimentosIds}
          uploadingImage={state.uploadingImage} handleImageUpload={state.handleImageUpload}
          maquinaNome={state.maquinaNome} servicoId={servicoId}
          operadorNome={state.operadorNome} horasTrabalhadas={state.horasTrabalhadas}
          valorHoraOperador={state.valorHoraOperador}
        />
      )}

      {state.aba === 'fotos' && (
        <AbaFotosEAdiantamento
          clienteNome={state.clienteNome}
          clienteDocumento={state.clienteDocumento}
          clienteTelefone={state.clienteTelefone}
          descricaoServico={state.descricaoServico}
          faturamentoBruto={state.faturamentoBruto}
          adiantamentosHistorico={state.adiantamentosHistorico}
          onAdicionarAdiantamento={state.adicionarAdiantamento}
          onRemoverAdiantamento={state.removerAdiantamento}
          onSalvarSinal={state.handleSalvarSinal}
          pagamento={state}
        />
      )}

      {state.aba === 'resumo' && (
        <AbaResumo
          horasTrabalhadas={state.horasTrabalhadas} faturamentoBruto={state.faturamentoBruto}
          despesasTotal={state.despesasTotal} lucroLiquido={state.lucroLiquido} margemLucro={state.margemLucro}
          combustivelMaquinaLitros={state.combustivelMaquinaLitros} combustivelMaquinaValor={state.combustivelMaquinaValor}
          combustivelApoioLitros={state.combustivelApoioLitros} combustivelApoioValor={state.combustivelApoioValor}
          despesaOperador={state.despesaOperadorCalculada !== undefined ? state.despesaOperadorCalculada : state.despesaOperador}
          despesaApoio={state.despesaApoio}
          despesaManutencao={state.despesaManutencao} observacoes={state.observacoes} setObservacoes={state.setObservacoes}
        />
      )}
    </div>
  );
};
