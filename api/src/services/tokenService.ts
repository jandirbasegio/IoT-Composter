import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/db.js';

export async function salvarToken(token: string): Promise<void> {
  await pool.execute('INSERT IGNORE INTO dispositivos_alertas (expo_token) VALUES (?)', [token]);
}

export async function listarTokens(): Promise<string[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT expo_token FROM dispositivos_alertas');
  return rows.map((r) => r.expo_token as string);
}
