import type { Funcionario } from '../types/rh.types';
import type { ChecklistItem } from '../types/checklist.types';
import type { AlertaItem } from '../types/alertaCentral.types';

export function extrairAlertasOperacionais(
  funcionarios: Funcionario[],
  checklists: ChecklistItem[]
): AlertaItem[] {
  const alertas: AlertaItem[] = [];
  const hoje = new Date().toISOString().slice(0, 10);
  const limite30Dias = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  // RH: CNH e ASO
  funcionarios.forEach((f) => {
    if (f.status !== 'ATIVO') return;

    // CNH
    const cnhVal = f.vencimento_cnh || f.validade_cnh;
    if (cnhVal) {
      if (cnhVal < hoje) {
        alertas.push({
          id: `rh-cnh-vencida-${f.id}`,
          modulo: 'RH',
          titulo: `CNH Vencida: ${f.nome}`,
          descricao: `Venceu em ${cnhVal.split('-').reverse().join('/')} - Cargo: ${f.cargo || 'Operador'}`,
          nivel: 'CRITICO',
          dataReferencia: cnhVal,
          rota: '/rh',
          tagModulo: 'RH & Segurança'
        });
      } else if (cnhVal <= limite30Dias) {
        alertas.push({
          id: `rh-cnh-prox-${f.id}`,
          modulo: 'RH',
          titulo: `CNH a Vencer (30d): ${f.nome}`,
          descricao: `Vence em ${cnhVal.split('-').reverse().join('/')}`,
          nivel: 'ALERTA',
          dataReferencia: cnhVal,
          rota: '/rh',
          tagModulo: 'RH & Segurança'
        });
      }
    }

    // ASO
    const asoVal = f.vencimento_aso || f.aso_validade;
    if (asoVal) {
      if (asoVal < hoje) {
        alertas.push({
          id: `rh-aso-vencido-${f.id}`,
          modulo: 'RH',
          titulo: `ASO Ocupacional Vencido: ${f.nome}`,
          descricao: `Exame periódico venceu em ${asoVal.split('-').reverse().join('/')}`,
          nivel: 'CRITICO',
          dataReferencia: asoVal,
          rota: '/rh',
          tagModulo: 'RH & Segurança'
        });
      } else if (asoVal <= limite30Dias) {
        alertas.push({
          id: `rh-aso-prox-${f.id}`,
          modulo: 'RH',
          titulo: `ASO a Vencer: ${f.nome}`,
          descricao: `Vencimento em ${asoVal.split('-').reverse().join('/')}`,
          nivel: 'ALERTA',
          dataReferencia: asoVal,
          rota: '/rh',
          tagModulo: 'RH & Segurança'
        });
      }
    }
  });

  // Checklists com não conformidade ou reprovados nos últimos 7 dias
  const limite7DiasAtras = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  checklists.forEach((c) => {
    const reprovado = c.status_geral_aprovado === false || (c.status_geral && c.status_geral.toUpperCase() === 'REPROVADO');
    if (reprovado && c.data >= limite7DiasAtras) {
      alertas.push({
        id: `chk-reprovado-${c.id}`,
        modulo: 'CHECKLIST',
        titulo: `Checklist Reprovado: ${c.maquina_codigo || c.maquina_nome || 'Máquina'}`,
        descricao: `${c.operador_nome ? `Op. ${c.operador_nome} • ` : ''}${c.observacoes || 'Não conformidade detectada na inspeção diária'}`,
        nivel: 'CRITICO',
        dataReferencia: c.data,
        rota: '/checklists',
        tagModulo: 'Checklist'
      });
    }
  });

  return alertas;
}
