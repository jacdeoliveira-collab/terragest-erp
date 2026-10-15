import * as XLSX from 'xlsx';
export { exportarAbastecimentosExcel } from './exportExcelAbastecimentos';
export { exportarServicosHorimetroExcel } from './exportExcelServicos';
export { exportarProducaoViagensExcel, exportarFuncionariosExcel, exportarFrotaExcel } from './exportExcelModulos';

export function exportToExcel<T = any>(data: T[], filename: string, sheetName = 'Dados'): void {
  const worksheet = XLSX.utils.json_to_sheet(data as any[]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
