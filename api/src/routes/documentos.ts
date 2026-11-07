import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { pool } from '../db';

export const documentosRouter = Router({ mergeParams: true });
export const arquivosRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/');
    cb(null, ok);
  },
});

// Enviar documento (o mesmo tipo substitui o anterior)
documentosRouter.post('/', upload.single('arquivo'), async (req, res) => {
  const { id: cadastroId } = req.params as { id: string };
  const tipo = req.body.tipo as string;

  if (!req.file || !tipo) {
    return res.status(400).json({ erro: 'Envie o arquivo (PDF ou imagem) e o tipo do documento' });
  }
  const nome = (req.body.nome as string) || req.file.originalname;

  const existe = await pool.query('SELECT 1 FROM cadastros WHERE id = $1', [cadastroId]);
  if (!existe.rowCount) return res.status(404).json({ erro: 'Cadastro não encontrado' });

  await pool.query('DELETE FROM documentos WHERE cadastro_id = $1 AND tipo = $2', [cadastroId, tipo]);

  const docId = randomUUID();
  await pool.query(
    'INSERT INTO documentos (id, cadastro_id, tipo, nome, conteudo, mime_type) VALUES ($1,$2,$3,$4,$5,$6)',
    [docId, cadastroId, tipo, nome, req.file.buffer, req.file.mimetype]
  );

  res.status(201).json({
    id: docId,
    tipo,
    nome,
    uri: `/uploads/${docId}`,
    mimeType: req.file.mimetype,
  });
});

documentosRouter.delete('/:docId', async (req, res) => {
  const { id, docId } = req.params as { id: string; docId: string };
  await pool.query('DELETE FROM documentos WHERE id = $1 AND cadastro_id = $2', [docId, id]);
  res.status(204).end();
});

// Baixar/exibir o arquivo: GET /uploads/:id
arquivosRouter.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT conteudo, mime_type FROM documentos WHERE id = $1',
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).end();
  res.setHeader('Content-Type', rows[0].mime_type ?? 'application/octet-stream');
  res.send(rows[0].conteudo);
});