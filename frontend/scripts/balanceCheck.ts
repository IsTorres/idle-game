// Economy + survivability sanity check. Run: npx tsx scripts/balanceCheck.ts
// Gate segments: each title gate unlocks the next dungeon. Assumes the player
// farms the best unlocked dungeon with the best gear available at that point.
import type { Player, EquipmentEntry } from '../src/game/types';
import { createPlayerBaseStats, getEffectiveStats } from '../src/game/player/playerCalculations';
import { getDungeon } from '../src/game/dungeons/dungeonDefinitions';
import { getMob, getMobsByDungeon } from '../src/game/mobs/mobDefinitions';

const CLASSES = ['warrior', 'mage', 'archer'] as const;
const HUMAN = 'human';

// [minExp, farmDungeon, best gear slot map]
const SEGMENTS: { minExp: number; dungeon: string; gear: EquipmentEntry[] }[] = [
  { minExp: 0, dungeon: 'dungeon_1', gear: [
    { slot: 'weapon', itemId: 'wooden_sword', rarity: 'common' },
    { slot: 'armor', itemId: 'leather_armor', rarity: 'common' },
  ]},
  { minExp: 700, dungeon: 'dungeon_2', gear: [
    { slot: 'weapon', itemId: 'iron_sword', rarity: 'uncommon' },
    { slot: 'armor', itemId: 'iron_armor', rarity: 'uncommon' },
    { slot: 'accessory', itemId: 'iron_ring', rarity: 'common' },
  ]},
  { minExp: 24000, dungeon: 'dungeon_3', gear: [
    { slot: 'weapon', itemId: 'steel_sword', rarity: 'rare' },
    { slot: 'armor', itemId: 'steel_armor', rarity: 'rare' },
    { slot: 'accessory', itemId: 'mage_ring', rarity: 'uncommon' },
  ]},
  { minExp: 100000, dungeon: 'dungeon_4', gear: [
    { slot: 'weapon', itemId: 'warhammer', rarity: 'rare' },
    { slot: 'armor', itemId: 'steel_armor', rarity: 'rare' },
    { slot: 'accessory', itemId: 'strength_ring', rarity: 'rare' },
  ]},
  { minExp: 400000, dungeon: 'dungeon_5', gear: [
    { slot: 'weapon', itemId: 'dragon_blade', rarity: 'epic' },
    { slot: 'armor', itemId: 'dragon_scale_armor', rarity: 'epic' },
    { slot: 'accessory', itemId: 'guardian_pendant', rarity: 'rare' },
  ]},
];

function playerFor(cls: string, gear: EquipmentEntry[]): Player {
  const baseStats = createPlayerBaseStats(HUMAN, cls);
  return {
    id: 'b', name: 'Bal', race: HUMAN, class: cls, title: 'novato', experience: 0,
    hp: 1000, maxHp: 1000, mp: 100, maxMp: 100, gold: 0,
    currentDungeonId: null, currentMobId: null, currentMobHp: null,
    deathPenaltyUntil: null, baseStats, inventory: [], equipment: gear, unlockedRecipes: [],
  };
}

interface SegmentStats {
  avgExpPerTick: number;
  avgGoldPerTick: number;
  killTicksPerMob: number;
  worstDrain: number; // net HP per tick vs worst trash mob (idle baseline)
  timeToDeathTicks: number;
  worstSpikeDrain: number; // net HP per tick vs worst elite/boss (active-play moment)
  worstSpikeHpPool: number;
}

function analyzeSegment(cls: string, dungeonId: string, gear: EquipmentEntry[]): SegmentStats {
  const dungeon = getDungeon(dungeonId)!;
  const player = playerFor(cls, gear);
  const stats = getEffectiveStats(player);
  const dps = Math.max(1, (stats.physicalDamage ?? 0) + (stats.magicalDamage ?? 0));
  const regen = stats.regenHp ?? 0;
  const hp = stats.maxHp ?? player.maxHp;

  const mobs = getMobsByDungeon(dungeonId).filter((m) => m.kind === 'trash');
  const spikes = getMobsByDungeon(dungeonId).filter((m) => m.kind !== 'trash');
  let totalTicks = 0;
  let totalXp = 0;
  let totalGold = 0;
  let worstPhysical = 0;
  let worstMagic = 0;
  let worstSpikeDrain = 0;

  for (const mob of mobs) {
    const t = Math.ceil(mob.maxHp / dps);
    totalTicks += t;
    totalXp += mob.xpReward;
    totalGold += mob.goldReward;
    if (mob.magicDamage) worstMagic = Math.max(worstMagic, mob.damage);
    else worstPhysical = Math.max(worstPhysical, mob.damage);
  }

  for (const spike of spikes) {
    const def = spike.magicDamage ? (stats.magicalDefense ?? 0) : (stats.physicalDefense ?? 0);
    worstSpikeDrain = Math.max(worstSpikeDrain, Math.max(0, Math.max(1, spike.damage - def) - regen));
  }

  const drainPhysical = Math.max(0, Math.max(1, worstPhysical - (stats.physicalDefense ?? 0)) - regen);
  const drainMagic = Math.max(0, Math.max(1, worstMagic - (stats.magicalDefense ?? 0)) - regen);
  const worstDrain = Math.max(drainPhysical, drainMagic);

  return {
    avgExpPerTick: dungeon.experiencePerTick + totalXp / totalTicks,
    avgGoldPerTick: dungeon.rewardGoldPerTick + totalGold / totalTicks,
    killTicksPerMob: totalTicks / mobs.length,
    worstDrain,
    timeToDeathTicks: worstDrain > 0 ? Math.floor(hp / worstDrain) : Number.POSITIVE_INFINITY,
    worstSpikeDrain,
    worstSpikeHpPool: worstSpikeDrain > 0 ? Math.floor(hp / worstSpikeDrain) : Number.POSITIVE_INFINITY,
  };
}

