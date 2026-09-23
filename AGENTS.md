# AGENTS.md — Idle Medieval Fantasy RPG

## Structure

```
npm workspaces monorepo: frontend/ (Vite+React+Zustand), backend/ (Express+Prisma+SQLite)
```

- **Game simulation runs 100% on frontend** (`frontend/src/game/` — pure TS, no React deps). Backend is persistence-only.
- **Single Zustand store** in `frontend/src/store/gameStore.ts`. All actions (createPlayer, loadPlayer, enterDungeon, leaveDungeon, equip, craft, buyItem, useItem, save) live there.
- **UI in Portuguese** (labels, messages). Plain CSS, dark theme via custom properties in `styles.css`.

### Frontend layout

| Path | Role |
|---|---|
| `game/simulation/tickEngine.ts` | Per-tick game loop logic (`processTick`) |
| `game/simulation/offlineProgress.ts` | Offline catch-up simulation (24 h cap) |
| `game/combat/formulas.ts` | Combat math (`processCombatTick`, `getPlayerDps`) |
| `game/player/playerCalculations.ts` | baseStats, effective stats, title updates |
| `game/items/itemDefinitions.ts` | 52 items: materials, equipment, consumables, recipes |
| `game/items/rarityDefinitions.ts` | 5 rarities, multipliers, `rollRarity` (cumulative weights) |
| `game/items/itemStats.ts` | `getItemStats(def, rarity)` rarity-scaled stat bonuses |
| `game/items/consumables.ts` | `useConsumable` (hp%/mp% potions) |
| `game/mobs/mobDefinitions.ts` | 21 mobs (trash/elite/boss), `getNextMobId` cycles the pool |
| `game/dungeons/dungeonDefinitions.ts` | 5 dungeons: pool, per-tick gold/exp, rarity weights, theme |
| `game/economy/shopDefinitions.ts` | 5 title-gated shop shelves (static catalog) |
| `game/economy/shop.ts` | `getShopOfferings(player)`, `buyItem` |
| `game/entities/{races,classes,titles}.ts` | 3 races, 3 classes, 15 XP-based titles |
| `game/loot/lootGenerator.ts` | One cumulative-chance roll per tick |
| `game/crafting/recipes.ts` | `canCraft` / `craftItem` / `unlockRecipe` |
| `game/inventory/inventoryManager.ts` | Stack per itemId+rarity; equip/unequip (weapon/armor/accessory) |
| `game/save/saveManager.ts` | `serializePlayer` for persistence |
| `store/gameStore.ts` | Zustand store binding all of the above |
| `components/` | React views (Dashboard drives loop + auto-save) |
| `components/common/ItemStats.tsx` | Mechanical-stat display with equip comparison |
| `components/DungeonScene/DungeonView.tsx` | Themed CSS battle scene + exit button |
| `components/Economy/MarketPanel.tsx` | Shop UI (city only) |

### Backend

- **Prisma models**: `Player`, `InventoryItem`, `Equipment`, `UnlockedRecipe` (cascade delete). `baseStats` is a JSON string; `updatedAt` drives offline progress. All player scalars (incl. `maxHp`/`maxMp`) are persisted on save.
- **Routes**: `POST /api/players` (create), `GET /api/players/:id` (load + include children), `DELETE /api/players/:id`, `POST /api/save/:id` (transaction: update scalars, deleteMany+createMany children).
- Imports use `.js` extension in ESM (`import './routes.js'`). tsx handles this.

## Game loop

- `setInterval` at **1000 ms/tick** — `startGameLoop()` in `gameStore.ts`, started/stopped by `Dashboard` mount/unmount.
- **`processTick`** (`tickEngine.ts`):
  1. No dungeon → out-of-combat regen only: `hp += regenHp*2`, `mp += regenMp*2` (capped).
  2. In dungeon → `processCombatTick` (below).
  3. Log damage/regen (buffer keeps last 100; UI shows 50).
  4. Death → penalty handling.
  5. XP += dungeon/mob exp → `updateTitle()`; **title up restores HP/MP to full**.
  6. Gold += dungeon/mob gold.
  7. One loot roll per tick; recipe drops also call `unlockRecipe`.
- **Auto-save every 30 s** + manual button → `POST /api/save/:id` (`saveManager.ts`).

## Mechanics

### Combat (passive — player never attacks)

