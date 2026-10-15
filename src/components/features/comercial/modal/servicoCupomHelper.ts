import type { DadosCupomExtraidos } from '../../../../services/cupomParserLocal';

interface DespesasSetters {
  setCombustivelMaquinaLitros: (v: number) => void;
  setCombustivelMaquinaValor: (v: number) => void;
  setCombustivelApoioLitros: (v: number) => void;
  setCombustivelApoioValor: (v: number) => void;
}

export function aplicarDadosCupomEmDespesas(dados: DadosCupomExtraidos, despesas: DespesasSetters): void {
  if (dados.itens && dados.itens.length > 1) {
    const itMaq = dados.itens.find((it) => it.tipo === 'DIESEL_S500') || dados.itens[0];
    const itApoio = dados.itens.find((it) => it.tipo === 'DIESEL_S10') || dados.itens[1];
    if (itMaq.litros) despesas.setCombustivelMaquinaLitros(itMaq.litros);
    if (itMaq.valorTotal) despesas.setCombustivelMaquinaValor(itMaq.valorTotal);
    if (itApoio.litros) despesas.setCombustivelApoioLitros(itApoio.litros);
    if (itApoio.valorTotal) despesas.setCombustivelApoioValor(itApoio.valorTotal);
  } else if (dados.itens && dados.itens.length === 1) {
    const it = dados.itens[0];
    if (it.litros) despesas.setCombustivelMaquinaLitros(it.litros);
    if (it.valorTotal) despesas.setCombustivelMaquinaValor(it.valorTotal);
  } else {
    if (dados.litros) despesas.setCombustivelMaquinaLitros(dados.litros);
    if (dados.valorTotal) despesas.setCombustivelMaquinaValor(dados.valorTotal);
  }
}
