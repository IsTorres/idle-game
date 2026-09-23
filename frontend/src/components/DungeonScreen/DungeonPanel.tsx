import { useGameStore } from '../../store/gameStore';
import { dungeons } from '../../game/dungeons/dungeonDefinitions';
import { meetsTitleRequirement } from '../../game/player/playerCalculations';
import { getMobsByDungeon } from '../../game/mobs/mobDefinitions';
import { getTitleById } from '../../game/entities/titles';

export function DungeonPanel() {
  const player = useGameStore((s) => s.player);
  const enterDungeon = useGameStore((s) => s.enterDungeon);
  const leaveDungeon = useGameStore((s) => s.leaveDungeon);

  if (!player) return null;

  const inDungeon = player.currentDungeonId !== null;
  const inPenalty = player.deathPenaltyUntil !== null && Date.now() < player.deathPenaltyUntil;

  return (
    <div className="card">
      <h3 className="mb-2">Masmorras</h3>

      {inDungeon ? (
        <div>
          <p className="text-sm text-success mb-2">Explorando masmorra...</p>
          <button className="btn-danger w-full" onClick={leaveDungeon}>
            Sair da Masmorra
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {inPenalty && (
            <p className="text-sm text-danger mb-2">
              Você não pode entrar em masmorras durante a penalidade de morte.
            </p>
          )}
          {dungeons.map((d) => {
            const accessible = meetsTitleRequirement(player.experience, d.minTitle) && !inPenalty && player.hp > 0;
            const mobs = getMobsByDungeon(d.id);
            const recTitle = getTitleById(d.recommendedTitle);
            return (
              <button
                key={d.id}
                className="card"
                onClick={() => enterDungeon(d.id)}
                disabled={!accessible}
                style={{
                  textAlign: 'left',
                  cursor: accessible ? 'pointer' : 'not-allowed',
                  opacity: accessible ? 1 : 0.5,
                  borderColor: inDungeon ? 'var(--accent)' : undefined,
                }}
              >
                <div className="flex justify-between items-center">
                  <strong>{d.name}</strong>
                  <span className={`text-${accessible ? 'success' : 'muted'} text-sm`}>Nível {d.level}</span>
                </div>
                <div className="flex justify-between text-sm text-muted">
                  <span>EXP: {d.experiencePerTick}/tick</span>
                  <span className="text-gold">{d.rewardGoldPerTick} gold/tick</span>
                  <span>{mobs.map((m) => m.icon).join(' ')}</span>
                </div>
                <div className="text-sm text-muted">{d.description}</div>
                {recTitle && (
                  <div className="text-xs text-muted">Recomendado: {recTitle.name}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
