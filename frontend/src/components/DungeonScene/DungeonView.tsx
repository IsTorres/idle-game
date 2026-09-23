import { useGameStore } from '../../store/gameStore';
import { getDungeon } from '../../game/dungeons/dungeonDefinitions';
import { getMob } from '../../game/mobs/mobDefinitions';

const CLASS_ICON: Record<string, string> = {
  warrior: '⚔️',
  mage: '🔮',
  archer: '🏹',
};

function pct(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export function DungeonView() {
  const player = useGameStore((s) => s.player);
  const combatLogs = useGameStore((s) => s.combatLogs);
  const leaveDungeon = useGameStore((s) => s.leaveDungeon);

  if (!player || !player.currentDungeonId) return null;
  const dungeon = getDungeon(player.currentDungeonId);
  const mob = player.currentMobId ? getMob(player.currentMobId) : null;
  if (!dungeon || !mob) return null;

  const last = combatLogs[combatLogs.length - 1];
  const mobHp = player.currentMobHp ?? mob.maxHp;

  return (
    <div className={`dungeon-scene theme-${dungeon.theme}`}>
      <div className="scene-backdrop" />
      <div className="scene-hud">
        <span className="text-sm text-muted">{dungeon.name}</span>
        <button onClick={leaveDungeon} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
          Sair da dungeon
        </button>
      </div>

      <div className="scene-vs">
        <div className="fighter">
          <div className="fighter-icon player-glow">{CLASS_ICON[player.class] ?? '⚔️'}</div>
          <div className="fighter-name">{player.name}</div>
          <div className="bar-container" style={{ height: 14, width: 150 }}>
            <div className="bar-fill hp" style={{ width: `${pct(player.hp, player.maxHp)}%` }} />
            <div className="bar-text" style={{ fontSize: '0.6rem' }}>{player.hp}/{player.maxHp}</div>
          </div>
        </div>

        <div className="vs-mark">VS</div>

        <div className="fighter">
          <div
            key={last && (last.type === 'mobDamage' || last.type === 'mobKill') ? `${last.tick}-${last.type}` : 'mob-idle'}
            className={`fighter-icon ${last?.type === 'mobKill' ? 'mob-vanish' : last?.type === 'mobDamage' ? 'mob-hit' : ''}`}
          >
            {mob.icon}
          </div>
          <div className={`fighter-name ${mob.kind === 'boss' ? 'boss-tag' : ''}`}>{mob.name}</div>
          <div className="bar-container" style={{ height: 14, width: 150 }}>
            <div className="bar-fill mob" style={{ width: `${pct(mobHp, mob.maxHp)}%` }} />
            <div className="bar-text" style={{ fontSize: '0.6rem' }}>{mobHp}/{mob.maxHp}</div>
          </div>
        </div>
      </div>
    </div>
  );
}