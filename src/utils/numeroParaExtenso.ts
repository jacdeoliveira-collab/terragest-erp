const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const DEZ_A_DEZENOVE = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const DEZENAS = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function converterGrupo(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);
  if (d === 1) {
    partes.push(DEZ_A_DEZENOVE[u]);
  } else {
    if (d > 1) partes.push(DEZENAS[d]);
    if (u > 0) partes.push(UNIDADES[u]);
  }
  return partes.join(' e ');
}

export function numeroParaExtenso(valor: number): string {
  if (!valor || valor <= 0) return 'zero reais';
  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);

  const milhoes = Math.floor(inteiro / 1000000);
  const milhares = Math.floor((inteiro % 1000000) / 1000);
  const resto = inteiro % 1000;

  const partes: string[] = [];

  if (milhoes > 0) {
    partes.push(`${converterGrupo(milhoes)} ${milhoes === 1 ? 'milhão' : 'milhões'}`);
  }
  if (milhares > 0) {
    partes.push(`${converterGrupo(milhares)} mil`);
  }
  if (resto > 0) {
    partes.push(converterGrupo(resto));
  }

  let textoReais = partes.join(' e ');
  if (inteiro === 1) textoReais += ' real';
  else if (inteiro > 1) textoReais += ' reais';

  if (centavos > 0) {
    const textoCentavos = `${converterGrupo(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
    return inteiro > 0 ? `${textoReais} e ${textoCentavos}` : textoCentavos;
  }

  return textoReais;
}
