import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/db';
import type { SipeagroReport, CreateSipeagroDTO } from '../types/regulatory.types';

export async function fetchSipeagroReports(monthFilter?: string): Promise<SipeagroReport[]> {
  if (isSupabaseConfigured && navigator.onLine) {
    try {
      let query = supabase.from('sipeagro_reports').select('*, equipment:equipment_id(code, name)');
      if (monthFilter) {
        query = query.eq('report_month', monthFilter);
      }
      const { data, error } = await query;
      if (!error && data) {
        interface SupabaseSipeagroItem extends SipeagroReport {
          equipment?: { code: string; name: string };
        }
        const formatted: SipeagroReport[] = (data as SupabaseSipeagroItem[]).map((item) => ({
          ...item,
          equipment_code: item.equipment?.code,
          equipment_name: item.equipment?.name
        }));
        await localDb.sipeagro_reports.clear();
        await localDb.sipeagro_reports.bulkPut(formatted);
        return formatted;
      }
    } catch {
      // Fallback local
    }
  }

  let items = await localDb.sipeagro_reports.toArray();
  if (monthFilter) {
    items = items.filter(r => r.report_month === monthFilter);
  }
  return items;
}

export async function createSipeagroReport(dto: CreateSipeagroDTO): Promise<SipeagroReport> {
  const equipment = await localDb.equipment.get(dto.equipment_id);
  const newReport: SipeagroReport = {
    ...dto,
    id: crypto.randomUUID(),
    equipment_code: equipment?.code,
    equipment_name: equipment?.name,
    created_at: new Date().toISOString()
  };

  await localDb.sipeagro_reports.put(newReport);

  if (isSupabaseConfigured && navigator.onLine) {
    try {
      await supabase.from('sipeagro_reports').insert([{
        id: newReport.id,
        equipment_id: newReport.equipment_id,
        report_month: newReport.report_month,
        recipe_number: newReport.recipe_number,
        agronomist_crea: newReport.agronomist_crea,
        farmer_name: newReport.farmer_name,
        farm_name: newReport.farm_name,
        location_coords: newReport.location_coords,
        target_crop: newReport.target_crop,
        target_pest: newReport.target_pest,
        product_commercial_name: newReport.product_commercial_name,
        dosage_per_ha: newReport.dosage_per_ha,
        applied_area_ha: newReport.applied_area_ha,
        spray_volume_l_ha: newReport.spray_volume_l_ha,
        wind_speed_kmh: newReport.wind_speed_kmh,
        temperature_c: newReport.temperature_c,
        humidity_percent: newReport.humidity_percent
      }]);
    } catch {
      await localDb.sync_queue.add({
        table: 'sipeagro_reports',
        action: 'INSERT',
        payload: newReport as unknown as Record<string, unknown>,
        createdAt: new Date().toISOString()
      });
    }
  } else {
    await localDb.sync_queue.add({
      table: 'sipeagro_reports',
      action: 'INSERT',
      payload: newReport as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString()
    });
  }

  return newReport;
}
