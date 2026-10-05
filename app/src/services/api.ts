import axios from 'axios';
import { API_BASE_URL } from '../config';
import type {
  Ciclo,
  CicloResponse,
  Leitura,
  LeituraResponse,
  RegistrarTokenPayload,
} from '../types';

const http = axios.create({ baseURL: API_BASE_URL, timeout: 10000 });

/** Extrai a mensagem de erro enviada pela API (campo "erro"), se houver. */
export function mensagemDeErro(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { erro?: string } | undefined)?.erro;
    if (msg) return msg;
    if (!err.response) return 'Sem conexão com a API. Verifique o IP e a rede.';
  }
  return 'Ocorreu um erro inesperado.';
}

function paraCiclo(c: CicloResponse): Ciclo {
  return {
    id: c.id,
    status: c.status,
    dataInicio: new Date(c.data_inicio),
    dataFechamento: c.data_fechamento ? new Date(c.data_fechamento) : null,
    diasEstimados: c.dias_estimados_compostagem,
  };
}

export async function buscarLeituras(): Promise<Leitura[]> {
  const { data } = await http.get<LeituraResponse[]>('/leituras');
  return data.map((l) => ({
    id: l.id,
    temperaturaAmbiente: Number(l.temperatura_ambiente),
    umidadeAmbiente: Number(l.umidade_ambiente),
    temperaturaComposteira: Number(l.temperatura_composteira),
    gasAmoniaRaw: l.gas_amonia_raw,
    dataHora: new Date(l.data_hora),
  }));
}

export async function registrarToken(token: string): Promise<void> {
  const payload: RegistrarTokenPayload = { token };
  await http.post('/tokens', payload);
}

/** Retorna null quando não há ciclo em andamento (a API responde 404). */
export async function buscarCicloAtual(): Promise<Ciclo | null> {
  try {
    const { data } = await http.get<CicloResponse>('/ciclos/atual');
    return paraCiclo(data);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export async function iniciarCiclo(): Promise<Ciclo> {
  const { data } = await http.post<CicloResponse>('/ciclos');
  return paraCiclo(data);
}

export async function adicionarAnimal(pesoKg: number): Promise<Ciclo> {
  const { data } = await http.post<{ ciclo: CicloResponse }>('/ciclos/animais', {
    peso_estimado_kg: pesoKg,
  });
  return paraCiclo(data.ciclo);
}

export async function fecharCelula(): Promise<Ciclo> {
  const { data } = await http.post<CicloResponse>('/ciclos/fechar');
  return paraCiclo(data);
}

export async function iniciarMaturacao(): Promise<void> {
  await http.post('/ciclos/maturacao');
}
