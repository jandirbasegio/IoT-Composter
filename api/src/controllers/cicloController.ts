import type { Request, Response } from 'express';
import { RegraNegocioError } from '../errors.js';
import {
  adicionarAnimal,
  fecharCelula,
  iniciarCiclo,
  iniciarMaturacao,
  obterCicloAtual,
} from '../services/cicloService.js';

function tratarErro(err: unknown, res: Response) {
  if (err instanceof RegraNegocioError) {
    return res.status(err.status).json({ erro: err.message });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno' });
}

export async function getCicloAtual(_req: Request, res: Response) {
  try {
    const ciclo = await obterCicloAtual();
    return ciclo ? res.json(ciclo) : res.status(404).json({ erro: 'Nenhum ciclo em andamento' });
  } catch (err) {
    return tratarErro(err, res);
  }
}

export async function postIniciarCiclo(_req: Request, res: Response) {
  try {
    return res.status(201).json(await iniciarCiclo());
  } catch (err) {
    return tratarErro(err, res);
  }
}

export async function postAdicionarAnimal(req: Request, res: Response) {
  const peso = req.body?.peso_estimado_kg;
  if (typeof peso !== 'number' || !Number.isFinite(peso) || peso <= 0 || peso > 1000) {
    return res.status(400).json({ erro: 'peso_estimado_kg deve ser um número entre 0 e 1000' });
  }
  try {
    return res.status(201).json(await adicionarAnimal(peso));
  } catch (err) {
    return tratarErro(err, res);
  }
}

export async function postFecharCelula(_req: Request, res: Response) {
  try {
    return res.json(await fecharCelula());
  } catch (err) {
    return tratarErro(err, res);
  }
}

export async function postIniciarMaturacao(_req: Request, res: Response) {
  try {
    return res.json(await iniciarMaturacao());
  } catch (err) {
    return tratarErro(err, res);
  }
}
