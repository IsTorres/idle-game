import type { ItemDefinition, Rarity, Stat, StatBonuses } from '../types';
import { getRarityMultiplier } from './rarityDefinitions';

export function getItemStats(def: ItemDefinition, rarity: Rarity = 'common'): StatBonuses {
  if (!def.statBonuses) return {};

  const multiplier = getRarityMultiplier(rarity);
  const out: StatBonuses = {};
  for (const [stat, value] of Object.entries(def.statBonuses)) {
    if (value) out[stat as Stat] = Math.floor(value * multiplier);
  }
  return out;
}