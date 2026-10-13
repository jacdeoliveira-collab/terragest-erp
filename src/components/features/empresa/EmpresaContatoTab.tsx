import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { MapaLocalizacaoModal } from '../comercial/modal/MapaLocalizacaoModal';

export interface EmpresaContatoTabProps {
  telefone: string;
  setTelefone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  endereco: string;
  setEndereco: (val: string) => void;
}

export const EmpresaContatoTab: React.FC<EmpresaContatoTabProps> = ({
  telefone,
  setTelefone,
  email,
  setEmail,
  endereco,
  setEndereco
}) => {
  const [modalMapaAberto, setModalMapaAberto] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Telefone de Contato / WhatsApp *
          </label>
          <input
            type="text"
            required
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            E-mail Comercial / Financeiro *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contato@empresa.com.br"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-gray-700">
            Endereço Completo (Sede da Construtora)
          </label>
          <button
            type="button"
            onClick={() => setModalMapaAberto(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
            title="Acessar o mapa satélite e marcar a localização da sede"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Marcar no Mapa (Satélite / GPS)</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Av. Principal, 1000, Sala 10, Centro, São Luís - MA, CEP: 65000-000"
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      <MapaLocalizacaoModal
        isOpen={modalMapaAberto}
        onClose={() => setModalMapaAberto(false)}
        onConfirmar={(res) => setEndereco(res.enderecoFormatado)}
      />
    </div>
  );
};
