import type { Player, LootTableEntry } from '../types';
import { getDungeon } from '../dungeons/dungeonDefinitions';
import { getItemDefinition } from '../items/itemDefinitions';

export interface LootDrop {
  itemId: string;
  quantity: number;
}

export function rollLoot(player: Player): LootDrop | null {
  const dungeon = getDungeon(player.currentDungeonId ?? '');
  if (!dungeon) return null;

  const roll = Math.random();

  let cumulative = 0;
  for (const entry of dungeon.lootTable) {
    cumulative += entry.chance;
    if (roll < cumulative) {
      const def = getItemDefinition(entry.itemId);
      if (def) {
        return { itemId: entry.itemId, quantity: 1 };
      }
    }
  }

  return null;
}
