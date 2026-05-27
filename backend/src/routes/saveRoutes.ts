import { Router, Request, Response } from 'express';
import { gameService } from '../services/gameService.js';

export const saveRoutes = Router();

saveRoutes.post('/:id', async (req: Request, res: Response) => {
  try {
    const playerId = req.params.id;
    await gameService.savePlayer(playerId, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save game' });
  }
});
