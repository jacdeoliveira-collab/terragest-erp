export interface GeocodingResult {
  enderecoFormatado: string;
  lat: number;
  lng: number;
  mapsUrl: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const coordText = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'TerraGestApp/1.0' } });
    if (!res.ok) throw new Error('Falha na consulta');

    const data = await res.json();
    const addr = data.address || {};
    const partes: string[] = [];

    // 1. Logradouro / Via + Número
    let via = addr.road || addr.street || addr.avenue || addr.pedestrian || addr.track || addr.hamlet || addr.isolated_dwelling;
    if (via && addr.house_number) {
      via = `${via}, ${addr.house_number}`;
    }
    if (via) partes.push(via);

    // 2. Bairro / Distrito (somente se realmente existir)
    const bairro = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || addr.subdistrict;
    if (bairro) {
      partes.push(bairro);
    } else if (addr.farm) {
      partes.push(addr.farm);
    }

    // 3. Cidade e Estado
    const cidade = addr.city || addr.town || addr.municipality || addr.village;
    const estado = addr.state_code || addr.state;
    if (cidade && estado) {
      partes.push(`${cidade} - ${estado}`);
    } else if (cidade) {
      partes.push(cidade);
    }

    // 4. CEP
    if (addr.postcode) {
      partes.push(`CEP: ${addr.postcode}`);
    }

    // Somente se for campo isolado sem rua e sem bairro
    if (!via && !bairro && (addr.farm || (!cidade && !estado))) {
      partes.unshift('Zona Rural');
    }

    const enderecoBase = partes.filter(Boolean).join(', ');
    const enderecoFormatado = enderecoBase ? `${enderecoBase} (${coordText})` : `Localização Detectada (${coordText})`;

    return { enderecoFormatado, lat, lng, mapsUrl };
  } catch {
    return {
      enderecoFormatado: `Localização (${coordText})`,
      lat,
      lng,
      mapsUrl
    };
  }
}

export function extrairCoordenadasTexto(texto: string): { lat: number; lng: number } | null {
  const match = texto.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}
