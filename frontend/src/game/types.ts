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

export type ItemType = 'equipment' | 'material' | 'recipe';
export type Rarity = 'common' | 'uncommon' | 'rare';
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

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
  damagePerTick: number;
  rewardGoldPerTick: number;
  experiencePerTick: number;
  minTitle: string;
  lootTable: LootTableEntry[];
}

export interface LootTableEntry {
  itemId: string;
  chance: number;
}

export interface InventoryEntry {
  id: string;
  itemId: string;
  quantity: number;
}

export interface EquipmentEntry {
  slot: EquipmentSlot;
  itemId: string;
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
  deathPenaltyUntil: number | null;
  baseStats: StatBonuses;
  inventory: InventoryEntry[];
  equipment: EquipmentEntry[];
  unlockedRecipes: string[];
}

export interface CombatLogEntry {
  tick: number;
  type: 'damage' | 'heal' | 'loot' | 'death' | 'regen' | 'exp' | 'info';
  message: string;
}
