import { useGameStore } from '../../store/gameStore';
import { dungeons } from '../../game/dungeons/dungeonDefinitions';
import { meetsTitleRequirement } from '../../game/player/playerCalculations';

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
                <strong>{d.name}</strong>
                <div className="flex justify-between text-sm text-muted">
                  <span>Dano: {d.damagePerTick}/tick</span>
                  <span>EXP: {d.experiencePerTick}/tick</span>
                  <span className="text-gold">{d.rewardGoldPerTick} gold/tick</span>
                </div>
                <div className="text-sm text-muted">{d.description}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
