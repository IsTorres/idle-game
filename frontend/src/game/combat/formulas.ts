import type { Player, StatBonuses } from '../types';
import { getEffectiveStats } from '../player/playerCalculations';
import { getDungeon } from '../dungeons/dungeonDefinitions';
import { getMob, getNextMobId } from '../mobs/mobDefinitions';

export interface TickResult {
  damageTaken: number;
  hpBefore: number;
  hpAfter: number;
  mpBefore: number;
  mpAfter: number;
  mobDamageDealt: number;
  mobBefore: number;
  mobAfter: number;
  mobId: string;
  expGained: number;
  goldGained: number;
  mobKilled: boolean;
  isDead: boolean;
}

export function getPlayerDps(stats: StatBonuses, mobDefense: number): number {
  const attack = (stats.physicalDamage ?? 0) + (stats.magicalDamage ?? 0);
  return Math.max(1, attack - mobDefense);
}

function emptyResult(player: Player): TickResult {
  return {
    damageTaken: 0,
    hpBefore: player.hp,
    hpAfter: player.hp,
    mpBefore: player.mp,
    mpAfter: player.mp,
    mobDamageDealt: 0,
    mobBefore: 0,
    mobAfter: 0,
    mobId: '',
    expGained: 0,
    goldGained: 0,
    mobKilled: false,
    isDead: false,
  };
}

export function processCombatTick(player: Player): TickResult {
  if (!player.currentDungeonId) return emptyResult(player);

  const dungeon = getDungeon(player.currentDungeonId);
  const mob = getMob(player.currentMobId ?? '');
  if (!dungeon || !mob) return emptyResult(player);

  const stats = getEffectiveStats(player);
  const hpBefore = player.hp;
  const mpBefore = player.mp;
  const mobBefore = player.currentMobHp ?? mob.maxHp;

  const damageTaken = Math.max(1, mob.damage - (stats.physicalDefense ?? 0));
  player.hp = Math.max(0, player.hp - damageTaken);

  const regenHp = stats.regenHp ?? 0;
  const regenMp = stats.regenMp ?? 0;

  if (player.hp > 0) {
    player.hp = Math.min(player.maxHp, player.hp + regenHp);
    player.mp = Math.min(player.maxMp, player.mp + regenMp);
  }

  const isDead = player.hp <= 0;
  if (isDead) player.hp = 0;

  let mobAfter = mobBefore;
  let mobDamageDealt = 0;
  let mobKilled = false;

  if (!isDead) {
    mobDamageDealt = getPlayerDps(stats, mob.defense);
    mobAfter = Math.max(0, mobBefore - mobDamageDealt);
    mobKilled = mobAfter === 0;
  }

  player.currentMobHp = mobAfter;

  let expGained = 0;
  let goldGained = 0;

  if (!isDead) {
    expGained = dungeon.experiencePerTick;
    goldGained = dungeon.rewardGoldPerTick;

    if (mobKilled) {
      expGained += mob.xpReward;
      goldGained += mob.goldReward;
      const nextMobId = getNextMobId(mob.id, dungeon.id);
      const nextMob = nextMobId ? getMob(nextMobId) : undefined;
      player.currentMobId = nextMob?.id ?? null;
      player.currentMobHp = nextMob ? nextMob.maxHp : null;
    }
  }

  return {
    damageTaken,
    hpBefore,
    hpAfter: player.hp,
    mpBefore,
    mpAfter: player.mp,
    mobDamageDealt,
    mobBefore,
    mobAfter: mobKilled ? 0 : mobAfter,
    mobId: mob.id,
    expGained,
    goldGained,
    mobKilled,
    isDead,
  };
}