export interface DadosPainelExtraidos {
  horimetro?: number;
  alertaPainel?: string;
  textoBruto: string;
  sucesso: boolean;
}

/**
 * Analisa o texto retornado pelo OCR da foto de um painel de máquina ou caminhão.
 * Extrai a leitura de horímetro/odômetro e eventuais mensagens de alerta no display.
 */
export function analisarPainelHorimetro(textoBruto: string): DadosPainelExtraidos {
  if (!textoBruto || !textoBruto.trim()) {
    return { textoBruto: '', sucesso: false };
  }

  const linhas = textoBruto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let horimetroEncontrado: number | undefined;
  let alertaEncontrado: string | undefined;

  const ehLinhaNaoHorimetro = (l: string) => {
    // Ignora voltagem (ex: 24.2V, 12.8 V), pressão (bar, psi), RPM, temperatura (°C), consumo (L/h), relógio (14:30)
    return /\b\d+([.,]\d+)?\s*(v|volts?|bar|psi|kpa|rpm|°c|°f|%|km\/h|mph)\b/i.test(l) ||
      /l\s*[\/\\]\s*h/i.test(l) ||
      /^[0-2]?\d:[0-5]\d\b/.test(l);
  };

  // 1. Procurar por Horímetro explícito com marcadores de hora/odômetro
  // Ex: "Horimetro: 4189.0", "1250.5 h", "ENG. HRS 4189.0", "Total Hours: 3200.5", "ODO 158420 km"
  const regexComPrefixo = /(?:hor[ií]metro|horas?|hours?|hrs?|eng[.\s]*hrs?|engine[.\s]*hours?|meter|odo|od[oô]metro|tot[.\s]*hrs?|total)[\s\:\.\=\-]*(\d{1,6}(?:[\.\,]\s*\d{1,2})?)/i;
  const regexComSufixo = /(\d{1,6}(?:[\.\,]\s*\d{1,2})?)\s*(?:h|hr|hrs|horas?|hours?|km)\b/i;

  for (const linha of linhas) {
    if (ehLinhaNaoHorimetro(linha)) continue;

    const matchPrefixo = linha.match(regexComPrefixo);
    if (matchPrefixo && matchPrefixo[1]) {
      const val = parseFloat(matchPrefixo[1].replace(/\s+/g, '').replace(',', '.'));
      if (!isNaN(val) && val > 0 && val < 500000) {
        horimetroEncontrado = val;
        break;
      }
    }

    const matchSufixo = linha.match(regexComSufixo);
    if (matchSufixo && matchSufixo[1]) {
      const val = parseFloat(matchSufixo[1].replace(/\s+/g, '').replace(',', '.'));
      if (!isNaN(val) && val > 0 && val < 500000) {
        horimetroEncontrado = val;
        break;
      }
    }
  }

  // 2. Se não achou com rótulo explícito, buscar padrão decimal típico em linhas limpas
  if (horimetroEncontrado === undefined) {
    const candidatosDecimais: number[] = [];
    const regexDecimal = /\b(\d{1,5}[\.\,]\d{1,2})\b/g;

    for (const linha of linhas) {
      if (ehLinhaNaoHorimetro(linha)) continue;
      let matchDec: RegExpExecArray | null;
      while ((matchDec = regexDecimal.exec(linha)) !== null) {
        const val = parseFloat(matchDec[1].replace(',', '.'));
        // Evita voltagem comum (11.5 - 14.8 e 23.5 - 28.5) caso não tenha unidade explícita
        const pareceVoltagem = (val >= 11.5 && val <= 14.8) || (val >= 23.5 && val <= 28.5);
        if (!isNaN(val) && val >= 1 && val < 50000 && !pareceVoltagem) {
          candidatosDecimais.push(val);
        }
      }
    }

    if (candidatosDecimais.length > 0) {
      // Prioriza horímetro provável (geralmente >= 50 horas de máquina)
      const provaveis = candidatosDecimais.filter((v) => v >= 50);
      horimetroEncontrado = provaveis.length > 0 ? provaveis[0] : candidatosDecimais[0];
    }
  }

  // 3. Fallback para Odômetro ou horímetro inteiro (ex: 4189 ou 158420)
  if (horimetroEncontrado === undefined) {
    const regexInteiro = /\b(\d{3,6})\b/g;
    for (const linha of linhas) {
      if (ehLinhaNaoHorimetro(linha)) continue;
      let matchInt: RegExpExecArray | null;
      while ((matchInt = regexInteiro.exec(linha)) !== null) {
        const val = parseInt(matchInt[1], 10);
        if (val >= 2020 && val <= 2030) continue; // ignora ano isolado
        if (!isNaN(val) && val >= 50 && val < 999999) {
          horimetroEncontrado = val;
          break;
        }
      }
      if (horimetroEncontrado !== undefined) break;
    }
  }

  // 4. Detecção de Alertas do Painel (filtro, óleo, temperatura, motor, etc.)
  const alertasDetectados: string[] = [];
  const termosAlerta = [
    'VERIFICAR FILTRO', 'FILTRO DIESEL', 'FILTRO DE AR',
    'PRESSAO DE OLEO', 'PRESSÃO DE ÓLEO', 'LOW OIL', 'OIL PRESSURE',
    'ALTA TEMPERATURA', 'HIGH TEMP', 'OVERHEAT', 'SUPERAQ',
    'CHECK ENGINE', 'AVISO MOTOR', 'MANUTENÇÃO', 'MANUTENCAO',
    'FALHA ELETRICA', 'BATERIA BAIXA', 'LOW BATTERY', 'WATER IN FUEL'
  ];

  for (const linha of linhas) {
    const linhaUpper = linha.toUpperCase();
    for (const termo of termosAlerta) {
      if (linhaUpper.includes(termo)) {
        alertasDetectados.push(termo);
      }
    }
  }

  if (alertasDetectados.length > 0) {
    alertaEncontrado = Array.from(new Set(alertasDetectados)).join(' | ');
  }

  return {
    horimetro: horimetroEncontrado,
    alertaPainel: alertaEncontrado,
    textoBruto,
    sucesso: horimetroEncontrado !== undefined || alertaEncontrado !== undefined
  };
}
