export interface ModuloSistemaDef {
  rota: string;
  nome: string;
  descricao: string;
}

export interface PlanoSaasRecord {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string | null;
  valor_mensal: number;
  limite_usuarios: number;
  ativo: boolean;
  destaque: boolean;
  ordem: number;
  modulos_habilitados: string[];
  created_at?: string;
  updated_at?: string;
}

export type CreatePlanoSaasDTO = Omit<PlanoSaasRecord, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePlanoSaasDTO = Partial<CreatePlanoSaasDTO>;

export const MODULOS_SISTEMA: ModuloSistemaDef[] = [
  { rota: '/comercial', nome: 'Serviços por Horímetro', descricao: 'Locação por horímetro, medições PDF e recibos' },
  { rota: '/agenda', nome: 'Agenda e Fila de Máquinas', descricao: 'Ordem de atendimento, previsão e WhatsApp' },
  { rota: '/clientes', nome: 'Clientes', descricao: 'Carteira de clientes, documentos e extratos' },
  { rota: '/centros-custo', nome: 'Centros de Custo', descricao: 'Rateio por centro de custo, data e ano safra' },
  { rota: '/frota', nome: 'Gestão de Maquinário', descricao: 'Cadastro de frota, horímetros e disponibilidade' },
  { rota: '/bde', nome: 'Boletim de Equipamentos', descricao: 'Boletins diários (BDE) com assinatura PIN' },
  { rota: '/producao', nome: 'Sinaleira & Produção', descricao: 'Apontamento de viagens, cargas e produção' },
  { rota: '/almoxarifado', nome: 'Almoxarifado & Insumos', descricao: 'Estoque de peças, filtros e movimentações' },
  { rota: '/financeiro', nome: 'Gestão Financeira', descricao: 'Contas a pagar, receber, DRE, bancos e Asaas' },
  { rota: '/rh', nome: 'RH & Operadores', descricao: 'Colaboradores, comissões por hora e vales' },
  { rota: '/abastecimento', nome: 'Abastecimento & Melosa', descricao: 'Controle de diesel, cupons e comboio melosa' },
  { rota: '/manutencao', nome: 'Manutenção Preventiva', descricao: 'Planos preventivos, alertas e corretivas' },
  { rota: '/checklist', nome: 'Checklist Diário', descricao: 'Inspeção pré-operacional de equipamentos' }
];

export const ROTAS_SEMPRE_LIBERADAS = [
  '/inicio',
  '/gestao',
  '/planos',
  '/minha-empresa',
  '/master'
];
