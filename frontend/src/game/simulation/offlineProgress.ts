import type { Player } from '../types';
import { processCombatTick } from '../combat/formulas';
import { rollLoot } from '../loot/lootGenerator';
import { addItem } from '../inventory/inventoryManager';
import { unlockRecipe } from '../crafting/recipes';
import { updateTitle, getEffectiveStats } from '../player/playerCalculations';
import { getItemDefinition } from '../items/itemDefinitions';
import { getDungeon } from '../dungeons/dungeonDefinitions';

export interface OfflineResult {
  ticksSimulated: number;
  ticksUntilDeath: number | null;
  goldEarned: number;
  expEarned: number;
  died: boolean;
}

export function calculateOfflineProgress(player: Player, elapsedMs: number): OfflineResult {
  const ticksElapsed = Math.floor(elapsedMs / 1000);
  const maxOfflineTicks = 24 * 60 * 60;
  const ticksToSimulate = Math.min(ticksElapsed, maxOfflineTicks);

  const result: OfflineResult = {
    ticksSimulated: 0,
    ticksUntilDeath: null,
    goldEarned: 0,
    expEarned: 0,
    died: false,
  };

  if (ticksToSimulate <= 0) return result;

  if (!player.currentDungeonId) {
    const stats = getEffectiveStats(player);
    const regenHp = stats.regenHp ?? 1;
    const regenMp = stats.regenMp ?? 1;
    player.hp = Math.min(player.maxHp, player.hp + regenHp * 2 * ticksToSimulate);
    player.mp = Math.min(player.maxMp, player.mp + regenMp * 2 * ticksToSimulate);
    result.ticksSimulated = ticksToSimulate;
    return result;
  }

  const dungeon = getDungeon(player.currentDungeonId);
  if (!dungeon) return result;

  const initialGold = player.gold;
  const initialExp = player.experience;

  for (let i = 0; i < ticksToSimulate; i++) {
    if (player.hp <= 0) {
      result.ticksUntilDeath = i;
      result.died = true;
      break;
    }

    const tickResult = processCombatTick(player);

    if (tickResult.isDead) {
      const deathPenaltyMs = 5 * 60 * 1000;
      player.deathPenaltyUntil = Date.now() + deathPenaltyMs;
      player.currentDungeonId = null;
      player.hp = Math.floor(player.maxHp / 2);
      result.ticksUntilDeath = i + 1;
      result.died = true;
      break;
    }

    if (tickResult.expGained > 0) {
      player.experience += tickResult.expGained;
      updateTitle(player);
    }

    if (tickResult.goldGained > 0) {
      player.gold += tickResult.goldGained;
    }

    const loot = rollLoot(player);
    if (loot) {
      addItem(player, loot.itemId, loot.quantity);
      const def = getItemDefinition(loot.itemId);
      if (def?.type === 'recipe') {
        unlockRecipe(player, loot.itemId);
      }
    }

    result.ticksSimulated++;
  }

  result.goldEarned = player.gold - initialGold;
  result.expEarned = player.experience - initialExp;

  return result;
}
