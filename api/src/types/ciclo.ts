export type StatusCiclo = 'ENCHIMENTO' | 'ATIVA' | 'MATURACAO';

export interface Ciclo {
  id: number;
  status: StatusCiclo;
  data_inicio: Date;
  data_fechamento: Date | null;
  dias_estimados_compostagem: number | null;
}

export interface EventoAnimal {
  id: number;
  ciclo_id: number;
  peso_estimado_kg: number;
  data_adicao: Date;
}
