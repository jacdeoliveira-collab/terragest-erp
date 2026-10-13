import type { TipoCombustivel } from './abastecimento.types';
import type { FormaPagamentoDespesa } from './contasPagar.types';

export interface ItemCombustivelCupom {
  maquinaId: string;
  maquinaNome?: string;
  horimetro?: number;
  tipoCombustivel: TipoCombustivel;
  quantidadeLitros: number;
  valorTotal: number;
}

export interface LancarCupomCombustivelDTO {
  tenantId?: string;
  data: string;
  postoFornecedor: string;
  numeroNfCupom?: string;
  fotoCupomUrl?: string;
  formaPagamento: FormaPagamentoDespesa | string;
  statusPagamento: 'PAGO' | 'PENDENTE';
  contaSaida: string;
  obraId?: string;
  servicoId?: string;
  maquinaPrincipal: ItemCombustivelCupom;
  veiculoApoio?: ItemCombustivelCupom;
}
