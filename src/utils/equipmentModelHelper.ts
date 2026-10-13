import type { Equipment } from '../types/equipment.types';

export interface MarcaModeloParsed {
  marca: string;
  modelo: string;
}

/**
 * Extrai marca e modelo separados para exibição e edição,
 * mesmo que tenham sido salvos concatenados em versões anteriores.
 */
export function parseEquipmentMarcaModelo(equipment?: Equipment | null): MarcaModeloParsed {
  if (!equipment) return { marca: '', modelo: '' };

  if (equipment.marca && equipment.marca.trim()) {
    return {
      marca: equipment.marca.trim(),
      modelo: (equipment.model || '').trim()
    };
  }

  const modelRaw = (equipment.model || '').trim();
  if (!modelRaw) return { marca: '', modelo: '' };

  // Se veio concatenado (ex: "Toyota HILUX CDSRXA4FD")
  const parts = modelRaw.split(/\s+/);
  if (parts.length > 1) {
    const possivelMarca = parts[0];
    const possivelModelo = parts.slice(1).join(' ');
    return {
      marca: possivelMarca,
      modelo: possivelModelo
    };
  }

  return { marca: '', modelo: modelRaw };
}
