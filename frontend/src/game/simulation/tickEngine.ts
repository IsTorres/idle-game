import type { Player, CombatLogEntry } from '../types';
import { processCombatTick } from '../combat/formulas';
import { rollLoot } from '../loot/lootGenerator';
import { addItem } from '../inventory/inventoryManager';
import { unlockRecipe } from '../crafting/recipes';
import { updateTitle, getEffectiveStats } from '../player/playerCalculations';
import { getItemDefinition } from '../items/itemDefinitions';

let tickCounter = 0;

export function processTick(player: Player): {
  logs: CombatLogEntry[];
  died: boolean;
} {
  const logs: CombatLogEntry[] = [];
  tickCounter++;

  if (!player.currentDungeonId) {
    const stats = getEffectiveStats(player);
    const regenHp = stats.regenHp ?? 1;
    const regenMp = stats.regenMp ?? 1;
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.maxHp, player.hp + regenHp * 2);
    }
    if (player.mp < player.maxMp) {
      player.mp = Math.min(player.maxMp, player.mp + regenMp * 2);
    }
    return { logs: [], died: false };
  }

  const result = processCombatTick(player);

  if (result.damageTaken > 0) {
    logs.push({
      tick: tickCounter,
      type: 'damage',
      message: `Recebeu ${result.damageTaken} de dano. HP: ${result.hpAfter}/${player.maxHp}`,
    });
  }

  const stats = getEffectiveStats(player);
  const regenHp = stats.regenHp ?? 0;
  if (regenHp > 0 && !result.isDead) {
    logs.push({
      tick: tickCounter,
      type: 'regen',
      message: `Recuperou ${Math.min(regenHp, player.maxHp - result.hpAfter)} HP.`,
    });
  }

  if (result.isDead) {
    const deathPenaltyMs = 5 * 60 * 1000;
    player.deathPenaltyUntil = Date.now() + deathPenaltyMs;
    player.currentDungeonId = null;
    player.hp = Math.floor(player.maxHp / 2);

    logs.push({
      tick: tickCounter,
      type: 'death',
      message: 'Você morreu! Retornou à cidade com penalidade de 5 minutos.',
    });

    return { logs, died: true };
  }

  if (result.expGained > 0) {
    player.experience += result.expGained;
    updateTitle(player);

    logs.push({
      tick: tickCounter,
      type: 'exp',
      message: `Ganhou ${result.expGained} de experiência.`,
    });
  }

  if (result.goldGained > 0) {
    player.gold += result.goldGained;
  }

  const loot = rollLoot(player);
  if (loot) {
    addItem(player, loot.itemId, loot.quantity);
    const def = getItemDefinition(loot.itemId);
    const itemName = def?.name ?? loot.itemId;

    if (def?.type === 'recipe') {
      unlockRecipe(player, loot.itemId);
      logs.push({
        tick: tickCounter,
        type: 'loot',
        message: `Encontrou: ${itemName}! (Receita desbloqueada!)`,
      });
    } else {
      logs.push({
        tick: tickCounter,
        type: 'loot',
        message: `Encontrou: ${itemName}.`,
      });
    }
  }

  return { logs, died: false };
}
