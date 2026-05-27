import { Router, Request, Response } from 'express';
import { gameService } from '../services/gameService.js';

export const playerRoutes = Router();

playerRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { id, name, race, class: playerClass, hp, maxHp, mp, maxMp, baseStats } = req.body;
    const player = await gameService.createPlayer({
      id, name, race, class: playerClass, hp, maxHp, mp, maxMp, baseStats,
    });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

playerRoutes.get('/:id', async (req: Request, res: Response) => {
  try {
    const player = await gameService.getPlayer(req.params.id);
    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load player' });
  }
});

playerRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    await gameService.deletePlayer(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});
