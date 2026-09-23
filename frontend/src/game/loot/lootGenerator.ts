import type { Player, Rarity } from '../types';
import { getMob } from '../mobs/mobDefinitions';
import { getItemDefinition } from '../items/itemDefinitions';
import { getDungeon } from '../dungeons/dungeonDefinitions';
import { rollRarity } from '../items/rarityDefinitions';

export interface LootDrop {
  itemId: string;
  quantity: number;
  rarity?: Rarity;
}

export function rollLoot(player: Player): LootDrop | null {
  const mob = getMob(player.currentMobId ?? '');
  if (!mob) return null;

  const dungeon = getDungeon(player.currentDungeonId ?? '');
  const rarityWeights = dungeon?.rarityWeights ?? { common: 75, uncommon: 22, rare: 3, epic: 0, legendary: 0 };

  const roll = Math.random();

  let cumulative = 0;
  for (const entry of mob.lootTable) {
    cumulative += entry.chance;
    if (roll < cumulative) {
      const def = getItemDefinition(entry.itemId);
      if (!def) return null;
      if (def.type === 'equipment') {
        return { itemId: entry.itemId, quantity: 1, rarity: rollRarity(rarityWeights) };
      }
      return { itemId: entry.itemId, quantity: 1 };
    }
  }

  return null;
}