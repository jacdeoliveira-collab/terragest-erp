import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PlanoManutencaoItem } from '../types/manutencao.types';
import type { Funcionario } from '../types/rh.types';
import { desenharCabecalhoPdf, desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';

export function exportarManutencoesPDF(manutencoes: PlanoManutencaoItem[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = desenharCabecalhoPdf(
    doc,
    'RELATÓRIO DE MANUTENÇÕES PREVENTIVAS & CORRETIVAS',
    `Total de Registros: ${manutencoes.length}  •  Emissão: ${new Date().toLocaleString('pt-BR')}`
  );

  const colunas = ['Máquina', 'Serviço', 'Últ. Horímetro', 'Próx. Alvo', 'Peças (R$)', 'Mão de Obra', 'Status'];
  const linhas = manutencoes.map((m) => [
    m.maquina_codigo ? `${m.maquina_codigo} - ${m.maquina_nome || ''}` : (m.maquina_nome || '-'),
    m.tipo_servico_nome || m.descricao_servico || 'Manutenção',
    `${Number(m.ultimo_horimetro_realizado || 0).toFixed(1)} h`,
    `${Number(m.horimetro_proxima_troca || 0).toFixed(1)} h`,
    `R$ ${(Number(m.valor_pecas) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${(Number(m.valor_mao_obra) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    m.status || 'EM_DIA'
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  doc.save(`manutencoes_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportarFuncionariosPDF(funcionarios: Funcionario[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = desenharCabecalhoPdf(
    doc,
    'QUADRO DE COLABORADORES & COMPLIANCE RH',
    `Total de Colaboradores: ${funcionarios.length}  •  Emissão: ${new Date().toLocaleString('pt-BR')}`
  );

  const colunas = ['Nome', 'Cargo', 'CNH / Validade', 'ASO / Validade', 'Salário Base', 'Status'];
  const linhas = funcionarios.map((f) => [
    f.nome,
    (f.cargo || '').replace('_', ' '),
    f.vencimento_cnh || f.validade_cnh || 'Não possui',
    f.vencimento_aso || f.aso_validade || '-',
    `R$ ${(Number(f.salario_base) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    f.status || 'ATIVO'
  ]);

  autoTable(doc, {
    startY,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  });

  desenharRodapeTerraGest(doc, 1, 1);
  doc.save(`colaboradores_${new Date().toISOString().slice(0, 10)}.pdf`);
}
