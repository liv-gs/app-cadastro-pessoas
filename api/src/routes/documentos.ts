import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import { pool } from '../db';

export const documentosRouter = Router({ mergeParams: true });

export const PASTA_UPLOADS = path.resolve(process.cwd(), 'uploads');

const upload = multer({
  storage: multer.diskStorage({
    destination: PASTA_UPLOADS,
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/');
    cb(null, ok);
  },
});

documentosRouter.post('/', upload.single('arquivo'), async (req, res) => {
  const { id: cadastroId } = req.params as { id: string };
  const tipo = req.body.tipo as string;

  if (!req.file || !tipo) {
    return res.status(400).json({ erro: 'Envie o arquivo (PDF ou imagem) e o tipo do documento' });
  }

  const existe = await pool.query('SELECT 1 FROM cadastros WHERE id = $1', [cadastroId]);
  if (!existe.rowCount) {
    await fs.unlink(req.file.path).catch(() => {});
    return res.status(404).json({ erro: 'Cadastro não encontrado' });
  }

  const antigos = await pool.query(
    'DELETE FROM documentos WHERE cadastro_id = $1 AND tipo = $2 RETURNING arquivo',
    [cadastroId, tipo]
  );
  for (const a of antigos.rows) await fs.unlink(path.join(PASTA_UPLOADS, a.arquivo)).catch(() => {});

  const docId = randomUUID();
  await pool.query(
    'INSERT INTO documentos (id, cadastro_id, tipo, nome, arquivo, mime_type) VALUES ($1,$2,$3,$4,$5,$6)',
    [docId, cadastroId, tipo, req.file.originalname, req.file.filename, req.file.mimetype]
  );

  res.status(201).json({
    id: docId,
    tipo,
    nome: req.file.originalname,
    uri: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
  });
});

documentosRouter.delete('/:docId', async (req, res) => {
  const { id, docId } = req.params as { id: string; docId: string };

  const { rows } = await pool.query(
    'DELETE FROM documentos WHERE id = $1 AND cadastro_id = $2 RETURNING arquivo',
    [docId, id]
  );
  if (rows[0]) await fs.unlink(path.join(PASTA_UPLOADS, rows[0].arquivo)).catch(() => {});
  res.status(204).end();
});