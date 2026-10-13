export type StatusServicoHorimetro = 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';

export interface ServicoHorimetro {
  id: string;
  tenant_id?: string;
  cliente_id?: string;
  cliente_nome: string;
  cliente_documento?: string;
  cliente_telefone?: string;
  obra_id?: string;
  obra_nome?: string;
  maquina_id?: string;
  maquina_nome: string;
  operador_id?: string;
  operador_nome: string;
  descricao_servico: string;
  data_inicio: string;
  data_fim?: string;
  horimetro_inicial: number;
  horimetro_final?: number;
  foto_horimetro_inicial?: string;
  foto_horimetro_final?: string;
  alerta_painel?: string;
  valor_hora: number;
  horas_trabalhadas: number;
  faturamento_bruto: number;
  // Combustível discriminado
  combustivel_maquina_litros: number; // Diesel da Máquina (ex: S500 300,01 L)
  combustivel_maquina_valor: number;  // Valor Diesel Máquina (ex: R$ 2.124,07)
  combustivel_apoio_litros: number;   // Diesel Caminhonete / Carro Apoio (ex: S10 57,73 L)
  combustivel_apoio_valor: number;    // Valor Diesel Apoio (ex: R$ 420,27)
  combustivel_total_valor: number;    // Soma total do combustível (ex: R$ 2.544,34)
  foto_cupom_combustivel?: string;
  despesa_operador: number;           // Diária do operador
  despesa_apoio: number;              // Outros custos de deslocamento
  despesa_manutencao: number;         // Manutenção / Filtros
  despesas_total: number;
  lucro_liquido: number;
  margem_lucro: number;
  // Remuneração e vales do operador
  valor_hora_operador?: number;       // Valor configurado da hora do operador (R$/h)
  adiantamento_operador_valor?: number; // Vale / adiantamento concedido ao operador
  adiantamento_operador_data?: string;  // Data da concessão do vale
  saldo_pagar_operador?: number;        // Saldo líquido a pagar ao operador
  data_pagamento_operador?: string;     // Data prevista/realizada de pagamento
  status_pagamento_operador?: 'PENDENTE' | 'PAGO' | 'PARCIAL';
  // Adiantamento e recebimento do cliente
  valor_adiantamento?: number;        // Sinal / Adiantamento recebido do cliente
  data_adiantamento?: string;         // Data do pagamento do sinal
  forma_pagamento_adiantamento?: string; // PIX, Dinheiro, Transferência, etc.
  adiantamentos_historico?: AdiantamentoItem[]; // Histórico completo de adiantamentos/parcelas recebidas
  saldo_restante?: number;            // Saldo restante a receber (faturamento - adiantamento)
  status_pagamento_cliente?: 'PENDENTE' | 'PARCIAL' | 'QUITADO';
  condicao_pagamento?: string;        // À vista, 15/30 dias, sinal 50/50, etc.
  forma_pagamento?: string;           // PIX, Boleto, Transferência, etc.
  conta_bancaria_id?: string;         // Conta/Chave Pix da empresa para recebimento
  prazo_descricao?: string;           // Texto livre do prazo acordado
  data_vencimento?: string;           // Data prevista / vencimento do prazo
  parcelas?: ParcelaItem[];           // Cronograma de parcelas com valores e datas editáveis
  fotos_trabalho?: FotoTrabalhoItem[];// Até 4 fotos da execução com legenda
  maquinas_itens?: ServicoMaquinaItem[]; // Lista de múltiplas máquinas no mesmo serviço
  despesas_itens?: DespesaItemServico[]; // Despesas discriminadas (Peças, Lubrificantes, Logística)
  abastecimentos_ids?: string[];      // IDs dos abastecimentos vinculados a este serviço
  status: StatusServicoHorimetro;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
}

export type CategoriaDespesaServico =
  | 'PECAS_LUBRIFICANTES'
  | 'COMBUSTIVEL'
  | 'LOGISTICA_APOIO'
  | 'ALIMENTACAO_HOSPEDAGEM'
  | 'OUTROS';

export interface DespesaItemServico {
  id: string;
  categoria: CategoriaDespesaServico;
  descricao: string;
  fornecedor: string;
  valor: number;
  data: string;
  forma_pagamento: string;
  status_pagamento: 'PAGO' | 'PENDENTE';
  comprovante_url?: string;
  created_at?: string;
}

export interface AdiantamentoItem {
  id: string;
  valor: number;
  data: string;
  forma_pagamento: string;
  observacao?: string;
  comprovante_url?: string;
  numero_recibo?: string;
  created_at?: string;
}

export interface ParcelaItem {
  id: string;
  numero: number;
  valor: number;
  data_vencimento: string;
  forma_pagamento?: string;
  forma?: string;
  status?: 'PENDENTE' | 'PAGO';
  data_pagamento?: string;
  observacao?: string;
}

export interface ServicoMaquinaItem {
  id: string;
  maquina_id?: string;
  maquina_nome: string;
  operador_id?: string;
  operador_nome: string;
  valor_hora: number;
  horimetro_inicial: number;
  horimetro_final?: number;
  foto_horimetro_inicial?: string;
  foto_horimetro_final?: string;
  alerta_painel?: string;
  horas_trabalhadas: number;
  faturamento_bruto: number;
  valor_hora_operador?: number;
  despesa_operador?: number;
}

export interface FotoTrabalhoItem {
  id?: string;
  url: string;
  legenda: string;
  timestamp?: string;
}

export type CreateServicoHorimetroDTO = Omit<ServicoHorimetro, 'id' | 'created_at' | 'updated_at'>;

