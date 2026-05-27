import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const gameService = {
  prisma,

  async createPlayer(data: {
    id: string;
    name: string;
    race: string;
    class: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    baseStats: string;
  }) {
    return prisma.player.create({ data });
  },

  async getPlayer(id: string) {
    return prisma.player.findUnique({
      where: { id },
      include: { inventory: true, equipment: true, recipes: true },
    });
  },

  async savePlayer(id: string, data: {
    hp: number;
    mp: number;
    gold: number;
    experience: number;
    title: string;
    currentDungeonId: string | null;
    deathPenaltyUntil: string | null;
    inventory: { itemId: string; quantity: number }[];
    equipment: { slot: string; itemId: string }[];
    recipes: { recipeId: string }[];
  }) {
    await prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { id },
        data: {
          hp: data.hp,
          mp: data.mp,
          gold: data.gold,
          experience: data.experience,
          title: data.title,
          currentDungeonId: data.currentDungeonId,
          deathPenaltyUntil: data.deathPenaltyUntil ? new Date(data.deathPenaltyUntil) : null,
        },
      });

      await tx.inventoryItem.deleteMany({ where: { playerId: id } });
      if (data.inventory.length > 0) {
        await tx.inventoryItem.createMany({
          data: data.inventory.map((inv) => ({
            playerId: id,
            itemId: inv.itemId,
            quantity: inv.quantity,
          })),
        });
      }

      await tx.equipment.deleteMany({ where: { playerId: id } });
      if (data.equipment.length > 0) {
        await tx.equipment.createMany({
          data: data.equipment.map((eq) => ({
            playerId: id,
            slot: eq.slot,
            itemId: eq.itemId,
          })),
        });
      }

      await tx.unlockedRecipe.deleteMany({ where: { playerId: id } });
      if (data.recipes.length > 0) {
        await tx.unlockedRecipe.createMany({
          data: data.recipes.map((r) => ({
            playerId: id,
            recipeId: r.recipeId,
          })),
        });
      }
    });
  },

  async deletePlayer(id: string) {
    await prisma.player.delete({ where: { id } });
  },
};
