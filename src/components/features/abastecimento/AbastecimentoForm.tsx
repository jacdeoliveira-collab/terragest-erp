import React, { useState } from 'react';
import { AlertCircle, Wrench, Landmark } from 'lucide-react';
import { useEquipments } from '../../../hooks/useEquipments';
import { useFuncionarios } from '../../../hooks/useFuncionarios';
import { useCreateAbastecimento } from '../../../hooks/useCreateAbastecimento';
import { useServicosHorimetro } from '../../../hooks/useServicosHorimetro';
import { useObraContext } from '../../../contexts/ObraContext';
import { AbastecimentoIdentificacao } from './AbastecimentoIdentificacao';
import { AbastecimentoDataHorimetro } from './AbastecimentoDataHorimetro';
import { AbastecimentoValores } from './AbastecimentoValores';
import { AbastecimentoLubrificacao } from './AbastecimentoLubrificacao';
import { ObraNaoSelecionadaAviso } from './ObraNaoSelecionadaAviso';
import { EmprestimoFieldsBox } from '../../common/EmprestimoFieldsBox';
import type { TipoCombustivel, OrigemAbastecimento } from '../../../types/abastecimento.types';

interface AbastecimentoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AbastecimentoForm: React.FC<AbastecimentoFormProps> = ({ onSuccess, onCancel }) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const { obraSelecionada } = useObraContext();
  const { data: equipments, isLoading: loadingEquips } = useEquipments({ onlyActives: true });
  const { data: funcionarios, isLoading: loadingFuncs } = useFuncionarios({ onlyActives: true });
  const { servicos } = useServicosHorimetro();
  const { createAbastecimento, isSubmitting, error, limparErro } = useCreateAbastecimento();

  const [maquinaId, setMaquinaId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [operadorId, setOperadorId] = useState('');
  const [origem, setOrigem] = useState<OrigemAbastecimento>('POSTO');
  const [comboioId, setComboioId] = useState('');
  const [data, setData] = useState(new Date().toISOString().slice(0, 16));
  const [horimetro, setHorimetro] = useState<number>(0);
  const [tipoCombustivel, setTipoCombustivel] = useState<TipoCombustivel>('DIESEL_S10');
  const [litros, setLitros] = useState<number>(0);
  const [custoUnitario, setCustoUnitario] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [qtdOleo, setQtdOleo] = useState<number>(0);
  const [qtdGraxa, setQtdGraxa] = useState<number>(0);
  const [formaPag, setFormaPag] = useState('PIX');
  const [credorEmp, setCredorEmp] = useState('');
  const [dataEmp, setDataEmp] = useState(hoje);
  const [dataPagarEmp, setDataPagarEmp] = useState(hoje);

  if (!obraSelecionada) return <ObraNaoSelecionadaAviso onCancel={onCancel} />;

  const handleMaquinaSelect = (id: string) => {
    setMaquinaId(id);
    const equip = equipments.find((e) => e.id === id);
    if (equip) setHorimetro(equip.current_hourmeter);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    limparErro();
    const totalCalc = valorTotal > 0 ? valorTotal : Number((Number(litros || 0) * Number(custoUnitario || 0)).toFixed(2));
    const unitarioCalc = custoUnitario > 0 ? custoUnitario : Number(litros) > 0 ? Number((totalCalc / Number(litros)).toFixed(3)) : 0;

    const result = await createAbastecimento({
      obra_id: obraSelecionada.id, maquina_id: maquinaId, servico_id: servicoId || undefined,
      operador_id: operadorId || undefined, origem, comboio_id: origem === 'COMBOIO' ? comboioId : undefined,
      data: data.slice(0, 10), horimetro_momento: horimetro, tipo_combustivel: tipoCombustivel,
      quantidade_litros: litros, qtd_oleo_litros: qtdOleo, qtd_graxa_kg: qtdGraxa,
      valor_total: totalCalc, valor_unitario: unitarioCalc,
      forma_pagamento: formaPag, credor_emprestimo: credorEmp.trim() || undefined,
      data_emprestimo: dataEmp, data_pagar_emprestimo: dataPagarEmp
    });

    if (result.success) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left text-xs">
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" /><span>{error}</span>
        </div>
      )}

      <AbastecimentoIdentificacao
        maquinaId={maquinaId} onMaquinaSelect={handleMaquinaSelect}
        operadorId={operadorId} setOperadorId={setOperadorId}
        origem={origem} setOrigem={setOrigem} comboioId={comboioId} setComboioId={setComboioId}
        equipments={equipments} funcionarios={funcionarios}
        loadingEquips={loadingEquips} loadingFuncs={loadingFuncs}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 bg-amber-50/50 border border-amber-200 rounded-xl">
        <div>
          <label className="block text-[11px] font-semibold text-amber-900 mb-1 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-amber-600" /><span>Vincular a Serviço / Locação (Opcional)</span>
          </label>
          <select value={servicoId} onChange={(e) => setServicoId(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-900">
            <option value="">Nenhum (Apenas Frota / Canteiro Geral)</option>
            {servicos.map((s) => (<option key={s.id} value={s.id}>{s.cliente_nome} - {s.maquina_nome}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-amber-900 mb-1 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" /><span>De onde saiu o pagamento?</span>
          </label>
          <select value={formaPag} onChange={(e) => setFormaPag(e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900">
            <option value="PIX">🏦 Conta Bancária / PIX</option>
            <option value="DINHEIRO">💵 Dinheiro em Mãos (Caixa)</option>
            <option value="EMPRESTIMO">💸 Empréstimo (Pegou Emprestado)</option>
            <option value="CARTAO">💳 Cartão Débito / Crédito</option>
            <option value="BOLETO">📄 Boleto / A Prazo</option>
          </select>
        </div>
      </div>

      {formaPag === 'EMPRESTIMO' && (
        <EmprestimoFieldsBox
          compact
          credorNome={credorEmp} setCredorNome={setCredorEmp}
          dataEmprestimo={dataEmp} setDataEmprestimo={setDataEmp}
          dataPagamentoPrevista={dataPagarEmp} setDataPagamentoPrevista={setDataPagarEmp}
        />
      )}

      <AbastecimentoDataHorimetro data={data} setData={setData} horimetro={horimetro} setHorimetro={setHorimetro} selectedEquip={equipments.find((e) => e.id === maquinaId)} />
      <AbastecimentoValores tipoCombustivel={tipoCombustivel} setTipoCombustivel={setTipoCombustivel} litros={litros} setLitros={setLitros} custoUnitario={custoUnitario} setCustoUnitario={setCustoUnitario} valorTotal={valorTotal} setValorTotal={setValorTotal} />
      <AbastecimentoLubrificacao qtdOleo={qtdOleo} setQtdOleo={setQtdOleo} qtdGraxa={qtdGraxa} setQtdGraxa={setQtdGraxa} />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
        <button type="submit" disabled={isSubmitting || equipments.length === 0} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
          {isSubmitting ? 'Salvando...' : 'Registrar Abastecimento'}
        </button>
      </div>
    </form>
  );
};
