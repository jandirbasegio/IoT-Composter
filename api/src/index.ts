import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`API da composteira rodando na porta ${port}`);
});
