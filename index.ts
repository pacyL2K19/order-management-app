import express, { Request, Response } from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import dotenv from 'dotenv';

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

app.use('/oms', proxy('http://localhost:8001'));
app.use('/inventory', proxy('http://localhost:8002'));

app.get('/', (req: Request, res: Response) => {
  res.send('Gateway running!');
});

app.listen(process.env.PORT || 8000, () => {
  console.log('APP Gateway on port 8000');
});
