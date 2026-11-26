export const DEFAULT_LEGACY_TENANT = '00000000-0000-0000-0000-000000000001';
const EMPTY_SAFE_UUID = '00000000-0000-0000-0000-000000000000';

/**
 * Isolamento estrito multi-empresa:
 * - Se tenantId for nulo/indefinido, filtra por UUID inexistente (0 linhas) — NUNCA cai na Matriz.
 * - Para qualquer empresa assinante, filtra estritamente por tenant_id = empresa ativa.
 */
export function aplicarFiltroTenant(
  query: any,
  tenantId: string | null | undefined
): any {
  if (!tenantId) {
    return query.eq('tenant_id', EMPTY_SAFE_UUID);
  }
  return query.eq('tenant_id', tenantId);
}

export function obterFiltroTenantString(tenantId: string | null | undefined): string {
  if (!tenantId) {
    return `tenant_id.eq.${EMPTY_SAFE_UUID}`;
  }
  return `tenant_id.eq.${tenantId}`;
}
