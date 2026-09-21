import { useState, useEffect, useCallback } from 'react';
import type { Equipment, CreateEquipmentDTO } from '../types/equipment.types';
import { fetchEquipmentList, createEquipment } from '../services/equipmentService';

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEquipmentList();
      setEquipment(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar maquinário e drones');
    } finally {
      setLoading(false);
    }
  }, []);

  const addEquipment = async (dto: CreateEquipmentDTO) => {
    const created = await createEquipment(dto);
    setEquipment((prev) => [...prev, created]);
    return created;
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { equipment, loading, error, refetch: loadData, addEquipment };
}
