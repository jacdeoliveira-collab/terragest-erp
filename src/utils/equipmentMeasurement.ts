import type { EquipmentCategory } from '../types/equipment.types';

export type MeasurementUnit = 'KM' | 'HORAS';

export interface MeasurableEquipment {
  category?: EquipmentCategory | string;
  type?: string;
  name?: string;
  code?: string;
}

export function isVehicleOrTruck(item?: MeasurableEquipment | null): boolean {
  if (!item) return false;
  const cat = (item.category || '').toUpperCase();
  if (cat === 'CAMINHAO' || cat === 'VEICULO_LEVE') return true;

  const type = (item.type || '').toUpperCase();
  if (type.includes('CAMINHAO') || type.includes('VEICULO') || type.includes('CARRO') || type.includes('CAMINHONETE') || type.includes('PICKUP') || type.includes('MOTO')) {
    return true;
  }

  const name = `${item.name || ''} ${item.code || ''}`.toUpperCase();
  return (
    name.includes('CAMINHAO') ||
    name.includes('CAMINHÃO') ||
    name.includes('CAMINHONETE') ||
    name.includes('BASCULANTE') ||
    name.includes('PIPA') ||
    name.includes('COMBOIO') ||
    name.includes('MELOSA') ||
    name.includes('HILUX') ||
    name.includes('STRADA') ||
    name.includes('TORO') ||
    name.includes('S10') ||
    name.includes('RANGER') ||
    name.includes('L200') ||
    name.includes('AMAROK') ||
    name.includes('FIORINO') ||
    name.includes('APOIO') ||
    name.includes('CARRO') ||
    name.includes('VAN') ||
    name.includes('ONIBUS') ||
    name.includes('ÔNIBUS')
  );
}

export function getMeasurementType(item?: MeasurableEquipment | null): MeasurementUnit {
  return isVehicleOrTruck(item) ? 'KM' : 'HORAS';
}

export function getMeasurementLabel(
  item?: MeasurableEquipment | null,
  context: 'atual' | 'inicial' | 'final' | 'geral' = 'geral'
): string {
  const isKm = isVehicleOrTruck(item);
  if (isKm) {
    if (context === 'atual') return 'Quilometragem Atual (KM)';
    if (context === 'inicial') return 'Quilometragem Inicial (KM)';
    if (context === 'final') return 'Quilometragem Final (KM)';
    return 'Quilometragem (KM)';
  }
  if (context === 'atual') return 'Horímetro Atual (h)';
  if (context === 'inicial') return 'Horímetro Inicial (h)';
  if (context === 'final') return 'Horímetro Final (h)';
  return 'Horímetro (h)';
}

export function getMeasurementUnitSuffix(item?: MeasurableEquipment | null): string {
  return isVehicleOrTruck(item) ? 'km' : 'h';
}

export function formatMeasurementValue(
  value: number | string | null | undefined,
  item?: MeasurableEquipment | null
): string {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (isNaN(num)) return '-';
  if (isVehicleOrTruck(item)) {
    return `${Math.round(num).toLocaleString('pt-BR')} km`;
  }
  return `${num.toFixed(1)} h`;
}
