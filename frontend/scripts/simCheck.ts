import assert from 'node:assert';
import type { Player, RarityWeights } from '../src/game/types';
import { processTick } from '../src/game/simulation/tickEngine';
import { getMob } from '../src/game/mobs/mobDefinitions';
import { getDungeon } from '../src/game/dungeons/dungeonDefinitions';
import { rollRarity, RARITY_ORDER, RARITIES } from '../src/game/items/rarityDefinitions';
import { getItemStats } from '../src/game/items/itemStats';
import { getItemDefinition } from '../src/game/items/itemDefinitions';
import { addItem } from '../src/game/inventory/inventoryManager';
import { getShopOfferings, buyItem } from '../src/game/economy/shop';
import { useConsumable } from '../src/game/items/consumables';

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p-test',
    name: 'Teste',
    race: 'warrior',
    class: 'warrior',
    title: 'novato',
    experience: 0,
    hp: 1000,
    maxHp: 1000,
    mp: 100,
    maxMp: 100,
    gold: 0,
    currentDungeonId: null,
    currentMobId: null,
    currentMobHp: null,
    deathPenaltyUntil: null,
    baseStats: {
      maxHp: 1000,
      maxMp: 100,
      physicalDefense: 100,
      physicalDamage: 200,
      magicalDamage: 0,
      regenHp: 5,
      regenMp: 2,
    },
    inventory: [],
    equipment: [],
    unlockedRecipes: [],
    ...overrides,
  };
}

{
  const player = makePlayer({ currentDungeonId: 'dungeon_1' });
  const d1 = getDungeon('dungeon_1')!;
  const firstMobId = d1.pool[0];

  // mob assigned on entry (enterDungeon logic)
  player.currentMobId = firstMobId;
  player.currentMobHp = getMob(firstMobId)!.maxHp;

  let kills = 0;
  let died = false;
  let lootSeen = false;
  for (let i = 0; i < 400; i++) {
    const r = processTick(player);
    died = died || r.died;
    kills += r.logs.filter((l) => l.type === 'mobKill').length;
    if (r.logs.some((l) => l.type === 'loot')) lootSeen = true;
  }

  assert.equal(died, false, 'strong player must survive');
  assert.ok(kills >= 3, `mobs must be defeated and cycle (got ${kills})`);
  assert.ok(player.gold > 0, 'gold must be earned');
  // mob state must stay valid through cycling
  const mob = getMob(player.currentMobId!);
  assert.ok(mob, 'currentMobId must always resolve');
  assert.ok(player.currentMobHp !== null && player.currentMobHp > 0, 'active mob must have hp');
  assert.equal(mob.dungeonId, 'dungeon_1', 'mob must belong to current dungeon');
  console.log(
    `OK: survived 400 ticks | gold=${player.gold} exp=${player.experience} mob=${mob.name} mobHp=${player.currentMobHp} lootSeen=${lootSeen}`,
  );
}

{
  // weak player in a strong dungeon must die, clear dungeon + mob, and apply penalty
  const weak = makePlayer({
    currentDungeonId: 'dungeon_3',
    hp: 20,
    maxHp: 20,
    baseStats: { maxHp: 20, maxMp: 10, physicalDefense: 0, physicalDamage: 1, regenHp: 0, regenMp: 0 },
  });
  weak.currentMobId = 'orc';
  weak.currentMobHp = 100;

  const logs: ReturnType<typeof processTick>['logs'] = [];
  let died = false;
  for (let i = 0; i < 200 && !died; i++) {
    const r = processTick(weak);
    logs.push(...r.logs);
    died = r.died;
  }

  assert.equal(died, true, 'weak player must die in dungeon_3');
  assert.equal(weak.currentDungeonId, null, 'death clears dungeon');
  assert.equal(weak.currentMobId, null, 'death clears mob id');
  assert.equal(weak.currentMobHp, null, 'death clears mob hp');
  assert.ok(weak.deathPenaltyUntil !== null, 'death penalty must be set');
  assert.equal(weak.hp, Math.floor(weak.maxHp / 2), 'death restores 50% hp');
  console.log('OK: death clears dungeon/mob and applies penalty');
}

