import Dexie, { type Table } from 'dexie';
import type { Equipment } from '../types/equipment.types';
import type { DailyBulletin } from '../types/bde.types';
import type { SipeagroReport } from '../types/regulatory.types';

export interface SyncQueueItem {
  id?: number;
  table: 'equipment' | 'daily_bulletins' | 'sipeagro_reports';
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  createdAt: string;
}

export class TerraGestDatabase extends Dexie {
  equipment!: Table<Equipment, string>;
  daily_bulletins!: Table<DailyBulletin, string>;
  sipeagro_reports!: Table<SipeagroReport, string>;
  sync_queue!: Table<SyncQueueItem, number>;

  constructor() {
    super('TerraGestOfflineDB');
    this.version(1).stores({
      equipment: 'id, code, category, type, status',
      daily_bulletins: 'id, equipment_id, date, status',
      sipeagro_reports: 'id, equipment_id, report_month, recipe_number',
      sync_queue: '++id, table, action, createdAt'
    });
  }
}

export const localDb = new TerraGestDatabase();
