export type IntegrationProvider = 'google_drive' | 'onedrive' | 'dropbox' | string;
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface TenantIntegration {
  id: string;
  tenant_id: string;
  provider: IntegrationProvider;
  account_email?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  folder_id?: string | null;
  folder_name?: string | null;
  status: IntegrationStatus;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface SaveIntegrationDTO {
  provider: IntegrationProvider;
  account_email?: string;
  access_token?: string;
  folder_id?: string;
  folder_name?: string;
  status?: IntegrationStatus;
  metadata?: Record<string, unknown>;
}
