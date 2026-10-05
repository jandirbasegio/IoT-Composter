import { Router } from 'express';
import {
  getCicloAtual,
  postAdicionarAnimal,
  postFecharCelula,
  postIniciarCiclo,
  postIniciarMaturacao,
} from '../controllers/cicloController.js';
import { criarLeitura, listarLeituras } from '../controllers/leituraController.js';
import { registrarToken } from '../controllers/tokenController.js';

const router = Router();

router.post('/leituras', criarLeitura);
router.get('/leituras', listarLeituras);
router.post('/tokens', registrarToken);

router.get('/ciclos/atual', getCicloAtual);
router.post('/ciclos', postIniciarCiclo);
router.post('/ciclos/animais', postAdicionarAnimal);
router.post('/ciclos/fechar', postFecharCelula);
router.post('/ciclos/maturacao', postIniciarMaturacao);

export default router;
