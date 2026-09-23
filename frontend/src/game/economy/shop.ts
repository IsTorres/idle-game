import type { Player } from '../types';
import { shopShelves, type ShopItem } from './shopDefinitions';
import { meetsTitleRequirement } from '../player/playerCalculations';
import { addItem } from '../inventory/inventoryManager';
import { getItemDefinition } from '../items/itemDefinitions';

export function getShopOfferings(player: Player): ShopItem[] {
  return shopShelves
    .filter((shelf) => meetsTitleRequirement(player.experience, shelf.minTitle))
    .flatMap((shelf) => shelf.items);
}

export function getShopItemPrice(player: Player, itemId: string): number | null {
  return getShopOfferings(player).find((o) => o.itemId === itemId)?.price ?? null;
}

export function buyItem(player: Player, itemId: string): boolean {
  const offering = getShopOfferings(player).find((o) => o.itemId === itemId);
  if (!offering) return false;
  if (player.gold < offering.price) return false;

  player.gold -= offering.price;

  const def = getItemDefinition(itemId);
  const rarity = def?.type === 'equipment' ? (offering.rarity ?? 'common') : undefined;
  addItem(player, itemId, 1, rarity);

  return true;
}