import React, { useState, useEffect } from 'react';
import { DollarSign, Fuel, Wrench, TrendingUp, TrendingDown } from 'lucide-react';
import { calcularDreCentroCusto } from '../../../hooks/useCentrosCusto';
import { useTenantContext } from '../../../contexts/TenantContext';
import type { CentroCustoDreResumo } from '../../../types/centroCusto.types';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const CentroCustoDrePanel: React.FC<{ centroId: string; nomeCentro?: string }> = ({ centroId, nomeCentro }) => {
  const { tenantAtivoId } = useTenantContext();
  const [resumo, setResumo] = useState<CentroCustoDreResumo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!centroId) return;
    setLoading(true);
    calcularDreCentroCusto(centroId, tenantAtivoId || undefined)
      .then(setResumo)
      .finally(() => setLoading(false));
  }, [centroId, tenantAtivoId]);

  if (!centroId) return null;
  if (loading || !resumo) {
    return <div className="p-6 text-center text-xs text-gray-400">Calculando DRE do centro de custo...</div>;
  }

  const pos = resumo.lucroOperacional >= 0;
  const base = resumo.receitaTotal > 0 ? resumo.receitaTotal : (resumo.custoTotalGeral || 1);
  const pct = (v: number) => `${((v / base) * 100).toFixed(1)}%`;

  const linhas = [
    { nome: '(-) Diesel e Lubrificantes', valor: resumo.totalCombustivel },
    { nome: '(-) Peças e Componentes de Manutenção', valor: resumo.totalPecas },
    { nome: '(-) Serviços Mecânicos / Mão de Obra', valor: resumo.totalMaoObra },
    { nome: '(-) Folha / RH Apropriado', valor: resumo.totalFolha },
    { nome: '(-) Outras Despesas do Centro de Custo', valor: resumo.totalOutrasDespesas }
  ];

  return (
    <div className="space-y-4 text-left text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
          <div className="flex justify-between text-[10px] font-bold text-emerald-800 uppercase"><span>Receita Bruta</span><DollarSign className="w-3.5 h-3.5" /></div>
          <div className="text-base font-bold font-mono text-emerald-900 mt-1">{fmt(resumo.receitaTotal)}</div>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="flex justify-between text-[10px] font-bold text-gray-700 uppercase"><span>Custos Diretos</span><Wrench className="w-3.5 h-3.5" /></div>
          <div className="text-base font-bold font-mono text-gray-900 mt-1">{fmt(resumo.custoTotalGeral)}</div>
        </div>
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
          <div className="flex justify-between text-[10px] font-bold text-amber-800 uppercase"><span>Diesel ({resumo.totalLitrosCombustivel.toFixed(0)}L)</span><Fuel className="w-3.5 h-3.5" /></div>
          <div className="text-base font-bold font-mono text-amber-900 mt-1">{fmt(resumo.totalCombustivel)}</div>
        </div>
        <div className={`p-3 border rounded-xl ${pos ? 'bg-teal-50/80 border-teal-200' : 'bg-rose-50/80 border-rose-200'}`}>
          <div className="flex justify-between text-[10px] font-bold uppercase">
            <span className={pos ? 'text-teal-800' : 'text-rose-800'}>Resultado Líquido</span>
            <span className="font-mono">{resumo.margemLucro.toFixed(1)}%</span>
          </div>
          <div className={`text-base font-bold font-mono mt-1 ${pos ? 'text-teal-900' : 'text-rose-900'}`}>{fmt(resumo.lucroOperacional)}</div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="p-2.5 bg-gray-50 border-b border-gray-200 font-bold text-gray-800">
          DRE Operacional — {nomeCentro || 'Centro de Custo'}
        </div>
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-100">
            <tr className="bg-emerald-50/40 font-bold text-emerald-900">
              <td className="py-2 px-3">(+) Receita Operacional Apropriada</td>
              <td className="py-2 px-3 text-right font-mono">{fmt(resumo.receitaTotal)}</td>
              <td className="py-2 px-3 text-right font-mono">100.0%</td>
            </tr>
            {linhas.map((l) => (
              <tr key={l.nome} className="text-gray-700">
                <td className="py-1.5 px-3">{l.nome}</td>
                <td className="py-1.5 px-3 text-right font-mono">{fmt(l.valor)}</td>
                <td className="py-1.5 px-3 text-right font-mono text-gray-400">{pct(l.valor)}</td>
              </tr>
            ))}
            <tr className={`font-bold ${pos ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'}`}>
              <td className="py-2 px-3 flex items-center gap-1.5">
                {pos ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
                <span>(=) RESULTADO LÍQUIDO DO CENTRO DE CUSTO</span>
              </td>
              <td className="py-2 px-3 text-right font-mono">{fmt(resumo.lucroOperacional)}</td>
              <td className="py-2 px-3 text-right font-mono">{resumo.margemLucro.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
