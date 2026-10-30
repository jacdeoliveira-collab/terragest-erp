import React from 'react';
import { MapPin, Layers, Calendar } from 'lucide-react';
import { useObras } from '../../../hooks/useObras';

interface Props {
  obraId: string;
  setObraId: (v: string) => void;
  obraNome: string;
  setObraNome: (v: string) => void;
  localObra: string;
  setLocalObra: (v: string) => void;
  tipoOperacao: string;
  setTipoOperacao: (v: string) => void;
  tipoTerreno: string;
  setTipoTerreno: (v: string) => void;
  regimeTrabalho: string;
  setRegimeTrabalho: (v: string) => void;
  previsaoInicio: string;
  setPrevisaoInicio: (v: string) => void;
  descricaoServico: string;
  setDescricaoServico: (v: string) => void;
}

const TIPOS_OPERACAO = [
  'Terraplanagem e Corte/Aterro',
  'Escavação de Valas e Drenagem Pluvial',
  'Limpeza de Área, Destoca e Enleiramento',
  'Abertura e Manutenção de Estradas / Ramais',
  'Construção / Limpeza de Açude, Tanque ou Barragem',
  'Compactação de Solo e Sub-base',
  'Demolição e Rompimento de Rocha/Concreto',
  'Carregamento de Cascalho / Transporte Interno',
  'Locação Operacional por Horímetro'
];

const TIPOS_TERRENO = [
  'Solo Comum / Terra Firme (Operação Normal)',
  'Argila / Várzea / Solo Úmido ou Alagadiço',
  'Cascalho / Piçarra / Solo Compactado',
  'Rocha / Pedra / Demolição Severa'
];

const REGIMES_TRABALHO = [
  'Turno Diurno Comercial (8h/dia • Seg a Sáb)',
  'Turno Diurno Estendido (10h/dia)',
  'Turno Intensivo / Safra (12h/dia)',
  'Livre por Medição de Horímetro'
];

export const OrcamentoObraEscopoSection: React.FC<Props> = ({
  obraId, setObraId, setObraNome,
  localObra, setLocalObra,
  tipoOperacao, setTipoOperacao,
  tipoTerreno, setTipoTerreno,
  regimeTrabalho, setRegimeTrabalho,
  previsaoInicio, setPrevisaoInicio,
  descricaoServico, setDescricaoServico
}) => {
  const { obras } = useObras();

  return (
    <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5 text-xs text-left">
      <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-200 pb-1.5">
        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
        <span>Local da Obra, Caracterização do Terreno & Escopo Técnico</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Centro de Custo / Obra (Opcional)</label>
          <select
            value={obraId}
            onChange={(e) => {
              const id = e.target.value;
              setObraId(id);
              const found = obras.find((o) => o.id === id);
              setObraNome(found?.nome || '');
              if (found?.localizacao && !localObra) setLocalObra(found.localizacao);
            }}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg"
          >
            <option value="">Sem vínculo ou Nova Frente...</option>
            {obras.map((ob) => (
              <option key={ob.id} value={ob.id}>{ob.nome} {ob.cliente ? `(${ob.cliente})` : ''}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block font-semibold text-gray-700 mb-1">Localização da Obra / Fazenda / Endereço / Cidade - UF *</label>
          <input
            type="text"
            placeholder="Ex: Fazenda Santa Helena, Rod. BR-153 Km 42 - Zona Rural / Canteiro Central"
            value={localObra}
            onChange={(e) => setLocalObra(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Layers className="w-3 h-3 text-emerald-600" /> Natureza da Operação</label>
          <select value={tipoOperacao} onChange={(e) => setTipoOperacao(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg">
            {TIPOS_OPERACAO.map((op) => (<option key={op} value={op}>{op}</option>))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Tipo de Terreno / Severidade</label>
          <select value={tipoTerreno} onChange={(e) => setTipoTerreno(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg">
            {TIPOS_TERRENO.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Regime de Turno</label>
          <select value={regimeTrabalho} onChange={(e) => setRegimeTrabalho(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg">
            {REGIMES_TRABALHO.map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-600" /> Previsão de Início</label>
          <input type="date" value={previsaoInicio} onChange={(e) => setPrevisaoInicio(e.target.value)} className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg font-mono" />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Descrição Técnica Detalhada dos Serviços / Escopo da Proposta *</label>
        <textarea
          required
          rows={2}
          placeholder="Descreva os serviços a executar, especificações de corte/aterro, abertura de valas, destoca ou condições específicas da frente de serviço..."
          value={descricaoServico}
          onChange={(e) => setDescricaoServico(e.target.value)}
          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
};

