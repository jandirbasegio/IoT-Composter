import { colors } from '../theme';
import type { NivelAlerta } from '../types';

export interface Status {
  nivel: NivelAlerta;
  cor: string;
  rotulo: string;
}

const NORMAL: Status = { nivel: 'NORMAL', cor: colors.normal, rotulo: 'Normal' };

// Mesmas faixas usadas pelo motor de alertas da API.
export function statusTemperatura(t: number): Status {
  if (t < 40) return { nivel: 'BAIXO', cor: colors.baixo, rotulo: 'Baixa' };
  if (t > 70) return { nivel: 'CRITICO', cor: colors.critico, rotulo: 'Crítica' };
  if (t >= 66) return { nivel: 'MEDIO', cor: colors.medio, rotulo: 'Elevada' };
  return NORMAL;
}

export function statusGas(raw: number): Status {
  if (raw > 1800) return { nivel: 'CRITICO', cor: colors.critico, rotulo: 'Crítico' };
  if (raw >= 1000) return { nivel: 'MEDIO', cor: colors.medio, rotulo: 'Atenção' };
  return NORMAL;
}

export function formatarDataHora(d: Date): string {
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
