import type { Request, Response } from 'express';
import { processarAlertas } from '../services/alertaService.js';
import { obterCicloAtual } from '../services/cicloService.js';
import { salvarLeitura, ultimasLeituras } from '../services/leituraService.js';
import { validarLeitura } from '../utils/validacaoLeitura.js';

export async function criarLeitura(req: Request, res: Response) {
  const validacao = validarLeitura(req.body);
  if (!validacao.valida) {
    return res.status(400).json({ erro: 'Leitura rejeitada', detalhes: validacao.erros });
  }
  const { leitura } = validacao;

  try {
    const id = await salvarLeitura(leitura);

    // Alertas só valem com a célula ATIVA; roda em segundo plano para não atrasar o ESP32.
    obterCicloAtual()
      .then((ciclo) => (ciclo?.status === 'ATIVA' ? processarAlertas(leitura) : undefined))
      .catch((err) => console.error('Erro ao processar alertas:', err));

    return res.status(201).json({ id, ...leitura });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao salvar leitura' });
  }
}

export async function listarLeituras(_req: Request, res: Response) {
  try {
    return res.json(await ultimasLeituras(20));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao buscar leituras' });
  }
}
