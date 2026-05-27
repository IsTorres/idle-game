# AGENTS.md — Idle Medieval Fantasy RPG

## Structure

```
npm workspaces monorepo: frontend/ (Vite+React+Zustand), backend/ (Express+Prisma+SQLite)
```

- **Game simulation runs 100% on frontend** (`frontend/src/game/` — pure TS, no React deps). Backend is persistence-only.
- **Single Zustand store** in `frontend/src/store/gameStore.ts`. All actions (createPlayer, enterDungeon, equip, craft, save) live there.
- **Item definitions are static** in `frontend/src/game/items/itemDefinitions.ts` (a `Record<string, ItemDefinition>`). Add new items there.
- **Dungeon definitions** in `dungeonDefinitions.ts` with loot tables (itemId + chance per entry).
- **Prisma models**: Player, InventoryItem, Equipment, UnlockedRecipe. `baseStats` is a JSON string field.
- **UI in Portuguese** (labels, messages). CSS is plain (no UI library), dark theme via CSS custom properties in `styles.css`.

## Commands

```bash
npm run dev              # Starts both frontend (:5173) + backend (:3001) via concurrently
npm run dev:frontend     # Vite dev server only
npm run dev:backend      # tsx watch on src/index.ts
npm run build            # tsc -b && vite build (frontend) + tsc (backend)
```

### Backend (Prisma)

```bash
cd backend
npx prisma db push       # Push schema to SQLite (run after schema changes)
npx prisma generate      # Regenerate client
npx prisma studio        # GUI data browser
```

## Verification

```bash
# Type-check only (no linter/formatter configured)
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

## Architecture Notes

- **API proxy**: Vite proxies `/api/*` → `localhost:3001`. No CORS issues in dev.
- **Backend imports use `.js` extension** in ESM (`import './routes.js'`). tsx handles this.
- **Offline progress**: computed on frontend load from elapsed time since `updatedAt`. Capped at 24h ticks. Stops on player death mid-simulation.
- **Death penalty**: 5 min at -10% all stats. Enforced in `getEffectiveStats()` and checked before dungeon entry.
- **Dungeon gating**: each dungeon has `minTitle` (string ID). Checked via `meetsTitleRequirement()` comparing player XP against title's `experienceRequired`.
- **Player creation** gives `wooden_sword` + `leather_armor` as starting items.
- **Save**: auto every 30s, serializes full state to `POST /api/save/:id`.
- **Titles**: 15 tiers, XP-based. See `frontend/src/game/entities/titles.ts`.
- **Combat**: `max(1, dungeonDamage - physicalDefense)` per tick. Regen applies same tick. Death sets HP to 50% and clears dungeon.

## Conventions

- `frontend/src/game/` = framework-agnostic game logic. `frontend/src/store/` = Zustand binding. `frontend/src/components/` = React views.
- All game entity data (races, classes, titles, dungeons, items) are exported arrays/dicts with `get*` helper functions.
- No tests, no CI, no lint configured.
