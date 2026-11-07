import { Router } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../db';
import { cadastroSchema } from '../validacao';

export const cadastrosRouter = Router();

async function montar(row: any) {
  const docs = await pool.query(
    'SELECT id, tipo, nome, arquivo, mime_type FROM documentos WHERE cadastro_id = $1',
    [row.id]
  );
  return {
    ...row.dados,
    id: row.id,
    criadoEm: row.criado_em,
    documentos: docs.rows.map((d) => ({
      id: d.id,
      tipo: d.tipo,
      nome: d.nome,
      uri: `/uploads/${d.arquivo}`,
      mimeType: d.mime_type ?? undefined,
    })),
  };
}

cadastrosRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM cadastros ORDER BY criado_em DESC');
  res.json(await Promise.all(rows.map(montar)));
});

cadastrosRouter.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM cadastros WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ erro: 'Cadastro não encontrado' });
  res.json(await montar(rows[0]));
});

cadastrosRouter.post('/', async (req, res) => {
  const r = cadastroSchema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ erros: r.error.flatten() });

  const id = randomUUID();
  await pool.query('INSERT INTO cadastros (id, tipo, dados) VALUES ($1, $2, $3)', [
    id,
    r.data.tipo,
    r.data,
  ]);
  const { rows } = await pool.query('SELECT * FROM cadastros WHERE id = $1', [id]);
  res.status(201).json(await montar(rows[0]));
});

cadastrosRouter.put('/:id', async (req, res) => {
  const r = cadastroSchema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ erros: r.error.flatten() });

  const { rowCount } = await pool.query('UPDATE cadastros SET dados = $1 WHERE id = $2', [
    r.data,
    req.params.id,
  ]);
  if (!rowCount) return res.status(404).json({ erro: 'Cadastro não encontrado' });

  const { rows } = await pool.query('SELECT * FROM cadastros WHERE id = $1', [req.params.id]);
  res.json(await montar(rows[0]));
});

cadastrosRouter.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM cadastros WHERE id = $1', [req.params.id]);
  res.status(204).end();
});