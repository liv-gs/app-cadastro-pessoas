import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { iniciarBanco } from './db';
import { cadastrosRouter } from './routes/cadastros';
import { documentosRouter, PASTA_UPLOADS } from './routes/documentos';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(PASTA_UPLOADS));

app.get('/saude', (_req, res) => res.json({ ok: true }));
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