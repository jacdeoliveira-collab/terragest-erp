import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localDb } from '../lib/db';
import type { Equipment, CreateEquipmentDTO } from '../types/equipment.types';

export async function fetchEquipmentList(): Promise<Equipment[]> {
  if (isSupabaseConfigured && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('code', { ascending: true });

      if (!error && data) {
        await localDb.equipment.clear();
        await localDb.equipment.bulkPut(data as Equipment[]);
        return data as Equipment[];
      }
    } catch {
      // Fallback local
    }
  }
  return await localDb.equipment.toArray();
}

export async function createEquipment(dto: CreateEquipmentDTO): Promise<Equipment> {
  const newEquipment: Equipment = {
    ...dto,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await localDb.equipment.put(newEquipment);

  if (isSupabaseConfigured && navigator.onLine) {
    try {
      await supabase.from('equipment').insert([newEquipment]);
    } catch {
      await localDb.sync_queue.add({
        table: 'equipment',
        action: 'INSERT',
        payload: newEquipment as unknown as Record<string, unknown>,
        createdAt: new Date().toISOString()
      });
    }
  } else {
    await localDb.sync_queue.add({
      table: 'equipment',
      action: 'INSERT',
      payload: newEquipment as unknown as Record<string, unknown>,
      createdAt: new Date().toISOString()
    });
  }

  return newEquipment;
}
