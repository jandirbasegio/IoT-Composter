// Formato bruto retornado por GET /api/leituras.
// O mysql2 devolve colunas DECIMAL como string, por isso os campos aceitam os dois tipos.
export interface LeituraResponse {
  id: number;
  temperatura_ambiente: string | number;
  umidade_ambiente: string | number;
  temperatura_composteira: string | number;
  gas_amonia_raw: number;
  data_hora: string;
}

// Formato normalizado usado pela interface.
export interface Leitura {
  id: number;
  temperaturaAmbiente: number;
  umidadeAmbiente: number;
  temperaturaComposteira: number;
  gasAmoniaRaw: number;
  dataHora: Date;
}

export interface RegistrarTokenPayload {
  token: string;
}

export type StatusCiclo = 'ENCHIMENTO' | 'ATIVA' | 'MATURACAO';

export interface CicloResponse {
  id: number;
  status: StatusCiclo;
  data_inicio: string;
  data_fechamento: string | null;
  dias_estimados_compostagem: number | null;
}

export interface Ciclo {
  id: number;
  status: StatusCiclo;
  dataInicio: Date;
  dataFechamento: Date | null;
  diasEstimados: number | null;
}

export type NivelAlerta = 'NORMAL' | 'BAIXO' | 'MEDIO' | 'CRITICO';
