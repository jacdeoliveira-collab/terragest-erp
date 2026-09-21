import { useState, useEffect, useCallback } from 'react';
import type { SipeagroReport, CreateSipeagroDTO } from '../types/regulatory.types';
import { fetchSipeagroReports, createSipeagroReport } from '../services/regulatoryService';

export function useRegulatoryReports(initialMonth?: string) {
  const [reports, setReports] = useState<SipeagroReport[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth || '');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSipeagroReports(selectedMonth || undefined);
      setReports(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar relatórios MAPA/SIPEAGRO');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  const addReport = async (dto: CreateSipeagroDTO) => {
    const created = await createSipeagroReport(dto);
    setReports((prev) => [created, ...prev]);
    return created;
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { reports, selectedMonth, setSelectedMonth, loading, error, refetch: loadData, addReport };
}
