import type { Request, Response } from 'express';
import { Expo } from 'expo-server-sdk';
import { salvarToken } from '../services/tokenService.js';

export async function registrarToken(req: Request, res: Response) {
  const token = req.body?.token;
  if (typeof token !== 'string' || !Expo.isExpoPushToken(token)) {
    return res.status(400).json({ erro: 'Token Expo Push inválido' });
  }

  try {
    await salvarToken(token);
    return res.status(201).json({ mensagem: 'Token registrado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao salvar token' });
  }
}
