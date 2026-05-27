import express from 'express';
import cors from 'cors';
import { playerRoutes } from './routes/playerRoutes.js';
import { saveRoutes } from './routes/saveRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/players', playerRoutes);
app.use('/api/save', saveRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
