import type { Rarity } from '../types';

export interface ShopItem {
  itemId: string;
  rarity?: Rarity;
  price: number;
}

export interface ShopShelf {
  id: string;
  minTitle: string;
  items: ShopItem[];
}

// ponytail: static tier catalog, no refresh/stock state; gold is the only limiter.
// Add refreshable limited stock + persisted purchase counters when pacing demands it.
export const shopShelves: ShopShelf[] = [
  {
    id: 'shop_novato',
    minTitle: 'novato',
    items: [
      { itemId: 'health_potion', price: 60 },
      { itemId: 'mana_potion', price: 40 },
      { itemId: 'cloth', price: 20 },
      { itemId: 'wood', price: 15 },
      { itemId: 'iron_ore', price: 30 },
      { itemId: 'leather_armor', price: 100 },
      { itemId: 'cloth_robe', price: 90 },
      { itemId: 'wooden_staff', price: 110 },
      { itemId: 'iron_ring', price: 120 },
    ],
  },
  {
    id: 'shop_explorador',
    minTitle: 'explorador',
    items: [
      { itemId: 'health_potion', price: 80 },
      { itemId: 'mana_potion', price: 60 },
      { itemId: 'elixir', price: 250 },
      { itemId: 'longbow', price: 400 },
      { itemId: 'ranger_cloak', price: 360 },
      { itemId: 'magic_essence', price: 90 },
      { itemId: 'steel_ingot', price: 140 },
      { itemId: 'iron_sword', price: 750, rarity: 'uncommon' },
      { itemId: 'mage_ring', price: 850, rarity: 'uncommon' },
      { itemId: 'iron_armor', price: 900, rarity: 'uncommon' },
    ],
  },
  {
    id: 'shop_heroi',
    minTitle: 'heroi',
    items: [
      { itemId: 'health_potion', price: 100 },
      { itemId: 'mana_potion', price: 80 },
      { itemId: 'elixir', price: 350 },
      { itemId: 'steel_sword', price: 3500, rarity: 'rare' },
      { itemId: 'steel_armor', price: 4200, rarity: 'rare' },
      { itemId: 'rune_staff', price: 3200, rarity: 'rare' },
      { itemId: 'rune_robe', price: 3800, rarity: 'rare' },
      { itemId: 'dragon_scale', price: 450 },
      { itemId: 'phoenix_feather', price: 700 },
    ],
  },
  {
    id: 'shop_conquistador',
    minTitle: 'conquistador',
    items: [
      { itemId: 'health_potion', price: 120 },
      { itemId: 'mana_potion', price: 100 },
      { itemId: 'elixir', price: 500 },
      { itemId: 'warhammer', price: 6500, rarity: 'rare' },
      { itemId: 'mage_amulet', price: 5800, rarity: 'rare' },
      { itemId: 'guardian_pendant', price: 6200, rarity: 'rare' },
      { itemId: 'strength_ring', price: 5500, rarity: 'rare' },
      { itemId: 'phoenix_feather', price: 900 },
      { itemId: 'magic_essence', price: 180 },
    ],
  },
  {
    id: 'shop_mitico',
    minTitle: 'mitico',
    items: [
      { itemId: 'health_potion', price: 150 },
      { itemId: 'mana_potion', price: 120 },
      { itemId: 'elixir', price: 700 },
      { itemId: 'void_shard', price: 500 },
      { itemId: 'strength_ring', price: 6500, rarity: 'rare' },
      { itemId: 'warhammer', price: 7800, rarity: 'rare' },
      { itemId: 'mage_amulet', price: 6200, rarity: 'rare' },
      { itemId: 'guardian_pendant', price: 7200, rarity: 'rare' },
    ],
  },
];