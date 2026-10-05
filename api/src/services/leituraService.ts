import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db.js';

export interface Leitura {
  temperatura_ambiente: number;
  umidade_ambiente: number;
  temperatura_composteira: number;
  gas_amonia_raw: number;
}

export async function salvarLeitura(l: Leitura): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO leituras_sensores
       (temperatura_ambiente, umidade_ambiente, temperatura_composteira, gas_amonia_raw)
     VALUES (?, ?, ?, ?)`,
    [l.temperatura_ambiente, l.umidade_ambiente, l.temperatura_composteira, l.gas_amonia_raw],
  );
  return result.insertId;
}

export async function ultimasLeituras(limite = 20): Promise<RowDataPacket[]> {
  // LIMIT é interpolado (inteiro validado) pois prepared statements do mysql2 não aceitam LIMIT ?
  const n = Math.max(1, Math.floor(limite));
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM leituras_sensores ORDER BY data_hora DESC, id DESC LIMIT ${n}`,
  );
  return rows;
}
