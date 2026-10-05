import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { Pool, PoolConnection } from 'mysql2/promise';
import { pool } from '../config/db.js';
import { RegraNegocioError } from '../errors.js';
import type { Ciclo, EventoAnimal } from '../types/ciclo.js';

type Executor = Pool | PoolConnection;

/** Fórmula da Embrapa: tempo (dias) = 7,42 * raiz(peso em kg), do maior animal da leira. */
export function estimarDiasCompostagem(maiorPesoKg: number): number {
  return Math.ceil(7.42 * Math.sqrt(maiorPesoKg));
}

async function buscarCicloAtual(db: Executor, paraAtualizar = false): Promise<Ciclo | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM ciclos_compostagem
      WHERE status IN ('ENCHIMENTO', 'ATIVA')
      ORDER BY id DESC LIMIT 1 ${paraAtualizar ? 'FOR UPDATE' : ''}`,
  );
  return (rows[0] as Ciclo | undefined) ?? null;
}

export function obterCicloAtual(): Promise<Ciclo | null> {
  return buscarCicloAtual(pool);
}

export async function iniciarCiclo(): Promise<Ciclo> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (await buscarCicloAtual(conn, true)) {
      throw new RegraNegocioError(409, 'Já existe um ciclo em andamento (ENCHIMENTO ou ATIVA).');
    }
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO ciclos_compostagem (status) VALUES ('ENCHIMENTO')`,
    );
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT * FROM ciclos_compostagem WHERE id = ?',
      [result.insertId],
    );
    await conn.commit();
    return rows[0] as Ciclo;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function adicionarAnimal(
  pesoKg: number,
): Promise<{ evento: EventoAnimal; ciclo: Ciclo }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const ciclo = await buscarCicloAtual(conn, true);
    if (!ciclo) {
      throw new RegraNegocioError(409, 'Nenhum ciclo em ENCHIMENTO. Inicie um ciclo primeiro.');
    }
    if (ciclo.status === 'ATIVA') {
      throw new RegraNegocioError(
        409,
        'A célula está ATIVA. Adicionar um animal agora zeraria a quarentena sanitária; ' +
          'inicie um novo ciclo após a maturação.',
      );
    }

    const [result] = await conn.execute<ResultSetHeader>(
      'INSERT INTO eventos_animais (ciclo_id, peso_estimado_kg) VALUES (?, ?)',
      [ciclo.id, pesoKg],
    );

    const [maxRows] = await conn.execute<RowDataPacket[]>(
      'SELECT MAX(peso_estimado_kg) AS maior FROM eventos_animais WHERE ciclo_id = ?',
      [ciclo.id],
    );
    const dias = estimarDiasCompostagem(Number(maxRows[0]?.maior));
    await conn.execute(
      'UPDATE ciclos_compostagem SET dias_estimados_compostagem = ? WHERE id = ?',
      [dias, ciclo.id],
    );

    const [eventoRows] = await conn.execute<RowDataPacket[]>(
      'SELECT * FROM eventos_animais WHERE id = ?',
      [result.insertId],
    );
    await conn.commit();

    const evento = eventoRows[0] as EventoAnimal;
    return {
      evento: { ...evento, peso_estimado_kg: Number(evento.peso_estimado_kg) },
      ciclo: { ...ciclo, dias_estimados_compostagem: dias },
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function mudarStatus(
  de: 'ENCHIMENTO' | 'ATIVA',
  para: 'ATIVA' | 'MATURACAO',
  extraSql = '',
): Promise<Ciclo> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const ciclo = await buscarCicloAtual(conn, true);
    if (!ciclo || ciclo.status !== de) {
      throw new RegraNegocioError(409, `Operação exige um ciclo com status ${de}.`);
    }
    if (de === 'ENCHIMENTO') {
      const [rows] = await conn.execute<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM eventos_animais WHERE ciclo_id = ?',
        [ciclo.id],
      );
      if (Number(rows[0]?.total) === 0) {
        throw new RegraNegocioError(409, 'Adicione ao menos um animal antes de fechar a célula.');
      }
    }
    await conn.execute(
      `UPDATE ciclos_compostagem SET status = ?${extraSql} WHERE id = ?`,
      [para, ciclo.id],
    );
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT * FROM ciclos_compostagem WHERE id = ?',
      [ciclo.id],
    );
    await conn.commit();
    return rows[0] as Ciclo;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** ENCHIMENTO -> ATIVA: inicia a contagem dos dias termofílicos (data_fechamento). */
export function fecharCelula(): Promise<Ciclo> {
  return mudarStatus('ENCHIMENTO', 'ATIVA', ', data_fechamento = CURRENT_TIMESTAMP');
}

/** ATIVA -> MATURACAO: encerra o ciclo e libera o início de um novo. */
export function iniciarMaturacao(): Promise<Ciclo> {
  return mudarStatus('ATIVA', 'MATURACAO');
}
