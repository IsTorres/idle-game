# AGENTS.md — Idle Medieval Fantasy RPG

## Structure

```
npm workspaces monorepo: frontend/ (Vite+React+Zustand), backend/ (Express+Prisma+SQLite)
```

- **Game simulation runs 100% on frontend** (`frontend/src/game/` — pure TS, no React deps). Backend is persistence-only.
- **Single Zustand store** in `frontend/src/store/gameStore.ts`. All actions (createPlayer, loadPlayer, enterDungeon, equip, craft, save) live there.
- **UI in Portuguese** (labels, messages). Plain CSS, dark theme via custom properties in `styles.css`.

### Frontend layout

| Path | Role |
|---|---|
| `game/simulation/tickEngine.ts` | Per-tick game loop logic (`processTick`) |
| `game/simulation/offlineProgress.ts` | Offline catch-up simulation |
| `game/combat/formulas.ts` | Combat math (`processCombatTick`) |
| `game/player/playerCalculations.ts` | baseStats, effective stats, title updates |
| `game/items/itemDefinitions.ts` | All items: materials, equipment, recipes (`Record<string, ItemDefinition>`) |
| `game/dungeons/dungeonDefinitions.ts` | 3 dungeons with per-tick damage/gold/exp + loot tables |
| `game/entities/{races,classes,titles}.ts` | 3 races, 3 classes, 15 XP-based titles |
| `game/loot/lootGenerator.ts` | One cumulative-chance roll per tick |
| `game/crafting/recipes.ts` | `canCraft` / `craftItem` / `unlockRecipe` |
| `game/inventory/inventoryManager.ts` | One stack per itemId; equip/unequip (slots: weapon/armor/accessory) |
| `game/save/saveManager.ts` | `serializePlayer` for persistence |
| `store/gameStore.ts` | Zustand store binding all of the above |
| `components/` | React views (Dashboard drives loop start/stop + auto-save) |

### Backend

- **Prisma models**: `Player`, `InventoryItem`, `Equipment`, `UnlockedRecipe` (cascade delete). `baseStats` is a JSON string; `updatedAt` drives offline progress.
- **Routes**: `POST /api/players` (create), `GET /api/players/:id` (load + include children), `DELETE /api/players/:id`, `POST /api/save/:id` (transaction: update scalars, deleteMany+createMany children).
- Imports use `.js` extension in ESM (`import './routes.js'`). tsx handles this.

## Game loop

- `setInterval` at **1000 ms/tick** — `startGameLoop()` in `gameStore.ts`, started/stopped by `Dashboard` mount/unmount.
- **`processTick`** (`tickEngine.ts`):
  1. No dungeon → out-of-combat regen only: `hp += regenHp*2`, `mp += regenMp*2` (capped).
  2. In dungeon → `processCombatTick` (below).
  3. Log damage/regen (buffer keeps last 100; UI shows 50).
  4. Death → penalty handling.
  5. XP += `dungeon.experiencePerTick` → `updateTitle()`.
  6. Gold += `dungeon.goldPerTick`.
  7. **One loot roll** per tick; recipe drops also call `unlockRecipe`.
- **Auto-save every 30 s** + manual button → `POST /api/save/:id` (`saveManager.ts`).

## Mechanics

### Combat (passive — player never attacks)

- Damage taken: `max(1, dungeon.damagePerTick - physicalDefense)` — always ≥1 (`formulas.ts`).
- Regen applies same tick (after damage, only if alive).
- Death: HP→0, `currentDungeonId=null`, HP restored to `floor(maxHp/2)`, penalty = **5 min at -10% all effective stats** (`deathPenaltyUntil`).
- Only `physicalDefense`, `regenHp/regenMp`, `maxHp/maxMp` have mechanical effect. `physicalDamage`, `magicalDamage`, `magicalDefense`, `precision`, `speed` are display-only.
- **Dungeon entry gates**: not already in dungeon, no active penalty, `hp > 0`, `meetsTitleRequirement(exp, dungeon.minTitle)` (title ID vs `experienceRequired`). Exit is free anytime.

### Progression

- **Stats (10)**: `maxHp, maxMp, regenHp, regenMp, physicalDefense, magicalDefense, physicalDamage, magicalDamage, precision, speed`.
- `baseStats` = `class.baseStats + race.statBonuses + class.statBonuses` (class sums twice) — computed once at creation.
- Effective stats = `baseStats + Σ equipment.statBonuses`, ×0.9 floored if death penalty active (`getEffectiveStats`).
- `player.maxHp/maxMp` re-synced only on equip/unequip/creation (HP/MP clamped down).
- **Titles**: 15 tiers, XP thresholds 0→1,600,000 in `titles.ts`. `updateTitle()` walks sorted list; dungeons gated by `minTitle`.
- **Races/classes**: 3 each (Humano/Elfo/Anão, Guerreiro/Mago/Arqueiro). Starting items: `wooden_sword` + `leather_armor`.

### Economy & crafting

- **Materials (5)**: wood, iron_ore, cloth, magic_essence, dragon_scale — only from dungeon loot tables.
- **Gold**: 1/3/8 per tick by dungeon. **No sink exists** (no shop, no potions).
- **Recipes (5)**: recipe items drop as loot → inventory AND `unlockedRecipes`. `canCraft` = unlocked + ingredients in stock; `craftItem` consumes ingredients → 1× result.
- **Inventory**: one stack per itemId, no cap, no drop/sell.

### Offline progress

- Computed in `loadPlayer` from `now - updatedAt` (time since last save). Only if >5 s elapsed; report modal only if >10 ticks.
- Cap: **24 h = 86,400 ticks**.
- No dungeon → bulk regen in one shot (death impossible). In dungeon → per-tick replay of the same math, **no combat logs**.
- Death mid-simulation: loop breaks, same 5-min penalty from current time, dungeon cleared, HP→50%.

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
```

## Architecture notes

- Vite proxies `/api/*` → `localhost:3001`. No CORS issues in dev.
- Save does **not** persist `maxHp`/`maxMp`/`baseStats` after creation — equipment-driven max HP/MP changes are lost on reload (known gap in `gameService.ts`).
- Player loads by pasting UUID (no auto-resume).
- No tests, no CI, no lint configured.

## Conventions

- `frontend/src/game/` = framework-agnostic game logic. `frontend/src/store/` = Zustand binding. `frontend/src/components/` = React views.
- All game entity data (races, classes, titles, dungeons, items) are exported arrays/dicts with `get*` helper functions.
