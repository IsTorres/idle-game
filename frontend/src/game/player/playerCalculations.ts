import type { Player, StatBonuses, Stat } from '../types';
import { getRace } from '../entities/races';
import { getClass } from '../entities/classes';
import { titles } from '../entities/titles';
import { getItemDefinition } from '../items/itemDefinitions';
import { getItemStats } from '../items/itemStats';

const allStats: Stat[] = [
  'maxHp', 'maxMp', 'regenHp', 'regenMp',
  'physicalDefense', 'magicalDefense',
  'physicalDamage', 'magicalDamage',
  'precision', 'speed',
];

export function createPlayerBaseStats(raceId: string, classId: string): StatBonuses {
  const race = getRace(raceId);
  const cls = getClass(classId);

  if (!race || !cls) {
    throw new Error('Invalid race or class');
  }

  const stats: StatBonuses = {};
  for (const stat of allStats) {
    const base = (cls.baseStats[stat] ?? 0);
    const raceBonus = (race.statBonuses[stat] ?? 0);
    const classBonus = (cls.statBonuses[stat] ?? 0);
    stats[stat] = base + raceBonus + classBonus;
  }

  return stats;
}

export function getEffectiveStats(player: Player): StatBonuses {
  const isPenalized = player.deathPenaltyUntil !== null && Date.now() < player.deathPenaltyUntil;

  const stats: StatBonuses = {};
  for (const stat of allStats) {
    stats[stat] = player.baseStats[stat] ?? 0;
  }

  for (const eq of player.equipment) {
    const def = getItemDefinition(eq.itemId);
    if (def?.statBonuses) {
      const bonuses = getItemStats(def, eq.rarity ?? 'common');
      for (const stat of allStats) {
        const bonus = bonuses[stat];
        if (bonus) {
          stats[stat] = (stats[stat] ?? 0) + bonus;
        }
      }
    }
  }

  if (isPenalized) {
    for (const stat of allStats) {
      if (stats[stat] !== undefined) {
        stats[stat] = Math.floor(stats[stat] * 0.9);
      }
    }
  }

  return stats;
}

export function updateTitle(player: Player): void {
  let currentTitle = titles[0];
  for (const title of titles) {
    if (player.experience >= title.experienceRequired) {
      currentTitle = title;
    } else {
      break;
    }
  }
  player.title = currentTitle.id;
}

export function meetsTitleRequirement(playerExperience: number, requiredTitleId: string): boolean {
  const requiredTitle = titles.find((t) => t.id === requiredTitleId);
  if (!requiredTitle) return true;
  return playerExperience >= requiredTitle.experienceRequired;
}
