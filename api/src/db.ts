import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function iniciarBanco() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cadastros (
      id         UUID PRIMARY KEY,
      tipo       TEXT NOT NULL CHECK (tipo IN ('PF', 'PJ')),
      dados      JSONB NOT NULL,
      criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS documentos (
      id           UUID PRIMARY KEY,
      cadastro_id  UUID NOT NULL REFERENCES cadastros(id) ON DELETE CASCADE,
      tipo         TEXT NOT NULL,
      nome         TEXT NOT NULL,
      arquivo      TEXT NOT NULL,
      mime_type    TEXT
    );
  `);
}