{
  // out-of-combat regen only, no mutations
  const p = makePlayer({ hp: 10, mp: 10 });
  const before = { hp: p.hp, mp: p.mp, gold: p.gold, exp: p.experience };
  for (let i = 0; i < 10; i++) processTick(p);
  assert.ok(p.hp > before.hp, 'hp must regen outside dungeon');
  assert.ok(p.mp > before.mp, 'mp must regen outside dungeon');
  assert.equal(p.gold, before.gold, 'no gold outside dungeon');
  assert.equal(p.experience, before.exp, 'no exp outside dungeon');
  console.log('OK: out-of-dungeon regen works, no rewards');
}

{
  // rarity roll + stat multiplier correctness
  const weights: RarityWeights = { common: 60, uncommon: 22, rare: 10, epic: 5, legendary: 2 };
  const zeroEpic: RarityWeights = { common: 60, uncommon: 30, rare: 10, epic: 0, legendary: 0 };
  const draws = Array.from({ length: 2000 }, () => rollRarity(weights));
  for (const d of draws) assert.ok(RARITY_ORDER.includes(d), `invalid rarity: ${d}`);
  assert.ok(draws.some((d) => d === 'rare') && draws.some((d) => d === 'legendary'), 'weights must produce rare+legendary');
  const noEpic = Array.from({ length: 500 }, () => rollRarity(zeroEpic));
  assert.ok(!noEpic.some((d) => d === 'epic' || d === 'legendary'), 'zero weights must never drop');

  const iron = getItemDefinition('iron_sword')!;
  assert.equal(getItemStats(iron, 'common').physicalDamage, 12);
  assert.equal(getItemStats(iron, 'epic').physicalDamage, Math.floor(12 * RARITIES.epic.statMultiplier));
  assert.ok(getItemStats(iron, 'legendary').physicalDamage > getItemStats(iron, 'epic').physicalDamage);
  console.log('OK: rarity roll + stat multiplier');
}

{
  // shop: tier gating, price enforcement, rarity preservation, consumables
  const player = makePlayer({ gold: 2000 });
  const offerings = getShopOfferings(player);
  assert.ok(offerings.some((o) => o.itemId === 'health_potion'), 'novato shelf must be visible from start');
  assert.ok(!offerings.some((o) => o.itemId === 'iron_sword'), 'explorador shelf must be locked at 0 exp');
  assert.equal(getShopOfferings(player).some((o) => o.itemId === 'steel_sword'), false, 'heroi shelf must be locked by title');

  const buyer = makePlayer({ gold: 2000, experience: 700, title: 'explorador' });
  const before = buyer.gold;
  assert.equal(buyItem(buyer, 'iron_sword'), true, 'buy must succeed with enough gold');
  assert.equal(buyer.gold, before - 750, 'gold must be deducted');
  const bought = buyer.inventory.find((i) => i.itemId === 'iron_sword')!;
  assert.equal(bought.rarity, 'uncommon', 'shop rarity must be preserved on the stack');

  assert.equal(buyItem(makePlayer({ gold: 10 }), 'iron_sword'), false, 'cannot buy with insufficient gold');

  const weak = makePlayer({ gold: 100000 });
  const startGold = weak.gold;
  assert.equal(buyItem(weak, 'steel_sword'), false, 'locked shelves must deny purchase');
  assert.equal(weak.gold, startGold, 'denied purchase must not drain gold');

  // consumable
  const drinker = makePlayer({ hp: 500, maxHp: 1000, mp: 900, maxMp: 1000 });
  addItem(drinker, 'health_potion');
  const potionId = drinker.inventory.find((i) => i.itemId === 'health_potion')!.id;
  drinker.hp = 500;
  assert.equal(useConsumable(drinker, potionId), true);
  assert.equal(drinker.hp, 1000, 'hp potion must restore 50% maxHp (500 -> 1000)');
  assert.equal(drinker.inventory.find((i) => i.id === potionId), undefined, 'consumed potion must leave inventory');
  console.log('OK: shop + consumables');
}

console.log('all sim checks passed');