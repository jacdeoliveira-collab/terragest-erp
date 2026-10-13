import React, { useState, useMemo } from 'react';
import { Modal } from '../../../ui/Modal';
import { Settings, RefreshCw, AlertCircle, Phone } from 'lucide-react';
import { useClienteHistorico } from '../../../../hooks/useClienteHistorico';
import { ClienteHistoricoCards, type ClienteHistoricoFiltro } from './ClienteHistoricoCards';
import { ClienteHistoricoServicosTable } from './ClienteHistoricoServicosTable';
import type { Cliente } from '../../../../types/comercial.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  onEditar?: (cliente: Cliente) => void;
}

export const ClienteHistoricoModal: React.FC<Props> = ({ isOpen, onClose, cliente, onEditar }) => {
  const { data, isLoading, error, refetch } = useClienteHistorico(cliente);
  const [filtroAtivo, setFiltroAtivo] = useState<ClienteHistoricoFiltro>('todos');

  const servicosFiltrados = useMemo(() => {
    if (!data.servicos) return [];
    if (filtroAtivo === 'adiantamentos') {
      return data.servicos.filter((s) => Number(s.valor_adiantamento || 0) > 0);
    }
    if (filtroAtivo === 'pendentes') {
      return data.servicos.filter((s) => {
        const saldo = s.saldo_restante !== undefined ? Number(s.saldo_restante) : Number(s.faturamento_bruto);
        return saldo > 0 || s.status_pagamento_cliente !== 'QUITADO';
      });
    }
    if (filtroAtivo === 'horas') {
      return [...data.servicos].sort((a, b) => Number(b.horas_trabalhadas || 0) - Number(a.horas_trabalhadas || 0));
    }
    return data.servicos;
  }, [data.servicos, filtroAtivo]);

  if (!cliente) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Histórico & Serviços: ${cliente.nome}`} maxWidth="4xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-emerald-900/5 p-3 rounded-xl border border-emerald-900/10 gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <span className="truncate">{cliente.nome}</span>
              {cliente.documento && <span className="font-mono text-gray-500 font-normal shrink-0">• {cliente.documento}</span>}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 truncate">
              {cliente.telefone && <span className="flex items-center gap-1 shrink-0"><Phone className="w-3 h-3 text-emerald-600" />{cliente.telefone}</span>}
              <span>•</span>
              <span className="truncate">{cliente.endereco || 'Sem endereço'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={refetch} title="Recarregar" className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            {onEditar && (
              <button
                type="button"
                onClick={() => { onClose(); onEditar(cliente); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer border border-gray-200 shrink-0 whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Editar Dados</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <ClienteHistoricoCards data={data} filtroAtivo={filtroAtivo} onSelectFiltro={setFiltroAtivo} />
        <ClienteHistoricoServicosTable servicos={servicosFiltrados} />
      </div>
    </Modal>
  );
};
