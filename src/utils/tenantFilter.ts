export const DEFAULT_LEGACY_TENANT = '00000000-0000-0000-0000-000000000001';

/**
 * Garante isolamento estrito multi-empresa:
 * - Se tenantId for a empresa legado/padrão, inclui registros antigos sem tenant_id
 * - Para QUALQUER outra empresa, filtra estritamente por tenant_id = empresa selecionada
 */
export function aplicarFiltroTenant(
  query: any,
  tenantId: string | null | undefined
): any {
  const tId = tenantId || DEFAULT_LEGACY_TENANT;
  if (tId === DEFAULT_LEGACY_TENANT) {
    return query.or(`tenant_id.eq.${DEFAULT_LEGACY_TENANT},tenant_id.is.null`);
  }
  return query.eq('tenant_id', tId);
}

export function obterFiltroTenantString(tenantId: string | null | undefined): string {
  const tId = tenantId || DEFAULT_LEGACY_TENANT;
  if (tId === DEFAULT_LEGACY_TENANT) {
    return `tenant_id.eq.${DEFAULT_LEGACY_TENANT},tenant_id.is.null`;
  }
  return `tenant_id.eq.${tId}`;
}
