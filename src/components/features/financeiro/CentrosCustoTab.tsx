import React, { useState } from 'react';
import { Building2, Search, AlertCircle, HardHat } from 'lucide-react';
import { useObras } from '../../../hooks/useObras';
import { ObraFinanceiroTab } from '../obras/ObraFinanceiroTab';

export const CentrosCustoTab: React.FC = () => {
  const { obras, loading, error } = useObras();
  const [selectedObraId, setSelectedObraId] = useState<string>('');
  const [termoBusca, setTermoBusca] = useState<string>('');

  const activeObraId = selectedObraId || (obras.length > 0 ? obras[0].id : '');

  const obrasFiltradas = obras.filter((o) =>
    o.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (o.cliente && o.cliente.toLowerCase().includes(termoBusca.toLowerCase()))
  );

  const obraAtual = obras.find((o) => o.id === activeObraId);

  if (loading && obras.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-gray-500">
        Carregando centros de custo...
      </div>
    );
  }

  if (error && obras.length === 0) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (obras.length === 0) {
    return (
      <div className="p-10 text-center bg-white border border-gray-200 rounded-2xl">
        <HardHat className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-gray-800">Nenhum Centro de Custo Encontrado</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
          Cadastre uma obra no módulo de Obras para iniciar o rateio financeiro, DRE e apropriação de despesas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left">
      {/* Seletor do Centro de Custo */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Centro de Custo Ativo</span>
              <h3 className="text-sm font-bold text-gray-900">
                {obraAtual?.nome || 'Selecione um centro de custo'}
              </h3>
              {obraAtual?.cliente && (
                <p className="text-xs text-gray-500">Cliente: {obraAtual.cliente}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar centro de custo..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-emerald-500"
              />
            </div>

            <select
              value={activeObraId}
              onChange={(e) => setSelectedObraId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-emerald-500"
            >
              {obrasFiltradas.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nome} {obra.cliente ? `(${obra.cliente})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Demonstrativo Financeiro / DRE da Obra Selecionada */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
        <ObraFinanceiroTab obraId={activeObraId} />
      </div>
    </div>
  );
};
