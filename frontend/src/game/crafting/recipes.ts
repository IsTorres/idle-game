import type { Player } from '../types';
import { getItemDefinition } from '../items/itemDefinitions';
import { removeItem, addItem } from '../inventory/inventoryManager';

export function unlockRecipe(player: Player, recipeId: string): boolean {
  const def = getItemDefinition(recipeId);
  if (!def || def.type !== 'recipe') return false;

  if (player.unlockedRecipes.includes(recipeId)) return false;

  player.unlockedRecipes.push(recipeId);
  return true;
}

export function canCraft(player: Player, recipeId: string): boolean {
  if (!player.unlockedRecipes.includes(recipeId)) return false;

  const def = getItemDefinition(recipeId);
  if (!def || def.type !== 'recipe' || !def.ingredients || !def.resultItemId) return false;

  for (const ing of def.ingredients) {
    const count = player.inventory.find((inv) => inv.itemId === ing.itemId)?.quantity ?? 0;
    if (count < ing.quantity) return false;
  }

  return true;
}

export function craftItem(player: Player, recipeId: string): boolean {
  if (!canCraft(player, recipeId)) return false;

  const def = getItemDefinition(recipeId)!;

  for (const ing of def.ingredients!) {
    removeItem(player, ing.itemId, ing.quantity);
  }

  addItem(player, def.resultItemId!, 1);

  return true;
}

export function getAvailableRecipes(player: Player): string[] {
  return player.unlockedRecipes.filter((recipeId) => canCraft(player, recipeId));
}
