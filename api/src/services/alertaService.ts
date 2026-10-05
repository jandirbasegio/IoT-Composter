import type { Leitura } from './leituraService.js';
import { listarTokens } from './tokenService.js';
import { enviarPush } from '../utils/expoPush.js';

export type NivelAlerta = 'BAIXO' | 'MEDIO' | 'CRITICO';

export interface Alerta {
  codigo: string;
  nivel: NivelAlerta;
  title: string;
  body: string;
}

// Evita uma notificação a cada leitura enquanto a condição persiste.
const INTERVALO_ENTRE_ALERTAS_MS = 30 * 60 * 1000;
const ultimoEnvio = new Map<string, number>();

/** Regras técnicas (DS18B20 e MQ-135). Função pura: não acessa banco nem rede. */
export function avaliarLeitura(l: Leitura): Alerta[] {
  const alertas: Alerta[] = [];
  const temp = l.temperatura_composteira;
  const gas = l.gas_amonia_raw;

  if (temp < 40) {
    alertas.push({
      codigo: 'TEMP_BAIXA',
      nivel: 'BAIXO',
      title: 'Temperatura Baixa',
      body: 'A composteira esfriou (< 40°C). Verifique a umidade, adicione água se necessário ou revolva a leira para reativar as bactérias.',
    });
  } else if (temp >= 66 && temp <= 70) {
    alertas.push({
      codigo: 'TEMP_ELEVADA',
      nivel: 'MEDIO',
      title: 'Atenção: Temperatura Elevada',
      body: 'A atividade bacteriana está muito alta. Monitore para evitar superaquecimento.',
    });
  } else if (temp > 70) {
    alertas.push({
      codigo: 'TEMP_CRITICA',
      nivel: 'CRITICO',
      title: 'Alerta Crítico: Superaquecimento!',
      body: 'Temperatura acima de 70°C! Revire a leira imediatamente para dissipar o calor, aerar e evitar a morte dos microrganismos.',
    });
  }

  if (gas > 1800) {
    alertas.push({
      codigo: 'GAS_CRITICO',
      nivel: 'CRITICO',
      title: 'Alerta Crítico: Decomposição Anaeróbica!',
      body: 'Alto nível de gases! A leira compactou. Revire completamente para oxigenar e incorpore mais serragem à mistura.',
    });
  } else if (gas >= 1000) {
    alertas.push({
      codigo: 'GAS_MEDIO',
      nivel: 'MEDIO',
      title: 'Atenção: Fuga de Amônia',
      body: 'Início de odores detectado. Adicione 10 a 15cm de serragem seca sobre a leira para reforçar o biofiltro.',
    });
  }

  return alertas;
}

/** Avalia a leitura e dispara os pushes pendentes. Chamar sem await (fire-and-forget). */
export async function processarAlertas(leitura: Leitura): Promise<void> {
  const agora = Date.now();
  const pendentes = avaliarLeitura(leitura).filter(
    (a) => agora - (ultimoEnvio.get(a.codigo) ?? 0) >= INTERVALO_ENTRE_ALERTAS_MS,
  );
  if (pendentes.length === 0) return;

  const tokens = await listarTokens();
  for (const alerta of pendentes) {
    ultimoEnvio.set(alerta.codigo, agora);
    await enviarPush(tokens, {
      title: alerta.title,
      body: alerta.body,
      data: {
        nivel: alerta.nivel,
        temperatura_composteira: leitura.temperatura_composteira,
        gas_amonia_raw: leitura.gas_amonia_raw,
      },
    });
  }
}
