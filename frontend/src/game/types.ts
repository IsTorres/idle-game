export type Stat =
  | 'maxHp'
  | 'maxMp'
  | 'regenHp'
  | 'regenMp'
  | 'physicalDefense'
  | 'magicalDefense'
  | 'physicalDamage'
  | 'magicalDamage'
  | 'precision'
  | 'speed';

export type ItemType = 'equipment' | 'material' | 'recipe' | 'consumable';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type RarityWeights = Record<Rarity, number>;

export interface RarityDefinition {
  id: Rarity;
  name: string;
  statMultiplier: number;
  color: string;
  dropWeight: number;
}

export interface ConsumableEffect {
  hpPercent?: number;
  mpPercent?: number;
}

export interface StatBonuses {
  maxHp?: number;
  maxMp?: number;
  regenHp?: number;
  regenMp?: number;
  physicalDefense?: number;
  magicalDefense?: number;
  physicalDamage?: number;
  magicalDamage?: number;
  precision?: number;
  speed?: number;
}

export interface Ingredient {
  itemId: string;
  quantity: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  description: string;
  slot?: EquipmentSlot;
  statBonuses?: StatBonuses;
  effect?: ConsumableEffect;
  ingredients?: Ingredient[];
  resultItemId?: string;
}

export interface Race {
  id: string;
  name: string;
  description: string;
  statBonuses: StatBonuses;
}

export interface Class {
  id: string;
  name: string;
  description: string;
  baseStats: StatBonuses;
  statBonuses: StatBonuses;
}

export interface Title {
  id: string;
  name: string;
  experienceRequired: number;
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  level: number;
  minTitle: string;
  recommendedTitle: string;
  theme: string;
  rewardGoldPerTick: number;
  experiencePerTick: number;
  rarityWeights: RarityWeights;
  pool: string[];
}

export interface LootTableEntry {
  itemId: string;
  chance: number;
}

export interface Mob {
  id: string;
  name: string;
  icon: string;
  kind: 'trash' | 'elite' | 'boss';
  maxHp: number;
  damage: number;
  defense: number;
  xpReward: number;
  goldReward: number;
  lootTable: LootTableEntry[];
  dungeonId: string;
}

export interface InventoryEntry {
  id: string;
  itemId: string;
  quantity: number;
  rarity?: Rarity;
}

export interface EquipmentEntry {
  slot: EquipmentSlot;
  itemId: string;
  rarity?: Rarity;
}

export interface Player {
  id: string;
  name: string;
  race: string;
  class: string;
  title: string;
  experience: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  currentDungeonId: string | null;
  currentMobId: string | null;
  currentMobHp: number | null;
  deathPenaltyUntil: number | null;
  baseStats: StatBonuses;
  inventory: InventoryEntry[];
  equipment: EquipmentEntry[];
  unlockedRecipes: string[];
}

export interface CombatLogEntry {
  tick: number;
  type: 'damage' | 'heal' | 'loot' | 'death' | 'regen' | 'exp' | 'info' | 'mobDamage' | 'mobKill' | 'shop' | 'use';
  message: string;
}
