export interface SipeagroReport {
  id: string;
  equipment_id: string;
  equipment_code?: string;
  equipment_name?: string;
  report_month: string; // YYYY-MM
  recipe_number: string;
  agronomist_crea: string;
  farmer_name: string;
  farm_name: string;
  location_coords?: string;
  target_crop: string;
  target_pest: string;
  product_commercial_name: string;
  dosage_per_ha: string;
  applied_area_ha: number;
  spray_volume_l_ha: number;
  wind_speed_kmh?: number;
  temperature_c?: number;
  humidity_percent?: number;
  created_at: string;
}

export type CreateSipeagroDTO = Omit<SipeagroReport, 'id' | 'created_at' | 'equipment_code' | 'equipment_name'>;
