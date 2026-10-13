import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from '../../../ui/Modal';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { reverseGeocode, type GeocodingResult } from '../../../../services/geocodingService';
import { gerarMapaIframeHtml } from './mapaIframeTemplate';

interface MapaLocalizacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (resultado: GeocodingResult) => void;
}

export const MapaLocalizacaoModal: React.FC<MapaLocalizacaoModalProps> = ({
  isOpen,
  onClose,
  onConfirmar
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<GeocodingResult | null>(null);

  const htmlContent = useMemo(() => gerarMapaIframeHtml(-5.364, -46.045, 8), []);

  useEffect(() => {
    const handleMessage = async (ev: MessageEvent) => {
      if (ev.data && ev.data.type === 'TERRAGEST_PIN_CHANGED') {
        const { lat, lng } = ev.data;
        setCarregando(true);
        const geo = await reverseGeocode(lat, lng);
        setResultado(geo);
        setCarregando(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const obterGpsAtual = () => {
    if (!navigator.geolocation) return;
    setCarregando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        iframeRef.current?.contentWindow?.postMessage({ type: 'SET_CENTER', lat, lng, zoom: 16 }, '*');
      },
      () => setCarregando(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const buscarRegiao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busca.trim()) return;
    setCarregando(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(busca.trim())}&limit=1&addressdetails=1`, {
        headers: { 'User-Agent': 'TerraGestApp/1.0', 'Accept-Language': 'pt-BR' }
      });
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        iframeRef.current?.contentWindow?.postMessage({ type: 'SET_CENTER', lat, lng, zoom: 17 }, '*');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Localização no Mapa">
      <div className="space-y-2.5 text-xs text-left">
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={buscarRegiao} className="flex-1 flex gap-1.5">
            <input
              type="text"
              placeholder="Buscar endereço, rua, número, cidade ou fazenda..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button type="submit" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center gap-1 cursor-pointer">
              <Search className="w-3.5 h-3.5" />
              <span>Ir</span>
            </button>
          </form>
          <button
            type="button"
            onClick={obterGpsAtual}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl flex items-center justify-center gap-1 font-semibold cursor-pointer transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Meu GPS</span>
          </button>
        </div>

        <div className="relative w-full h-72 rounded-xl overflow-hidden border border-gray-200">
          <iframe ref={iframeRef} srcDoc={htmlContent} title="Mapa Satélite" className="w-full h-full border-0" />
        </div>

        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-500 font-semibold uppercase">Endereço Detectado</div>
            <div className="text-gray-900 font-medium truncate">
              {carregando ? 'Identificando ponto e coordenadas...' : resultado?.enderecoFormatado || 'Clique ou arraste o marcador para o local exato da fazenda/obra'}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!resultado || carregando}
            onClick={() => { if (resultado) { onConfirmar(resultado); onClose(); } }}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {carregando && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Confirmar Localização</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
