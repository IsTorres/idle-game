import type { Player, InventoryEntry, EquipmentEntry, EquipmentSlot, Rarity } from '../types';
import { getItemDefinition } from '../items/itemDefinitions';

let nextInventoryId = 1;

function normalizeRarity(rarity?: Rarity): Rarity {
  // ponytail: single 'common' key for everything without an explicit rarity
  // so materials, craft results and old saves never split into separate stacks
  return rarity ?? 'common';
}

export function addItem(player: Player, itemId: string, quantity: number = 1, rarity?: Rarity): boolean {
  const def = getItemDefinition(itemId);
  if (!def) return false;

  const rarityKey = normalizeRarity(rarity);
  const existing = player.inventory.find((inv) => inv.itemId === itemId && normalizeRarity(inv.rarity) === rarityKey);
  if (existing) {
    existing.quantity += quantity;
  } else {
    player.inventory.push({
      id: `inv_${nextInventoryId++}`,
      itemId,
      quantity,
      rarity: rarityKey,
    });
  }

  return true;
}

export function removeItem(player: Player, itemId: string, quantity: number): boolean {
  const existing = player.inventory.find((inv) => inv.itemId === itemId);
  if (!existing || existing.quantity < quantity) return false;

  existing.quantity -= quantity;
  if (existing.quantity <= 0) {
    player.inventory = player.inventory.filter((inv) => inv.id !== existing.id);
  }

  return true;
}

export function getItemCount(player: Player, itemId: string): number {
  // counts across rarities; used for materials/consumables
  return player.inventory
    .filter((inv) => inv.itemId === itemId)
    .reduce((sum, inv) => sum + inv.quantity, 0);
}

export function equipItem(player: Player, inventoryId: string): boolean {
  const invEntry = player.inventory.find((inv) => inv.id === inventoryId);
  if (!invEntry) return false;

  const def = getItemDefinition(invEntry.itemId);
  if (!def || def.type !== 'equipment' || !def.slot) return false;

  const slot = def.slot;

  const existingEq = player.equipment.find((eq) => eq.slot === slot);
  if (existingEq) {
    unequipItem(player, slot);
  }

  player.equipment.push({ slot, itemId: invEntry.itemId, rarity: normalizeRarity(invEntry.rarity) });

  const invIndex = player.inventory.findIndex((inv) => inv.id === invEntry.id);
  if (invIndex !== -1) {
    const stack = player.inventory[invIndex];
    stack.quantity -= 1;
    if (stack.quantity <= 0) {
      player.inventory = player.inventory.filter((inv) => inv.id !== stack.id);
    }
  }

  return true;
}

export function unequipItem(player: Player, slot: EquipmentSlot): boolean {
  const eqIndex = player.equipment.findIndex((eq) => eq.slot === slot);
  if (eqIndex === -1) return false;

  const eq = player.equipment[eqIndex];
  player.equipment.splice(eqIndex, 1);

  addItem(player, eq.itemId, 1, normalizeRarity(eq.rarity));

  return true;
}

export function getEquippedItemId(player: Player, slot: EquipmentSlot): string | null {
  const eq = player.equipment.find((e) => e.slot === slot);
  return eq?.itemId ?? null;
}

export type { InventoryEntry, EquipmentEntry };