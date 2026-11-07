import React, { useState, useEffect } from 'react';
import { Plus, Camera, X, Loader2 } from 'lucide-react';
import { useEquipments } from '../../../../hooks/useEquipments';
import { isVehicleOrTruck } from '../../../../utils/equipmentMeasurement';
import { uploadParaGoogleDrive } from '../../../../services/driveService';
import { EmprestimoFieldsBox } from '../../../common/EmprestimoFieldsBox';
import type { TipoCombustivel } from '../../../../types/abastecimento.types';
import type { DadosEmprestimoPagamento } from '../../../../types/contasPagar.types';

export interface NovoAbastecimentoRapidoDTO {
  data: string; maquina_id: string; maquina_nome: string; eh_apoio: boolean;
  tipo_combustivel: TipoCombustivel; quantidade_litros: number; valor_unitario: number; valor_total: number;
  horimetro_momento?: number; posto_fornecedor?: string; foto_comprovante?: string;
  forma_pagamento?: string; emprestimo?: DadosEmprestimoPagamento;
}

interface Props {
  maquinaServicoNome?: string;
  onAdicionar: (item: NovoAbastecimentoRapidoDTO) => Promise<boolean>;
  carregando?: boolean;
}

export const AbastecimentoRapidoForm: React.FC<Props> = ({ maquinaServicoNome, onAdicionar, carregando }) => {
  const hoje = new Date().toISOString().slice(0, 10);
  const { data: equipments } = useEquipments({ onlyActives: true });
  const [maquinaId, setMaquinaId] = useState('');
  const [tipoComb, setTipoComb] = useState<TipoCombustivel>('DIESEL_S500');
  const [litros, setLitros] = useState('');
  const [precoLitro, setPrecoLitro] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(hoje);
  const [horimetro, setHorimetro] = useState('');
  const [posto, setPosto] = useState('Posto de Combustível / Cupom Fiscal');
  const [formaPag, setFormaPag] = useState('PIX');
  const [credorNome, setCredorNome] = useState('');
  const [dataEmp, setDataEmp] = useState(hoje);
  const [dataPagar, setDataPagar] = useState(hoje);
  const [comprovante, setComprovante] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!maquinaId && equipments.length > 0) {
      const matchCod = (maquinaServicoNome || '').match(/\(([^)]+)\)/);
      const cod = matchCod ? matchCod[1].trim().toUpperCase() : '';
      const def = equipments.find((e) => (cod && e.code.toUpperCase() === cod) || (maquinaServicoNome && e.name.toLowerCase().includes(maquinaServicoNome.toLowerCase()))) || equipments[0];
      if (def) { setMaquinaId(def.id); setTipoComb(isVehicleOrTruck(def) ? 'DIESEL_S10' : 'DIESEL_S500'); }
    }
  }, [equipments, maquinaId, maquinaServicoNome]);

  const handleSelectMaq = (id: string) => {
    setMaquinaId(id);
    const eq = equipments.find((e) => e.id === id);
    if (eq) setTipoComb(isVehicleOrTruck(eq) ? 'DIESEL_S10' : 'DIESEL_S500');
  };

  const handleLitrosChange = (v: string) => { setLitros(v); const l = parseFloat(v), p = parseFloat(precoLitro); if (l > 0 && p > 0) setValor((l * p).toFixed(2)); };
  const handlePrecoChange = (v: string) => { setPrecoLitro(v); const l = parseFloat(litros), p = parseFloat(v); if (l > 0 && p > 0) setValor((l * p).toFixed(2)); };
  const handleValorChange = (v: string) => { setValor(v); const l = parseFloat(litros), tot = parseFloat(v); if (l > 0 && tot > 0) setPrecoLitro((tot / l).toFixed(2)); };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setUploading(true); const res = await uploadParaGoogleDrive(file, 'frota'); if (res.sucesso && res.driveUrl) setComprovante(res.driveUrl); }
    finally { setUploading(false); }
  };

  const handleGravar = async () => {
    const l = parseFloat(litros), v = parseFloat(valor);
    if (!maquinaId || !l || l <= 0 || !v || v <= 0) return;
    if (formaPag === 'EMPRESTIMO' && (!credorNome.trim() || !dataPagar)) return;
    const eq = equipments.find((e) => e.id === maquinaId);
    const ok = await onAdicionar({
      data: data || hoje, maquina_id: maquinaId, maquina_nome: eq ? `${eq.code} - ${eq.name}` : 'Equipamento',
      eh_apoio: isVehicleOrTruck(eq) || tipoComb === 'DIESEL_S10', tipo_combustivel: tipoComb,
      quantidade_litros: l, valor_unitario: Number((v / l).toFixed(3)), valor_total: v,
      horimetro_momento: horimetro ? parseFloat(horimetro) : undefined, posto_fornecedor: posto || 'Posto de Combustível',
      foto_comprovante: comprovante, forma_pagamento: formaPag,
      emprestimo: formaPag === 'EMPRESTIMO' ? { credorNome: credorNome.trim(), dataEmprestimo: dataEmp || data, dataPagamentoPrevista: dataPagar } : undefined
    });
    if (ok) { setLitros(''); setPrecoLitro(''); setValor(''); setHorimetro(''); setComprovante(undefined); }
  };

  return (
    <div className="p-2.5 bg-white border border-amber-300 rounded-lg space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Máquina ou Veículo de Apoio *</label>
          <select value={maquinaId} onChange={(e) => handleSelectMaq(e.target.value)} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg font-bold text-gray-800">
            {equipments.map((eq) => (<option key={eq.id} value={eq.id}>{isVehicleOrTruck(eq) ? '🛻' : '🚜'} {eq.code} - {eq.name}</option>))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Combustível *</label>
          <select value={tipoComb} onChange={(e) => setTipoComb(e.target.value as TipoCombustivel)} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg font-bold text-gray-800">
            <option value="DIESEL_S500">Diesel S500</option><option value="DIESEL_S10">Diesel S10</option><option value="GASOLINA">Gasolina</option>
          </select>
        </div>
        <div><label className="text-[10px] font-bold text-gray-600 block mb-0.5">Litros (L) *</label><input type="number" step="0.01" min="0" value={litros} onChange={(e) => handleLitrosChange(e.target.value)} placeholder="Ex: 420.00" className="w-full px-2 py-1 bg-gray-50 border border-amber-300 rounded-lg font-mono font-bold text-amber-900" /></div>
        <div><label className="text-[10px] font-bold text-gray-600 block mb-0.5">Preço/L (R$)</label><input type="number" step="0.01" min="0" value={precoLitro} onChange={(e) => handlePrecoChange(e.target.value)} placeholder="Ex: 6.96" className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg font-mono font-semibold text-gray-800" /></div>
        <div><label className="text-[10px] font-bold text-gray-600 block mb-0.5">Valor Total (R$) *</label><input type="number" step="0.01" min="0" value={valor} onChange={(e) => handleValorChange(e.target.value)} placeholder="Ex: 2923.20" className="w-full px-2 py-1 bg-gray-50 border border-amber-300 rounded-lg font-mono font-bold text-emerald-800" /></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div><label className="text-[10px] font-bold text-gray-600 block mb-0.5">Data</label><input type="date" value={data} onChange={(e) => { setData(e.target.value); setDataEmp(e.target.value); }} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg" /></div>
        <div><label className="text-[10px] font-bold text-gray-600 block mb-0.5">Horímetro / KM</label><input type="number" step="0.1" min="0" value={horimetro} onChange={(e) => setHorimetro(e.target.value)} placeholder="Opcional" className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg font-mono" /></div>
        <div>
          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">De onde pagou?</label>
          <select value={formaPag} onChange={(e) => setFormaPag(e.target.value)} className="w-full px-2 py-1 bg-amber-50 border border-amber-300 rounded-lg font-bold text-gray-800">
            <option value="PIX">🏦 Conta / PIX</option><option value="DINHEIRO">💵 Em Mãos</option><option value="EMPRESTIMO">💸 Empréstimo</option><option value="CARTAO">💳 Cartão</option><option value="BOLETO">📄 Boleto</option>
          </select>
        </div>
        <div><label className="text-[10px] font-bold text-gray-600 block mb-0.5">Posto / Fornecedor</label><input type="text" value={posto} onChange={(e) => setPosto(e.target.value)} placeholder="Posto / Cupom" className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg" /></div>
      </div>

      {formaPag === 'EMPRESTIMO' && (<EmprestimoFieldsBox compact credorNome={credorNome} setCredorNome={setCredorNome} dataEmprestimo={dataEmp} setDataEmprestimo={setDataEmp} dataPagamentoPrevista={dataPagar} setDataPagamentoPrevista={setDataPagar} />)}

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-100">
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-gray-300 hover:border-amber-500 rounded-lg cursor-pointer text-[11px] text-gray-600 bg-gray-50">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" /> : <Camera className="w-3.5 h-3.5 text-amber-600" />}
            <span>{uploading ? 'Enviando Drive...' : comprovante ? 'Foto Bomba/Cupom ✓' : 'Anexar Foto Bomba / Cupom'}</span>
            <input type="file" accept="image/*,application/pdf" onChange={handleFoto} disabled={uploading} className="hidden" />
          </label>
          {comprovante && <button type="button" onClick={() => setComprovante(undefined)} className="p-1 text-rose-500 hover:bg-rose-50 rounded"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <button type="button" onClick={handleGravar} disabled={carregando || uploading} className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 font-bold rounded-lg shadow-xs cursor-pointer text-xs text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50">
          <Plus className="w-3.5 h-3.5" /><span>{carregando ? 'Gravando...' : 'Adicionar Abastecimento'}</span>
        </button>
      </div>
    </div>
  );
};
