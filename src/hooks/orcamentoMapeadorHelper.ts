import type { Orcamento } from '../types/comercial.types';

interface CrossMaps {
  cliMap: Map<string, any>;
  eqpMap: Map<string, any>;
  ctaMap: Map<string, any>;
}

export function mapearOrcamentosCompletos(rawOrcamentos: any[], { cliMap, eqpMap, ctaMap }: CrossMaps): Orcamento[] {
  return (rawOrcamentos || []).map((item) => {
    const c = cliMap.get(item.cliente_id);
    const e = eqpMap.get(item.maquina_id);
    const cta = item.conta_bancaria_id ? ctaMap.get(item.conta_bancaria_id) : undefined;
    return {
      ...item,
      cliente_nome: c?.nome || 'Cliente Geral',
      cliente_documento: c?.documento,
      cliente_telefone: c?.telefone,
      maquina_nome: e?.name,
      maquina_codigo: e?.code,
      maquina_modelo: e?.model,
      maquina_serie: e?.serial_number || e?.chassi,
      maquina_placa: e?.placa,
      maquina_ano: e?.ano_fabricacao,
      maquina_potencia: e?.potencia_hp,
      maquina_horimetro_atual: e?.current_hourmeter,
      maquina_combustivel: e?.combustivel_padrao,
      maquina_capacidade_tanque: e?.capacidade_tanque,
      maquina_foto_url: e?.drive_url_foto,
      conta_bancaria_nome: cta?.nome_conta,
      conta_bancaria_pix: cta?.chave_pix,
      conta_bancaria_banco: cta?.banco
    };
  });
}
