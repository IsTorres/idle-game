import type { ItemDefinition } from '../types';

export const itemDefinitions: Record<string, ItemDefinition> = {
  // ===== Materiais =====
  wood: {
    id: 'wood',
    name: 'Madeira',
    type: 'material',
    rarity: 'common',
    description: 'Tábua de madeira comum, usada em diversas receitas.',
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Minério de Ferro',
    type: 'material',
    rarity: 'common',
    description: 'Minério bruto que pode ser refinado em equipamentos.',
  },
  cloth: {
    id: 'cloth',
    name: 'Tecido',
    type: 'material',
    rarity: 'common',
    description: 'Tecido simples feito de fibras vegetais.',
  },
  magic_essence: {
    id: 'magic_essence',
    name: 'Essência Mágica',
    type: 'material',
    rarity: 'uncommon',
    description: 'Resquícios de energia arcana pulsante.',
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: 'Escama de Dragão',
    type: 'material',
    rarity: 'rare',
    description: 'Escama rara com propriedades defensivas excepcionais.',
  },

  // ===== Equipamentos Comuns =====
  wooden_sword: {
    id: 'wooden_sword',
    name: 'Espada de Madeira',
    type: 'equipment',
    rarity: 'common',
    description: 'Espada simples de madeira, melhor que nada.',
    slot: 'weapon',
    statBonuses: { physicalDamage: 5 },
  },
  leather_armor: {
    id: 'leather_armor',
    name: 'Armadura de Couro',
    type: 'equipment',
    rarity: 'common',
    description: 'Armadura leve de couro, protege contra golpes básicos.',
    slot: 'armor',
    statBonuses: { physicalDefense: 5 },
  },
  cloth_robe: {
    id: 'cloth_robe',
    name: 'Túnica de Tecido',
    type: 'equipment',
    rarity: 'common',
    description: 'Túnica simples que oferece proteção mágica básica.',
    slot: 'armor',
    statBonuses: { magicalDefense: 5 },
  },
  wooden_staff: {
    id: 'wooden_staff',
    name: 'Cajado de Madeira',
    type: 'equipment',
    rarity: 'common',
    description: 'Cajado rústico que canaliza energia mágica.',
    slot: 'weapon',
    statBonuses: { magicalDamage: 5 },
  },
  short_bow: {
    id: 'short_bow',
    name: 'Arco Curto',
    type: 'equipment',
    rarity: 'common',
    description: 'Arco leve de madeira, preciso em curtas distâncias.',
    slot: 'weapon',
    statBonuses: { physicalDamage: 4, precision: 3 },
  },
  iron_ring: {
    id: 'iron_ring',
    name: 'Anel de Ferro',
    type: 'equipment',
    rarity: 'common',
    description: 'Anel simples que fortalece o usuário.',
    slot: 'accessory',
    statBonuses: { maxHp: 10 },
  },

  // ===== Equipamentos Incomuns =====
  iron_sword: {
    id: 'iron_sword',
    name: 'Espada de Ferro',
    type: 'equipment',
    rarity: 'uncommon',
    description: 'Espada forjada em ferro, muito superior à de madeira.',
    slot: 'weapon',
    statBonuses: { physicalDamage: 12 },
  },
  iron_armor: {
    id: 'iron_armor',
    name: 'Armadura de Ferro',
    type: 'equipment',
    rarity: 'uncommon',
    description: 'Armadura robusta de ferro, excelente proteção física.',
    slot: 'armor',
    statBonuses: { physicalDefense: 15, maxHp: 20 },
  },
  mage_ring: {
    id: 'mage_ring',
    name: 'Anel do Mago',
    type: 'equipment',
    rarity: 'uncommon',
    description: 'Anel imbuído com poder arcano.',
    slot: 'accessory',
    statBonuses: { magicalDamage: 8, maxMp: 20 },
  },

  // ===== Equipamentos Raros =====
  dragon_scale_armor: {
    id: 'dragon_scale_armor',
    name: 'Armadura de Escama de Dragão',
    type: 'equipment',
    rarity: 'rare',
    description: 'Armadura lendária forjada com escamas de dragão.',
    slot: 'armor',
    statBonuses: { physicalDefense: 30, magicalDefense: 25, maxHp: 50 },
  },
  dragon_blade: {
    id: 'dragon_blade',
    name: 'Lâmina do Dragão',
    type: 'equipment',
    rarity: 'rare',
    description: 'Espada imbuída com o poder flamejante dos dragões.',
    slot: 'weapon',
    statBonuses: { physicalDamage: 25, magicalDamage: 10 },
  },

  // ===== Receitas =====
  recipe_iron_sword: {
    id: 'recipe_iron_sword',
    name: 'Receita: Espada de Ferro',
    type: 'recipe',
    rarity: 'uncommon',
    description: 'Instruções para forjar uma Espada de Ferro.',
    ingredients: [{ itemId: 'iron_ore', quantity: 5 }, { itemId: 'wood', quantity: 2 }],
    resultItemId: 'iron_sword',
  },
  recipe_iron_armor: {
    id: 'recipe_iron_armor',
    name: 'Receita: Armadura de Ferro',
    type: 'recipe',
    rarity: 'uncommon',
    description: 'Instruções para forjar uma Armadura de Ferro.',
    ingredients: [{ itemId: 'iron_ore', quantity: 8 }, { itemId: 'cloth', quantity: 3 }],
    resultItemId: 'iron_armor',
  },
  recipe_mage_ring: {
    id: 'recipe_mage_ring',
    name: 'Receita: Anel do Mago',
    type: 'recipe',
    rarity: 'uncommon',
    description: 'Instruções para criar um Anel do Mago.',
    ingredients: [{ itemId: 'magic_essence', quantity: 3 }, { itemId: 'iron_ore', quantity: 2 }],
    resultItemId: 'mage_ring',
  },
  recipe_dragon_scale_armor: {
    id: 'recipe_dragon_scale_armor',
    name: 'Receita: Armadura de Escama de Dragão',
    type: 'recipe',
    rarity: 'rare',
    description: 'Instruções para forjar a lendária Armadura de Escama de Dragão.',
    ingredients: [
      { itemId: 'dragon_scale', quantity: 5 },
      { itemId: 'iron_armor', quantity: 1 },
      { itemId: 'magic_essence', quantity: 4 },
    ],
    resultItemId: 'dragon_scale_armor',
  },
  recipe_dragon_blade: {
    id: 'recipe_dragon_blade',
    name: 'Receita: Lâmina do Dragão',
    type: 'recipe',
    rarity: 'rare',
    description: 'Instruções para forjar a Lâmina do Dragão.',
    ingredients: [
      { itemId: 'dragon_scale', quantity: 3 },
      { itemId: 'iron_sword', quantity: 1 },
      { itemId: 'magic_essence', quantity: 5 },
    ],
    resultItemId: 'dragon_blade',
  },
};

export function getItemDefinition(id: string): ItemDefinition | undefined {
  return itemDefinitions[id];
}

export function getItemsByType(type: ItemDefinition['type']): ItemDefinition[] {
  return Object.values(itemDefinitions).filter((item) => item.type === type);
}

export function getItemsByRarity(rarity: ItemDefinition['rarity']): ItemDefinition[] {
  return Object.values(itemDefinitions).filter((item) => item.rarity === rarity);
}

export function getEquipmentsBySlot(slot: ItemDefinition['slot']): ItemDefinition[] {
  return Object.values(itemDefinitions).filter(
    (item) => item.type === 'equipment' && item.slot === slot,
  );
}
