import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { MapPin } from 'lucide-react';
import type { Cliente, CreateClienteDTO } from '../../../types/comercial.types';
import { MapaLocalizacaoModal } from './modal/MapaLocalizacaoModal';

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteParaEditar?: Cliente | null;
  onSalvar: (dados: CreateClienteDTO) => Promise<boolean>;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen, onClose, clienteParaEditar, onSalvar
}) => {
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('MA');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [modalMapaAberto, setModalMapaAberto] = useState(false);

  useEffect(() => {
    if (clienteParaEditar) {
      setNome(clienteParaEditar.nome || '');
      setDocumento(clienteParaEditar.documento || '');
      setTelefone(clienteParaEditar.telefone || '');
      setEndereco(clienteParaEditar.endereco || '');
      setCidade(clienteParaEditar.cidade || '');
      setEstado(clienteParaEditar.estado || 'MA');
      setEmail(clienteParaEditar.email || '');
    } else {
      setNome(''); setDocumento(''); setTelefone(''); setEndereco(''); setCidade(''); setEstado('MA'); setEmail('');
    }
  }, [clienteParaEditar, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || salvando) return;
    setSalvando(true);
    const endFormatado = [endereco.trim(), cidade.trim(), estado ? `UF: ${estado}` : ''].filter(Boolean).join(' - ');
    const sucesso = await onSalvar({
      nome: nome.trim(),
      documento: documento.trim() || undefined,
      telefone: telefone.trim() || undefined,
      endereco: endFormatado || undefined,
      cidade: cidade.trim() || undefined,
      estado: estado || undefined,
      email: email.trim() || undefined
    });
    setSalvando(false);
    if (sucesso) onClose();
  };

  const isEdit = Boolean(clienteParaEditar);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Dados do Cliente' : 'Cadastrar Novo Cliente'}>
        <form onSubmit={handleSubmit} className="space-y-3 text-xs text-left">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Nome / Razão Social *</label>
            <input required placeholder="Ex: Fazenda Boa Esperança / João Silva" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">CPF ou CNPJ</label>
              <input placeholder="00.000.000/0001-00" value={documento} onChange={(e) => setDocumento(e.target.value)} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input placeholder="(99) 98765-4321" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">Cidade / Município</label>
              <input placeholder="Ex: Balsas" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Estado (UF) *</label>
              <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none">
                {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-gray-700">Endereço / Fazenda / Local de Obra</label>
              <button type="button" onClick={() => setModalMapaAberto(true)} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors" title="Marcar ponto no mapa">
                <MapPin className="w-3 h-3" /><span>Marcar no Mapa</span>
              </button>
            </div>
            <input placeholder="Ex: Estrada Vicinal KM 12, Fazenda Santa Maria" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2.5 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">Cancelar</button>
            <button type="submit" disabled={salvando || !nome.trim()} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer">
              {salvando ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </Modal>
      <MapaLocalizacaoModal isOpen={modalMapaAberto} onClose={() => setModalMapaAberto(false)} onConfirmar={(geo) => setEndereco(geo.enderecoFormatado)} />
    </>
  );
};
