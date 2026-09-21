import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/db';
import type { DailyBulletin, CreateBDEDTO } from '../types/bde.types';

export async function fetchDailyBulletins(): Promise<DailyBulletin[]> {
  if (isSupabaseConfigured && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('daily_bulletins')
        .select('*, equipment:equipment_id(code, name)')
        .order('date', { ascending: false });

      if (!error && data) {
        interface SupabaseBDEItem extends DailyBulletin {
          equipment?: { code: string; name: string };
        }
        const formatted: DailyBulletin[] = (data as SupabaseBDEItem[]).map((item) => ({
          ...item,
          equipment_code: item.equipment?.code,
          equipment_name: item.equipment?.name
        }));
        await localDb.daily_bulletins.clear();
        await localDb.daily_bulletins.bulkPut(formatted);
        return formatted;
      }
    } catch {
      // Fallback local
    }
  }
  return await localDb.daily_bulletins.toArray();
}

export async function createDailyBulletin(dto: CreateBDEDTO): Promise<DailyBulletin> {
  const total_hours = Math.max(0, dto.final_hourmeter - dto.initial_hourmeter);
  const equipment = await localDb.equipment.get(dto.equipment_id);

  const newBulletin: DailyBulletin = {
    ...dto,
    id: crypto.randomUUID(),
    total_hours,
    equipment_code: equipment?.code,
    equipment_name: equipment?.name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await localDb.daily_bulletins.put(newBulletin);

  if (equipment && dto.final_hourmeter > equipment.current_hourmeter) {
    equipment.current_hourmeter = dto.final_hourmeter;
    await localDb.equipment.put(equipment);
  }

  if (isSupabaseConfigured && navigator.onLine) {
    try {
      await supabase.from('daily_bulletins').insert([{
        id: newBulletin.id,
        equipment_id: newBulletin.equipment_id,
        date: newBulletin.date,
        operator_name: newBulletin.operator_name,
        client_name: newBulletin.client_name,
        work_location: newBulletin.work_location,
        initial_hourmeter: newBulletin.initial_hourmeter,
        final_hourmeter: newBulletin.final_hourmeter,
        fuel_liters: newBulletin.fuel_liters,
        service_description: newBulletin.service_description,
        notes: newBulletin.notes,
        status: newBulletin.status
      }]);
    } catch {
      await localDb.sync_queue.add({
        table: 'daily_bulletins',
        action: 'INSERT',
        payload: newBulletin as unknown as Record<string, unknown>,
        createdAt: new Date().toISOString()
      });
    }
  } else {
    await localDb.sync_queue.add({
      table: 'daily_bulletins',
      action: 'INSERT',
      payload: newBulletin as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString()
    });
  }

  return newBulletin;
}
