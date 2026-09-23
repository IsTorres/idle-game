import { create } from 'zustand';
import type { Player, CombatLogEntry, Rarity } from '../game/types';
import { createPlayerBaseStats, getEffectiveStats } from '../game/player/playerCalculations';
import { getRace } from '../game/entities/races';
import { getClass } from '../game/entities/classes';
import { getTitle } from '../game/entities/titles';
import { dungeons, getDungeon } from '../game/dungeons/dungeonDefinitions';
import { meetsTitleRequirement } from '../game/player/playerCalculations';
import { processTick } from '../game/simulation/tickEngine';
import { calculateOfflineProgress } from '../game/simulation/offlineProgress';
import { saveGame } from '../game/save/saveManager';
import { apiClient } from '../api/client';
import { equipItem, unequipItem } from '../game/inventory/inventoryManager';
import { craftItem, canCraft } from '../game/crafting/recipes';
import { addItem } from '../game/inventory/inventoryManager';
import { getItemDefinition } from '../game/items/itemDefinitions';
import { getMobsByDungeon, getMob } from '../game/mobs/mobDefinitions';
import { buyItem } from '../game/economy/shop';
import { useConsumable } from '../game/items/consumables';

function generateId(): string {
  return crypto.randomUUID();
}

interface TickTimer {
  intervalId: ReturnType<typeof setInterval> | null;
}

interface GameStore {
  player: Player | null;
  combatLogs: CombatLogEntry[];
  isRunning: boolean;
  tickTimer: TickTimer;
  offlineReport: { visible: boolean; ticksSimulated: number; goldEarned: number; expEarned: number; died: boolean } | null;

  createPlayer: (name: string, raceId: string, classId: string) => void;
  loadPlayer: (id: string) => Promise<boolean>;
  startGameLoop: () => void;
  stopGameLoop: () => void;

  enterDungeon: (dungeonId: string) => boolean;
  leaveDungeon: () => void;

  equip: (inventoryId: string) => void;
  unequip: (slot: 'weapon' | 'armor' | 'accessory') => void;
  craft: (recipeId: string) => void;
  buyItem: (itemId: string) => void;
  useItem: (inventoryId: string) => void;

  save: () => Promise<void>;
  clearSave: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  player: null,
  combatLogs: [],
  isRunning: false,
  tickTimer: { intervalId: null },
  offlineReport: null,

  createPlayer: (name, raceId, classId) => {
    const race = getRace(raceId);
    const cls = getClass(classId);
    if (!race || !cls) return;

    const baseStats = createPlayerBaseStats(raceId, classId);
    const maxHp = baseStats.maxHp ?? 50;
    const maxMp = baseStats.maxMp ?? 20;
    const titleId = getTitle(0).id;

    const player: Player = {
      id: generateId(),
      name,
      race: raceId,
      class: classId,
      title: titleId,
      experience: 0,
      hp: maxHp,
      maxHp,
      mp: maxMp,
      maxMp,
      gold: 0,
      currentDungeonId: null,
      currentMobId: null,
      currentMobHp: null,
      deathPenaltyUntil: null,
      baseStats,
      inventory: [],
      equipment: [],
      unlockedRecipes: [],
    };

    addItem(player, 'wooden_sword', 1);
    addItem(player, 'leather_armor', 1);

    set({ player, combatLogs: [] });

    apiClient.createPlayer({
      id: player.id,
      name: player.name,
      race: player.race,
      class: player.class,
      hp: player.hp,
      maxHp: player.maxHp,
      mp: player.mp,
      maxMp: player.maxMp,
      baseStats: JSON.stringify(player.baseStats),
    });
  },

  loadPlayer: async (id) => {
    try {
      const data = await apiClient.getPlayer(id);
      if (!data) return false;

      const player: Player = {
        id: data.id,
        name: data.name,
        race: data.race,
        class: data.class,
        title: data.title,
        experience: data.experience,
        hp: data.hp,
        maxHp: data.maxHp,
        mp: data.mp,
        maxMp: data.maxMp,
        gold: data.gold,
        currentDungeonId: data.currentDungeonId,
        currentMobId: data.currentMobId ?? null,
        currentMobHp: data.currentMobHp ?? null,
        deathPenaltyUntil: data.deathPenaltyUntil ? new Date(data.deathPenaltyUntil).getTime() : null,
        baseStats: JSON.parse(data.baseStats),
        inventory: data.inventory?.map((inv: { id: string; itemId: string; quantity: number; rarity?: string }) => ({
          id: inv.id,
          itemId: inv.itemId,
          quantity: inv.quantity,
          rarity: (inv.rarity ?? 'common') as Rarity,
        })) ?? [],
        equipment: data.equipment?.map((eq: { slot: string; itemId: string; rarity?: string }) => ({
          slot: eq.slot,
          itemId: eq.itemId,
          rarity: (eq.rarity ?? 'common') as Rarity,
        })) ?? [],
        unlockedRecipes: data.recipes?.map((r: { recipeId: string }) => r.recipeId) ?? [],
      };

      if (player.currentDungeonId && (!player.currentMobId || player.currentMobHp === null)) {
        const mobs = getMobsByDungeon(player.currentDungeonId);
        const mob = mobs[0] ?? mobs.find((m) => m.id === player.currentMobId);
        if (mob) {
          player.currentMobId = mob.id;
          player.currentMobHp = mob.maxHp;
        }
      }

      const now = Date.now();
      const lastUpdate = new Date(data.updatedAt).getTime();
      const elapsedMs = now - lastUpdate;

      let report = { visible: false, ticksSimulated: 0, goldEarned: 0, expEarned: 0, died: false };

      if (elapsedMs > 5000) {
        const offlineResult = calculateOfflineProgress(player, elapsedMs);
        if (offlineResult.ticksSimulated > 10) {
          report = {
            visible: true,
            ticksSimulated: offlineResult.ticksSimulated,
            goldEarned: offlineResult.goldEarned,
            expEarned: offlineResult.expEarned,
            died: offlineResult.ticksUntilDeath !== null,
          };
        }
      }

      set({ player, offlineReport: report, combatLogs: [] });
      return true;
    } catch {
      return false;
    }
  },

