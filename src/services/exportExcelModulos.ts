import * as XLSX from 'xlsx';
import type { ApontamentoViagemItem } from '../types/producao.types';
import type { Funcionario } from '../types/rh.types';
import type { Equipment } from '../types/equipment.types';

export function exportarProducaoViagensExcel(viagens: ApontamentoViagemItem[], obraNome?: string): void {
  if (!viagens || viagens.length === 0) return;
  const dados = viagens.map((t, idx) => {
    const dataHoraPartes = (t.data_hora || '').split('T');
    return {
      '#': idx + 1,
      'Ticket': t.numero_ticket || `T-${String(idx + 1).padStart(4, '0')}`,
      'Data': dataHoraPartes[0] || '',
      'Hora': dataHoraPartes[1]?.slice(0, 5) || '',
      'Caminhão / Placa': `${t.caminhao_codigo || ''} ${t.caminhao_nome || ''} (${t.caminhao_placa || '-'})`.trim(),
      'Motorista': t.operador_caminhao_nome || '-',
      'Escavadeira / Carregadeira': `${t.escavadeira_codigo || ''} ${t.escavadeira_nome || ''}`.trim(),
      'Apontador': t.apontador_nome || '-',
      'Material': t.material_tipo || 'SOLO_COMUM',
      'Volume (m³)': Number(t.volume_m3 || 0),
      'Origem (Estaca/Área)': t.origem_estaca || '-',
      'Destino (Bota-fora)': t.destino_estaca || '-',
      'DMT (km)': t.dmt_km ? Number(t.dmt_km) : ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Viagens Produção');
  const nomeObra = obraNome ? `_${obraNome.replace(/\s+/g, '_')}` : '';
  XLSX.writeFile(wb, `Producao_Terraplanagem${nomeObra}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportarFuncionariosExcel(funcionarios: Funcionario[]): void {
  if (!funcionarios || funcionarios.length === 0) return;
  const dados = funcionarios.map((f, idx) => ({
    '#': idx + 1,
    'Nome Completo': f.nome,
    'Cargo / Função': f.cargo,
    'CPF': f.cpf || '-',
    'Telefone': f.telefone || '-',
    'Status': f.status || 'ATIVO',
    'Custo Hora (R$/h)': Number(f.custo_hora_normal || 0),
    'Salário Base (R$)': Number(f.salario_base || 0),
    'CNH': f.cnh || '-',
    'Validade CNH': f.validade_cnh || f.vencimento_cnh || '-',
    'Validade ASO': f.aso_validade || f.vencimento_aso || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Colaboradores');
  XLSX.writeFile(wb, `Colaboradores_RH_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportarFrotaExcel(frota: Equipment[]): void {
  if (!frota || frota.length === 0) return;
  const dados = frota.map((e, idx) => ({
    '#': idx + 1,
    'Código': e.code || '',
    'Equipamento / Máquina': e.name || '',
    'Tipo': e.type || 'MÁQUINA',
    'Marca': e.marca || '-',
    'Modelo': e.model || '-',
    'Placa / Chassi': e.placa || e.chassi || '-',
    'Horímetro / KM Atual': Number(e.current_hourmeter || 0),
    'Propriedade': e.tipo_propriedade || 'PRÓPRIO',
    'Status': e.status || 'ATIVO',
    'Fornecedor / Locadora': e.fornecedor_locacao || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Frota');
  XLSX.writeFile(wb, `Frota_Equipamentos_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