function hoursNeeded(avgExpPerTick: number, from: number, to: number): number {
  return (to - from) / avgExpPerTick / 3600;
}

const TITLE_GATES = [0, 700, 24000, 100000, 400000, 1600000];

console.log('=== Survivability (worst net drain/tick, and HP pool longevity) ===');
let anyFail = false;
for (const cls of CLASSES) {
  for (const seg of SEGMENTS) {
    const s = analyzeSegment(cls, seg.dungeon, seg.gear);
    const tag = s.worstDrain === 0 ? 'SUSTAINABLE'
      : s.timeToDeathTicks >= 10 * s.killTicksPerMob ? 'OK'
      : s.timeToDeathTicks >= 3 * s.killTicksPerMob ? 'RISKY'
      : 'FAIL';
    if (tag === 'FAIL') anyFail = true;
    const spike = s.worstSpikeHpPool === Infinity ? '—' : `spike:${(s.worstSpikeHpPool / 3600).toFixed(2)}h`;
    console.log(
      `  ${cls.padEnd(8)} ${seg.dungeon.padEnd(9)} drain=${s.worstDrain.toFixed(1).padEnd(5)}` +
      ` hpPool=${s.timeToDeathTicks === Infinity ? 'inf' : (s.timeToDeathTicks / 3600).toFixed(2) + 'h'} ` +
      ` kill=${s.killTicksPerMob.toFixed(1)}t ${tag.padEnd(12)} ${spike}`,
    );
  }
}

console.log('\n=== Progression pacing (hours of farming best dungeon to next/end) ===');
let exp = 0;
let cumHours = 0;
for (let i = 0; i < SEGMENTS.length; i++) {
  const seg = SEGMENTS[i];
  // use the balanced average of the three classes for pacing
  const samples = CLASSES.map((c) => analyzeSegment(c, seg.dungeon, seg.gear));
  const avgExp = samples.reduce((a, s) => a + s.avgExpPerTick, 0) / samples.length;
  const avgGold = samples.reduce((a, s) => a + s.avgGoldPerTick, 0) / samples.length;
  const to = TITLE_GATES[i + 1];
  const h = hoursNeeded(avgExp, exp, to);
  const hours = h * 0.95; // realistic: offline cap, but loot pokes / active play keeps it moving
  cumHours += hours;
  const nativeGold = avgGold * hours * 3600;
  console.log(
    `  ${seg.dungeon.padEnd(9)} exp@${(avgExp).toFixed(1)}/t gold@${(avgGold).toFixed(2)}/t ` +
    `-> ${to.toLocaleString()} in ${hours.toFixed(1)}h | gold earned here ~${(nativeGold / 1000).toFixed(0)}k`,
  );
  exp = to;
}
console.log(`\n  TOTAL: ~${cumHours.toFixed(0)}h to reach Lenda Viva (1.6M exp)`);

const miticoHours = SEGMENTS.slice(0, 4).reduce((acc, seg, i) => {
  const samples = CLASSES.map((c) => analyzeSegment(c, seg.dungeon, seg.gear));
  const avgExp = samples.reduce((a, s) => a + s.avgExpPerTick, 0) / samples.length;
  return acc + hoursNeeded(avgExp, TITLE_GATES[i], TITLE_GATES[i + 1]) * 0.95;
}, 0);

console.log(`\n=== Target check: ~11-26h to Mítico (unlocks dungeon_5): ${miticoHours.toFixed(1)}h ===`);
const pacingOk = miticoHours >= 11 && miticoHours <= 26;
console.log(pacingOk ? 'PASS' : 'NEEDS TUNING');

if (anyFail || !pacingOk) {
  console.error('\nBALANCE CHECK FAILED');
  process.exit(1);
}
console.log('balance check passed');