import type { Rarity, RarityDefinition, RarityWeights } from '../types';

export const RARITIES: Record<Rarity, RarityDefinition> = {
  common: {
    id: 'common',
    name: 'Comum',
    statMultiplier: 1,
    color: 'var(--rarity-common)',
    dropWeight: 60,
  },
  uncommon: {
    id: 'uncommon',
    name: 'Incomum',
    statMultiplier: 1.25,
    color: 'var(--rarity-uncommon)',
    dropWeight: 22,
  },
  rare: {
    id: 'rare',
    name: 'Raro',
    statMultiplier: 1.6,
    color: 'var(--rarity-rare)',
    dropWeight: 10,
  },
  epic: {
    id: 'epic',
    name: 'Épico',
    statMultiplier: 2,
    color: 'var(--rarity-epic)',
    dropWeight: 5,
  },
  legendary: {
    id: 'legendary',
    name: 'Lendário',
    statMultiplier: 2.5,
    color: 'var(--rarity-legendary)',
    dropWeight: 2,
  },
};

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function getRarityDefinition(rarity: Rarity): RarityDefinition {
  return RARITIES[rarity];
}

export function getRarityMultiplier(rarity: Rarity): number {
  return RARITIES[rarity].statMultiplier;
}

export function getRarityName(rarity: Rarity): string {
  return RARITIES[rarity].name;
}

export function rollRarity(weights: RarityWeights): Rarity {
  const total = RARITY_ORDER.reduce((sum, rarity) => sum + weights[rarity], 0);
  if (total <= 0) return 'common';
  let roll = Math.random() * total;
  for (const rarity of RARITY_ORDER) {
    roll -= weights[rarity];
    if (roll <= 0) return rarity;
  }
  return 'legendary';
}