import type { Player } from '../types';
import { getItemDefinition } from './itemDefinitions';

export function useConsumable(player: Player, inventoryId: string): boolean {
  const inv = player.inventory.find((i) => i.id === inventoryId);
  const def = inv ? getItemDefinition(inv.itemId) : undefined;
  if (!inv || !def || def.type !== 'consumable' || !def.effect) return false;

  const { hpPercent, mpPercent } = def.effect;
  if (hpPercent) {
    player.hp = Math.min(player.maxHp, player.hp + Math.floor((player.maxHp * hpPercent) / 100));
  }
  if (mpPercent) {
    player.mp = Math.min(player.maxMp, player.mp + Math.floor((player.maxMp * mpPercent) / 100));
  }

  const stack = player.inventory.find((i) => i.id === inventoryId)!;
  stack.quantity -= 1;
  if (stack.quantity <= 0) {
    player.inventory = player.inventory.filter((i) => i.id !== stack.id);
  }

  return true;
}