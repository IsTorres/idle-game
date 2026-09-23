import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PlayerStatus } from '../CharacterCreation/PlayerStatus';
import { DungeonPanel } from '../DungeonScreen/DungeonPanel';
import { DungeonView } from '../DungeonScene/DungeonView';
import { InventoryPanel } from '../Inventory/InventoryPanel';
import { EquipmentSlots } from '../Equipment/EquipmentSlots';
import { CraftingPanel } from '../Crafting/CraftingPanel';
import { MarketPanel } from '../Economy/MarketPanel';
import { OfflineReport } from '../Layout/OfflineReport';
import { getDungeon } from '../../game/dungeons/dungeonDefinitions';
import { getEffectiveStats } from '../../game/player/playerCalculations';

export function Dashboard() {
  const player = useGameStore((s) => s.player);
  const isRunning = useGameStore((s) => s.isRunning);
  const combatLogs = useGameStore((s) => s.combatLogs);
  const offlineReport = useGameStore((s) => s.offlineReport);
  const startGameLoop = useGameStore((s) => s.startGameLoop);
  const stopGameLoop = useGameStore((s) => s.stopGameLoop);
  const save = useGameStore((s) => s.save);
  const clearSave = useGameStore((s) => s.clearSave);

  useEffect(() => {
    startGameLoop();
    return () => stopGameLoop();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => save(), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!player) return null;

  const currentDungeon = player.currentDungeonId ? getDungeon(player.currentDungeonId) : null;
  const stats = getEffectiveStats(player);
  const inPenalty = player.deathPenaltyUntil !== null && Date.now() < player.deathPenaltyUntil;
  const penaltyRemaining = inPenalty
    ? Math.ceil((player.deathPenaltyUntil! - Date.now()) / 1000)
    : 0;

  return (
    <div className="container">
      <OfflineReport report={offlineReport} />

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 style={{ fontSize: '1.3rem' }}>{player.name}</h2>
          <span className="text-sm text-muted">
            ID: {player.id.slice(0, 8)}... | {isRunning ? '🟢 Online' : '⏸️ Pausado'}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save()}>Salvar</button>
          <button className="btn-danger" onClick={clearSave}>Resetar</button>
        </div>
      </div>

      {inPenalty && (
        <div className="card mb-4" style={{ borderColor: 'var(--danger)' }}>
          <div className="flex items-center gap-2">
            <span className="text-danger">⚠️</span>
            <span className="text-sm">
              Penalidade de morte ativa por mais {penaltyRemaining}s. Atributos reduzidos em 10%.
            </span>
          </div>
        </div>
      )}

      <div className="grid-main mb-4">
        <PlayerStatus player={player} stats={stats} />
        <div className="flex flex-col gap-4">
          {currentDungeon ? <DungeonView /> : <DungeonPanel />}
          {currentDungeon && (
            <div className="card">
              <h3 className="mb-2">Log de Combate</h3>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {combatLogs.slice(-50).map((log, i) => (
                  <div
                    key={combatLogs.length - 50 + i}
                    className={`log-entry text-${
                      log.type === 'death' ? 'danger' : log.type === 'loot' || log.type === 'mobKill' ? 'success' : log.type === 'exp' ? '' : 'muted'
                    }`}
                  >
                    [{log.tick}] {log.message}
                  </div>
                ))}
                {combatLogs.length === 0 && (
                  <div className="text-sm text-muted">Nenhum evento ainda...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid-3 mb-4">
        <EquipmentSlots />
        <InventoryPanel />
        <CraftingPanel />
      </div>

      <MarketPanel />
    </div>
  );
}
