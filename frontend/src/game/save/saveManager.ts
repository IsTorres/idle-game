import type { Player } from '../types';
import { apiClient, type SaveData } from '../../api/client';

export function serializePlayer(player: Player): SaveData {
  return {
    hp: player.hp,
    mp: player.mp,
    gold: player.gold,
    experience: player.experience,
    title: player.title,
    currentDungeonId: player.currentDungeonId,
    deathPenaltyUntil: player.deathPenaltyUntil ? new Date(player.deathPenaltyUntil).toISOString() : null,
    inventory: player.inventory.map((inv) => ({
      itemId: inv.itemId,
      quantity: inv.quantity,
    })),
    equipment: player.equipment.map((eq) => ({
      slot: eq.slot,
      itemId: eq.itemId,
    })),
    recipes: player.unlockedRecipes.map((recipeId) => ({
      recipeId,
    })),
  };
}

export async function saveGame(player: Player): Promise<boolean> {
  try {
    const data = serializePlayer(player);
    await apiClient.savePlayer(player.id, data);
    return true;
  } catch {
    console.error('Failed to save game');
    return false;
  }
}
