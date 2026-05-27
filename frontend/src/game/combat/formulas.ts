import type { Player, StatBonuses } from '../types';
import { getEffectiveStats } from '../player/playerCalculations';
import { getDungeon } from '../dungeons/dungeonDefinitions';

export interface TickResult {
  damageTaken: number;
  hpBefore: number;
  hpAfter: number;
  mpBefore: number;
  mpAfter: number;
  expGained: number;
  goldGained: number;
  isDead: boolean;
}

export function processCombatTick(player: Player): TickResult {
  const dungeon = getDungeon(player.currentDungeonId ?? '');
  if (!dungeon) {
    return {
      damageTaken: 0,
      hpBefore: player.hp,
      hpAfter: player.hp,
      mpBefore: player.mp,
      mpAfter: player.mp,
      expGained: 0,
      goldGained: 0,
      isDead: false,
    };
  }

  const stats = getEffectiveStats(player);
  const hpBefore = player.hp;
  const mpBefore = player.mp;

  const damageTaken = Math.max(1, dungeon.damagePerTick - (stats.physicalDefense ?? 0));
  player.hp = Math.max(0, player.hp - damageTaken);

  const regenHp = stats.regenHp ?? 0;
  const regenMp = stats.regenMp ?? 0;

  if (player.hp > 0) {
    player.hp = Math.min(player.maxHp, player.hp + regenHp);
    player.mp = Math.min(player.maxMp, player.mp + regenMp);
  }

  const isDead = player.hp <= 0;

  if (isDead) {
    player.hp = 0;
  }

  return {
    damageTaken,
    hpBefore,
    hpAfter: player.hp,
    mpBefore,
    mpAfter: player.mp,
    expGained: isDead ? 0 : dungeon.experiencePerTick,
    goldGained: isDead ? 0 : dungeon.rewardGoldPerTick,
    isDead,
  };
}
