import type { Player, StatBonuses } from '../../game/types';
import { titles } from '../../game/entities/titles';

interface Props {
  player: Player;
  stats: StatBonuses;
}

export function PlayerStatus({ player, stats }: Props) {
  const currentTitle = titles.find((t) => t.id === player.title) ?? titles[0];
  const nextTitle = titles.find((t) => t.experienceRequired > player.experience);
  const expProgress = nextTitle
    ? ((player.experience - currentTitle.experienceRequired) /
        (nextTitle.experienceRequired - currentTitle.experienceRequired)) *
      100
    : 100;

  const statList: { label: string; value: number; color?: string }[] = [
    { label: 'HP', value: player.hp, color: 'var(--hp-color)' },
    { label: 'Max HP', value: player.maxHp },
    { label: 'MP', value: player.mp, color: 'var(--mp-color)' },
    { label: 'Max MP', value: player.maxMp },
    { label: 'Regen HP', value: stats.regenHp ?? 0 },
    { label: 'Regen MP', value: stats.regenMp ?? 0 },
    { label: 'Def. Física', value: stats.physicalDefense ?? 0 },
    { label: 'Def. Mágica', value: stats.magicalDefense ?? 0 },
    { label: 'Dano Físico', value: stats.physicalDamage ?? 0 },
    { label: 'Dano Mágico', value: stats.magicalDamage ?? 0 },
    { label: 'Precisão', value: stats.precision ?? 0 },
    { label: 'Velocidade', value: stats.speed ?? 0 },
  ];

  return (
    <div className="card">
      <h3 className="mb-2">Status do Personagem</h3>

      <div className="mb-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">{player.name}</span>
          <span className="text-gold">{currentTitle.name}</span>
        </div>
      </div>

      <div className="mb-2">
        <div className="bar-container" style={{ height: 16 }}>
          <div className="bar-fill hp" style={{ width: `${(player.hp / player.maxHp) * 100}%` }} />
          <div className="bar-text" style={{ fontSize: '0.65rem' }}>HP {player.hp}/{player.maxHp}</div>
        </div>
      </div>

      <div className="mb-2">
        <div className="bar-container" style={{ height: 16 }}>
          <div className="bar-fill mp" style={{ width: `${(player.mp / player.maxMp) * 100}%` }} />
          <div className="bar-text" style={{ fontSize: '0.65rem' }}>MP {player.mp}/{player.maxMp}</div>
        </div>
      </div>

      <div className="mb-2">
        <div className="bar-container" style={{ height: 16 }}>
          <div className="bar-fill exp" style={{ width: `${Math.min(expProgress, 100)}%` }} />
          <div className="bar-text" style={{ fontSize: '0.65rem' }}>
            EXP: {player.experience}{nextTitle ? ` (${nextTitle.name})` : ` (MAX)`}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted">Ouro</span>
        <span className="text-gold">{player.gold}</span>
      </div>

      <hr style={{ borderColor: 'var(--border)', margin: '8px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
        {statList.map((s) => (
          <div key={s.label} className="flex justify-between text-sm">
            <span className="text-muted">{s.label}</span>
            <span style={s.color ? { color: s.color } : undefined}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