  startGameLoop: () => {
    const state = get();
    if (state.isRunning || state.tickTimer.intervalId) return;

    const intervalId = setInterval(() => {
      const { player } = get();
      if (!player) return;

      const result = processTick(player);
      set({
        player: { ...player },
        combatLogs: [...get().combatLogs.slice(-100), ...result.logs],
      });
    }, 1000);

    set({ isRunning: true, tickTimer: { intervalId } });
  },

  stopGameLoop: () => {
    const state = get();
    if (state.tickTimer.intervalId) {
      clearInterval(state.tickTimer.intervalId);
    }
    set({ isRunning: false, tickTimer: { intervalId: null } });
  },

  enterDungeon: (dungeonId) => {
    const { player } = get();
    if (!player) return false;

    if (player.currentDungeonId) return false;
    if (player.deathPenaltyUntil && Date.now() < player.deathPenaltyUntil) return false;

    const dungeon = getDungeon(dungeonId);
    if (!dungeon) return false;

    if (!meetsTitleRequirement(player.experience, dungeon.minTitle)) return false;

    const stats = getEffectiveStats(player);
    if (player.hp <= 0) return false;

    player.currentDungeonId = dungeonId;
    const firstMob = getMobsByDungeon(dungeonId)[0];
    player.currentMobId = firstMob?.id ?? null;
    player.currentMobHp = firstMob ? firstMob.maxHp : null;
    set({
      player: { ...player },
      combatLogs: [{ tick: 0, type: 'info', message: `Entrou em: ${dungeon.name}` }],
    });

    return true;
  },

  leaveDungeon: () => {
    const { player } = get();
    if (!player || !player.currentDungeonId) return;

    const dungeon = getDungeon(player.currentDungeonId);
    player.currentDungeonId = null;
    player.currentMobId = null;
    player.currentMobHp = null;

    set({
      player: { ...player },
      combatLogs: [
        ...get().combatLogs,
        { tick: 0, type: 'info', message: `Saiu da ${dungeon?.name ?? 'dungeon'}.` },
      ],
    });
  },

  equip: (inventoryId) => {
    const { player } = get();
    if (!player) return;

    const success = equipItem(player, inventoryId);
    if (success) {
      const stats = getEffectiveStats(player);
      player.maxHp = stats.maxHp ?? player.maxHp;
      player.maxMp = stats.maxMp ?? player.maxMp;
      if (player.hp > player.maxHp) player.hp = player.maxHp;
      if (player.mp > player.maxMp) player.mp = player.maxMp;

      set({ player: { ...player } });
    }
  },

  unequip: (slot) => {
    const { player } = get();
    if (!player) return;

    const success = unequipItem(player, slot);
    if (success) {
      const stats = getEffectiveStats(player);
      player.maxHp = stats.maxHp ?? player.maxHp;
      player.maxMp = stats.maxMp ?? player.maxMp;
      if (player.hp > player.maxHp) player.hp = player.maxHp;
      if (player.mp > player.maxMp) player.mp = player.maxMp;

      set({ player: { ...player } });
    }
  },

  craft: (recipeId) => {
    const { player } = get();
    if (!player) return;

    const success = craftItem(player, recipeId);
    if (success) {
      const def = getItemDefinition(recipeId);
      const resultDef = def ? getItemDefinition(def.resultItemId ?? '') : null;
      set({
        player: { ...player },
        combatLogs: [
          ...get().combatLogs,
          { tick: 0, type: 'info', message: `Craftou: ${resultDef?.name ?? recipeId}!` },
        ],
      });
    }
  },

  buyItem: (itemId) => {
    const { player } = get();
    if (!player) return;

    if (buyItem(player, itemId)) {
      const def = getItemDefinition(itemId);
      set({
        player: { ...player },
        combatLogs: [
          ...get().combatLogs,
          { tick: 0, type: 'shop', message: `Comprou: ${def?.name ?? itemId}.` },
        ],
      });
    }
  },

  useItem: (inventoryId) => {
    const { player } = get();
    if (!player) return;

    const inv = player.inventory.find((i) => i.id === inventoryId);
    if (useConsumable(player, inventoryId)) {
      const def = inv ? getItemDefinition(inv.itemId) : null;
      set({
        player: { ...player },
        combatLogs: [
          ...get().combatLogs,
          { tick: 0, type: 'use', message: `Usou: ${def?.name ?? 'item'}.` },
        ],
      });
    }
  },

  save: async () => {
    const { player } = get();
    if (!player) return;

    await saveGame(player);
  },

  clearSave: () => {
    const { player, stopGameLoop } = get();
    stopGameLoop();
    if (player) {
      apiClient.getPlayer(player.id).then((data) => {
        if (data) {
          fetch(`/api/players/${player.id}`, { method: 'DELETE' });
        }
      });
    }
    set({ player: null, combatLogs: [], offlineReport: null });
    localStorage.removeItem('playerId');
  },
}));
