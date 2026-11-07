import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { iniciarBanco } from './db';
import { cadastrosRouter } from './routes/cadastros';
import { documentosRouter, arquivosRouter } from './routes/documentos';

const app = express();

app.use(cors());
app.use(express.json());

// Chave de API: se API_KEY não estiver definida (ex.: teste local), não exige
const API_KEY = process.env.API_KEY;
app.use((req, res, next) => {
  if (!API_KEY || req.path === '/saude') return next();
  if (req.header('x-api-key') !== API_KEY) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  next();
});

app.get('/saude', (_req, res) => res.json({ ok: true }));
app.use('/uploads', arquivosRouter);
app.use('/cadastros', cadastrosRouter);
app.use('/cadastros/:id/documentos', documentosRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORTA = Number(process.env.PORT ?? 3000);

iniciarBanco()
  .then(() => app.listen(PORTA, '0.0.0.0', () => console.log(`API na porta ${PORTA}`)))
  .catch((e) => {
    console.error('Falha ao iniciar o banco:', e);
    process.exit(1);
  });