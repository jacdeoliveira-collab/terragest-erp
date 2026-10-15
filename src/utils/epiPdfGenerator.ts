import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Funcionario, EpiEntregue } from '../types/rh.types';
import { getEmpresaAtivaCache } from '../services/empresaAtivaService';
import { desenharRodapeTerraGest } from './pdf/pdfEmpresaLayout';
import { desenharLogoNoPdf } from './pdf/pdfLogoHelper';
import { obterDadosAssinaturaEmpresa, desenharAssinaturaDigital } from './pdf/pdfAssinaturaEmpresaHelper';

export function gerarFichaEpiPDF(colaborador: Funcionario, epis?: EpiEntregue[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const empresa = getEmpresaAtivaCache() || {};
  const dadosEmp = obterDadosAssinaturaEmpresa(empresa);
  const razaoSocial = dadosEmp.razaoSocial;
  const cnpj = dadosEmp.cnpj;

  // Faixa superior decorativa
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 6, 'F');

  let textX = 14;
  if (desenharLogoNoPdf(doc, 14, 9, 36, 16, empresa)) {
    textX = 54;
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text(razaoSocial.toUpperCase(), textX, 15);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const infoLinha = [cnpj, empresa.contato_telefone, empresa.contato_email].filter(Boolean).join(' • ');
  if (infoLinha) doc.text(infoLinha, textX, 20);

  doc.setDrawColor(209, 213, 219);
  doc.line(14, 28, 196, 28);

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('FICHA DE REGISTRO E FORNECIMENTO DE EPI (NR-6 - MTE)', 14, 35);

  // Bloco de Identificação
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(14, 39, 182, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Colaborador:', 18, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(colaborador.nome || 'Não informado', 40, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Função:', 18, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(colaborador.cargo ? colaborador.cargo.replace(/_/g, ' ') : 'Não informado', 34, 51);

  doc.setFont('helvetica', 'bold');
  doc.text('CPF:', 115, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(colaborador.cpf || colaborador.registro_documento || 'Não informado', 124, 45);

  doc.setFont('helvetica', 'bold');
  doc.text('Emissão:', 115, 51);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('pt-BR'), 130, 51);

  // Termo Legal NR-6
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('TERMO DE RESPONSABILIDADE E COMPROMISSO DE USO (NR-6)', 14, 62);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const termoTexto =
    'Declaro ter recebido da empresa, gratuitamente, os Equipamentos de Proteção Individual (EPIs) abaixo relacionados, ' +
    'em perfeitas condições de uso, higienizados e aprovados pelo MTE (com C.A. válido). Comprometo-me a utilizá-los estritamente ' +
    'no exercício de minhas funções e zelar por sua integridade conforme art. 158 da CLT.';
  doc.text(doc.splitTextToSize(termoTexto, 182), 14, 66);

  const colunas = ['Data Entrega', 'Descrição do EPI', 'C.A.', 'Qtd', 'Motivo', 'Assinatura do Colaborador'];
  const linhas = (epis && epis.length > 0)
    ? epis.map((e) => [
        e.data_entrega ? e.data_entrega.split('-').reverse().join('/') : '',
        e.descricao_equipamento,
        e.numero_ca,
        String(e.quantidade || 1),
        e.motivo || 'Entrega',
        ''
      ])
    : Array.from({ length: 8 }, () => ['', '', '', '', '', '']);

  autoTable(doc, {
    startY: 75,
    head: [colunas],
    body: linhas,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.5, minCellHeight: 7, valign: 'middle' },
    headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      1: { cellWidth: 54, halign: 'left' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 14, halign: 'center' },
      4: { cellWidth: 28, halign: 'center' },
      5: { cellWidth: 44, halign: 'center' }
    }
  });

  const finalY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 180) + 12;

  if (finalY < 270) {
    desenharAssinaturaDigital(doc, 130, finalY - 14, 38, 12, empresa);
    doc.setDrawColor(156, 163, 175);
    doc.line(18, finalY, 90, finalY);
    doc.line(115, finalY, 187, finalY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(`Colaborador: ${colaborador.nome}`, 54, finalY + 4, { align: 'center' });
    if (dadosEmp.textoResponsavel) {
      doc.text(dadosEmp.textoResponsavel, 151, finalY + 4, { align: 'center' });
      doc.text('Responsável Técnico / Segurança (SST)', 151, finalY + 7.5, { align: 'center' });
    } else {
      doc.text('Responsável Técnico / Segurança (SST)', 151, finalY + 4, { align: 'center' });
    }
  }

  // Rodapé Propaganda TerraGest
  desenharRodapeTerraGest(doc, 1, 1);

  const sanitizado = (colaborador.nome || 'colaborador').toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`ficha_epi_${sanitizado}.pdf`);
}
