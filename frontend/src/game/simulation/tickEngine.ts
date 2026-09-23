import type { Player, CombatLogEntry } from '../types';
import { processCombatTick } from '../combat/formulas';
import { rollLoot } from '../loot/lootGenerator';
import { addItem } from '../inventory/inventoryManager';
import { unlockRecipe } from '../crafting/recipes';
import { updateTitle, getEffectiveStats } from '../player/playerCalculations';
import { getItemDefinition } from '../items/itemDefinitions';
import { getRarityName } from '../items/rarityDefinitions';
import { getMob } from '../mobs/mobDefinitions';
import { getTitleById } from '../entities/titles';

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
  const foughtMob = getMob(result.mobId);
  const mobName = foughtMob?.name ?? 'inimigo';

  if (result.damageTaken > 0) {
    logs.push({
      tick: tickCounter,
      type: 'damage',
      message: `${mobName} acertou você por ${result.damageTaken}${foughtMob?.magicDamage ? ' (mágico)' : ''}. HP: ${result.hpAfter}/${player.maxHp}`,
    });
  }

  if (result.mobDamageDealt > 0) {
    logs.push({
      tick: tickCounter,
      type: 'mobDamage',
      message: `Você causou ${result.mobDamageDealt} de dano no ${mobName}.`,
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

  if (result.mobKilled) {
    logs.push({
      tick: tickCounter,
      type: 'mobKill',
      message: `Derrotou: ${mobName}!`,
    });
  }

  if (result.isDead) {
    const deathPenaltyMs = 5 * 60 * 1000;
    player.deathPenaltyUntil = Date.now() + deathPenaltyMs;
    player.currentDungeonId = null;
    player.currentMobId = null;
    player.currentMobHp = null;
    player.hp = Math.floor(player.maxHp / 2);

    logs.push({
      tick: tickCounter,
      type: 'death',
      message: 'Você morreu! Retornou à cidade com penalidade de 5 minutos.',
    });

    return { logs, died: true };
  }

  if (result.expGained > 0) {
    const prevTitle = player.title;
    player.experience += result.expGained;
    updateTitle(player);

    if (player.title !== prevTitle) {
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      logs.push({
        tick: tickCounter,
        type: 'info',
        message: `Novo título: ${getTitleById(player.title)?.name ?? player.title}! Vida e mana restauradas.`,
      });
    }

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
    addItem(player, loot.itemId, loot.quantity, loot.rarity);
    const def = getItemDefinition(loot.itemId);
    const itemName = def?.name ?? loot.itemId;
    const rarityLabel = def?.type === 'equipment' && loot.rarity
      ? ` (${getRarityName(loot.rarity)})`
      : '';

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
        message: `Encontrou: ${itemName}${rarityLabel}.`,
      });
    }
  }

  return { logs, died: false };
}