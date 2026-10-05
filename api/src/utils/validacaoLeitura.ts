import type { Leitura } from '../services/leituraService.js';

interface Faixa {
  min: number;
  max: number;
  inteiro?: boolean;
}

// Limites físicos dos sensores (descartam, por exemplo, o -127 do DS18B20 desconectado).
const FAIXAS: Record<keyof Leitura, Faixa> = {
  temperatura_composteira: { min: -10, max: 85 }, // DS18B20
  umidade_ambiente: { min: 0, max: 100 }, // DHT22
  temperatura_ambiente: { min: -10, max: 60 }, // DHT22
  gas_amonia_raw: { min: 0, max: 4095, inteiro: true }, // MQ-135, ADC de 12 bits
};

export type ResultadoValidacao =
  | { valida: true; leitura: Leitura }
  | { valida: false; erros: string[] };

export function validarLeitura(body: unknown): ResultadoValidacao {
  const dados = (body ?? {}) as Record<string, unknown>;
  const erros: string[] = [];

  for (const [campo, faixa] of Object.entries(FAIXAS) as [keyof Leitura, Faixa][]) {
    const valor = dados[campo];
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      erros.push(`${campo}: deve ser um número`);
    } else if (valor < faixa.min || valor > faixa.max) {
      erros.push(`${campo}: ${valor} fora da faixa permitida (${faixa.min} a ${faixa.max})`);
    } else if (faixa.inteiro && !Number.isInteger(valor)) {
      erros.push(`${campo}: deve ser inteiro`);
    }
  }

  if (erros.length > 0) return { valida: false, erros };
  return { valida: true, leitura: dados as unknown as Leitura };
}
