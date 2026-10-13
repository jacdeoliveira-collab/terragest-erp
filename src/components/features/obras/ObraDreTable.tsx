import React from 'react';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';
import type { ObraFinanceiroResumo } from '../../../hooks/useObraFinanceiro';

const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ObraDreTable: React.FC<{ resumo: ObraFinanceiroResumo }> = ({ resumo }) => {
  const {
    custoTotalGeral, totalCombustivel, totalPecas, totalMaoObra, extras,
    receitaTotal = 0, lucroOperacional = 0, margemLucro = 0
  } = resumo;

  const baseCalculo = receitaTotal > 0 ? receitaTotal : (custoTotalGeral > 0 ? custoTotalGeral : 1);
  const pct = (v: number) => `${((v / baseCalculo) * 100).toFixed(1)}%`;
  const isLucroPositivo = lucroOperacional >= 0;

  const linhasDespesas = [
    { nome: '(-) Diesel e Lubrificantes', valor: totalCombustivel, cor: 'text-amber-800' },
    { nome: '(-) Peças e Componentes de Reposição', valor: totalPecas, cor: 'text-gray-800' },
    { nome: '(-) Serviços Mecânicos / Manutenção', valor: totalMaoObra, cor: 'text-gray-800' },
    { nome: '(-) Mão de Obra de Operadores (BDE/Serviços)', valor: extras.totalMaoObraOperadores, cor: 'text-gray-800' },
    { nome: '(-) Folha / RH em Contas a Pagar', valor: extras.totalFolha, cor: 'text-gray-800' },
    { nome: '(-) Outras Despesas (Almoxarifado, Apoio)', valor: extras.totalOutrasDespesas, cor: 'text-gray-800' }
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white text-xs">
      <div className="p-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="font-bold text-gray-800 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> DRE Operacional da Obra & Centro de Custo
        </span>
        <span className="text-[10px] text-gray-500 font-semibold">
          Margem: <span className={isLucroPositivo ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{margemLucro.toFixed(1)}%</span>
        </span>
      </div>

      <table className="w-full text-left">
        <thead className="bg-gray-50/50 text-[10px] text-gray-500 uppercase border-b border-gray-100">
          <tr>
            <th className="py-1.5 px-3">Estrutura de Contas</th>
            <th className="py-1.5 px-3 text-right">Valor Apropriado</th>
            <th className="py-1.5 px-3 text-right">% Receita</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {/* Receita Bruta */}
          <tr className="bg-emerald-50/40 font-semibold">
            <td className="py-2 px-3 text-emerald-900 font-bold">
              (+) Receita Operacional Bruta (Medições & Serviços)
            </td>
            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{formatBRL(receitaTotal)}</td>
            <td className="py-2 px-3 text-right font-mono text-emerald-700">100.0%</td>
          </tr>

          {/* Despesas Diretas */}
          {linhasDespesas.map((l) => (
            <tr key={l.nome}>
              <td className="py-1.5 px-3">{l.nome}</td>
              <td className={`py-1.5 px-3 text-right font-mono ${l.cor}`}>{formatBRL(l.valor)}</td>
              <td className="py-1.5 px-3 text-right font-mono text-gray-500">{pct(l.valor)}</td>
            </tr>
          ))}

          {/* Subtotal Despesas */}
          <tr className="bg-gray-50 font-bold">
            <td className="py-2 px-3 text-gray-900">Total Custos & Despesas Diretas</td>
            <td className="py-2 px-3 text-right font-mono text-rose-700">-{formatBRL(custoTotalGeral)}</td>
            <td className="py-2 px-3 text-right font-mono text-rose-700">{pct(custoTotalGeral)}</td>
          </tr>

          {/* Resultado Líquido */}
          <tr className={`font-bold ${isLucroPositivo ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-950'}`}>
            <td className="py-2.5 px-3 flex items-center gap-1.5">
              {isLucroPositivo ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
              <span>(=) RESULTADO OPERACIONAL LÍQUIDO</span>
            </td>
            <td className={`py-2.5 px-3 text-right font-mono text-sm ${isLucroPositivo ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatBRL(lucroOperacional)}
            </td>
            <td className={`py-2.5 px-3 text-right font-mono ${isLucroPositivo ? 'text-emerald-700' : 'text-rose-700'}`}>
              {margemLucro.toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>

      <div className="p-2.5 bg-gray-50/60 border-t border-gray-100 text-[10px] text-gray-500 space-y-0.5">
        <div>Produção (tickets do Sinaleiro): {extras.volumeProduzidoM3.toLocaleString('pt-BR')} m³ em {extras.qtdViagens} viagens
          {resumo.custoPorM3 !== null && <> — custo médio <b className="text-gray-700">{formatBRL(resumo.custoPorM3)}/m³</b></>}</div>
        <div>Custo estimado das máquinas (horas BDE x custo/hora do equipamento): {formatBRL(extras.custoEstimadoMaquinas)}</div>
      </div>
    </div>
  );
};