- Damage taken: `max(1, mob.damage - defense)`, **defense = `magicalDefense` if `mob.magicDamage` else `physicalDefense`** (`formulas.ts`). Always ≥1.
- Regen applies same tick (after damage, only if alive).
- Player DPS: `max(1, (physicalDamage + magicalDamage) - mob.defense)`.
- Mob kill advances the dungeon pool in cycle order (`getNextMobId`); grants `mob.xpReward`/`mob.goldReward` on top of dungeon baseline.
- Death: HP→0, `currentDungeonId/currentMobId/currentMobHp=null`, HP→`floor(maxHp/2)`, penalty = **5 min at -10% all effective stats** (`deathPenaltyUntil`).
- **Balance**: mob damage is tuned so trash mobs at the tier's recommended gear are idle-sustainable (net drain ≤ ~3); elite/boss mobs are survivable active-play spikes. See `scripts/balanceCheck.ts` and re-run it after touching class/mob/dungeon numbers.

### Progression

- **Stats (10)**: `maxHp, maxMp, regenHp, regenMp, physicalDefense, magicalDefense, physicalDamage, magicalDamage, precision, speed`.
- `baseStats` computed once at creation (`class.baseStats + race.statBonuses + class.statBonuses`). Immutable.
- Effective stats = `baseStats + Σ rarity-scaled equipment bonuses`, ×0.9 floored if penalty active.
- `player.maxHp/maxMp` re-synced on equip/unequip/creation (HP/MP clamped) and **persisted on save**.
- **Titles**: 15 tiers, XP thresholds 0→1,600,000 in `titles.ts`. `updateTitle()` walks sorted list; dungeons gated by `minTitle`. Level-up heals to full.
- **Races/classes**: 3 each (Humano/Elfo/Anão, Guerreiro/Mago/Arqueiro). Starting items: `wooden_sword` + `leather_armor`.
- **Rarity**: common/uncommon/rare/epic/legendary with stat multipliers (1/1.25/1.6/2/2.5). Inventory/equipment stacks are instance-rarity aware (undefined → common). Shop sells only up to rare; epic/legendary are dungeon/crafting-only.

### Economy & crafting

- **Materials (8)**: wood, iron_ore, cloth, magic_essence, dragon_scale, steel_ingot, phoenix_feather, void_shard — from loot tables and/or the shop.
- **Gold sinks**: the market (5 shelves: potions, materials, gear up to rare). Gold comes from dungeon tick + mob kills.
- **Potions**: health (50% HP), mana (50% MP), elixir (100% both) — bought or looted, used from inventory.
- **Recipes**: drop as loot → inventory AND `unlockedRecipes`. `canCraft` = unlocked + ingredients; `craftItem` consumes → 1× result.
- **Inventory**: one stack per itemId+rarity, no cap, no drop/sell.

### Offline progress

- Computed in `loadPlayer` from `now - updatedAt`. Only if >5 s elapsed; report modal only if >10 ticks.
- Cap: **24 h = 86,400 ticks**.
- No dungeon → bulk regen in one shot (death impossible). In dungeon → per-tick replay of the same math, **no combat logs**.

## Commands

```bash
npm run dev              # frontend (:5173) + backend (:3001) via concurrently
npm run dev:frontend     # Vite only
npm run dev:backend      # tsx watch on src/index.ts
npm run build            # tsc -b && vite build (frontend) + tsc (backend)
```

### Backend (Prisma)

```bash
cd backend
npx prisma db push       # after schema changes
npx prisma generate
npx prisma studio
```

## Verification

```bash
# Type-check only (no linter/formatter configured)
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit

# Regression + balance gates (run after gameplay/content changes)
cd frontend && npx tsx scripts/simCheck.ts       # sim invariants (combat, death, loot, shop, level-up, save)
cd frontend && npx tsx scripts/balanceCheck.ts   # class survivability + XP pacing (Mítico in 11-26 h)
```

## Architecture notes

- Vite proxies `/api/*` → `localhost:3001`. No CORS issues in dev.
- Player loads by pasting UUID (no auto-resume).

## Conventions

- `frontend/src/game/` = framework-agnostic game logic. `frontend/src/store/` = Zustand binding. `frontend/src/components/` = React views.
- All game entity data (races, classes, titles, dungeons, items, mobs, shop shelves) are exported arrays/dicts with `get*` helper functions.
- Content numbers (mob HP/damage, XP/gold, shop prices) are tuned against `balanceCheck.ts`; keep the script green.