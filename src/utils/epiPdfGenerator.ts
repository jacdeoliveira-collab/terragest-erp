import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Funcionario } from '../types/rh.types';

export function gerarFichaEpiPDF(colaborador: Funcionario): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Faixa decorativa superior
  doc.setFillColor(16, 185, 129); // emerald-600
  doc.rect(0, 0, 210, 7, 'F');

  // Cabeçalho Principal
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('TerraGest - Gestão Operacional e Segurança do Trabalho', 14, 16);

  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text('FICHA DE CONTROLE E FORNECIMENTO DE EPI (NR-6)', 14, 23);

  // Bloco de Identificação do Colaborador
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 27, 182, 22, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Colaborador:', 18, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(colaborador.nome || 'Não informado', 42, 33);

  doc.setFont('helvetica', 'bold');
  doc.text('Função / Cargo:', 18, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(colaborador.cargo ? colaborador.cargo.replace(/_/g, ' ') : 'Não informado', 46, 40);

  doc.setFont('helvetica', 'bold');
  doc.text('CPF:', 115, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(colaborador.cpf || colaborador.registro_documento || 'Não informado', 125, 33);

  doc.setFont('helvetica', 'bold');
  doc.text('Data de Emissão:', 115, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('pt-BR'), 144, 40);

  // Termo de Responsabilidade (NR-6)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('TERMO DE RESPONSABILIDADE E COMPROMISSO DE USO (NR-6 - PORTARIA MTb 3.214/78)', 14, 54);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const termoTexto =
    'Declaro ter recebido da empresa os Equipamentos de Proteção Individual (EPIs) abaixo relacionados, ' +
    'em perfeitas condições de uso e higienização, com o devido treinamento e orientação para uso correto. ' +
    'Comprometo-me a usá-los exclusivamente em serviço, zelar por sua guarda e conservação e comunicar qualquer alteração ' +
    'ou dano que os torne impróprios para uso, ciente de que o não uso constitui falta punível nos termos da CLT e da NR-6.';
  
  const termoLinhas = doc.splitTextToSize(termoTexto, 182);
  doc.text(termoLinhas, 14, 59);

  // Tabela para registro e entrega dos EPIs (linhas em branco prontas para preenchimento)
  const colunas = [
    'Data',
    'Descrição do EPI Fornecido',
    'C.A.',
    'Qtd',
    'Motivo (Entrega / Troca)',
    'Assinatura do Empregado'
  ];

  // Gera 12 linhas pautadas
  const linhas = Array.from({ length: 12 }, () => ['', '', '', '', '', '']);

  autoTable(doc, {
    startY: 72,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      minCellHeight: 9,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      1: { cellWidth: 55, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 32, halign: 'center' },
      5: { cellWidth: 38, halign: 'center' }
    }
  });

  const sanitizado = (colaborador.nome || 'colaborador')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');

  doc.save(`ficha_epi_${sanitizado}.pdf`);
}
