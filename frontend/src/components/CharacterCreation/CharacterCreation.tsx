import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { races } from '../../game/entities/races';
import { classes } from '../../game/entities/classes';

export function CharacterCreation() {
  const createPlayer = useGameStore((s) => s.createPlayer);
  const loadPlayer = useGameStore((s) => s.loadPlayer);

  const [name, setName] = useState('');
  const [raceId, setRaceId] = useState(races[0].id);
  const [classId, setClassId] = useState(classes[0].id);
  const [loadId, setLoadId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedRace = races.find((r) => r.id === raceId);
  const selectedClass = classes.find((c) => c.id === classId);

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Escolha um nome para seu aventureiro.');
      return;
    }
    setError('');
    createPlayer(name.trim(), raceId, classId);
  };

  const handleLoad = async () => {
    if (!loadId.trim()) return;
    setLoading(true);
    setError('');
    const success = await loadPlayer(loadId.trim());
    setLoading(false);
    if (!success) {
      setError('Jogador não encontrado. Verifique o ID.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: 40 }}>
      <div className="card">
        <h1 className="text-center mb-4" style={{ fontSize: '1.5rem' }}>
          Idle Medieval Fantasy
        </h1>
        <p className="text-center text-muted mb-4">
          Crie seu aventureiro e explore masmorras em busca de glória!
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>Nome do Aventureiro</label>
            <input
              className="w-full"
              placeholder="Digite seu nome..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          </div>

          <div>
            <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>Raça</label>
            <div className="flex flex-col gap-2">
              {races.map((race) => (
                <button
                  key={race.id}
                  className={raceId === race.id ? 'btn-primary' : ''}
                  onClick={() => setRaceId(race.id)}
                  style={{ textAlign: 'left' }}
                >
                  <strong>{race.name}</strong>
                  <div className="text-sm text-muted">{race.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>Classe</label>
            <div className="flex flex-col gap-2">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  className={classId === cls.id ? 'btn-primary' : ''}
                  onClick={() => setClassId(cls.id)}
                  style={{ textAlign: 'left' }}
                >
                  <strong>{cls.name}</strong>
                  <div className="text-sm text-muted">{cls.description}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-sm text-danger">{error}</div>}

          <button className="btn-primary w-full" onClick={handleCreate} style={{ padding: 12 }}>
            Iniciar Aventura!
          </button>

          <hr style={{ borderColor: 'var(--border)', margin: '8px 0' }} />

          <div>
            <label className="text-sm text-muted mb-2" style={{ display: 'block' }}>
              Ou carregar jogo existente (ID):
            </label>
            <div className="flex gap-2">
              <input
                className="w-full"
                placeholder="Cole o ID do jogador..."
                value={loadId}
                onChange={(e) => setLoadId(e.target.value)}
              />
              <button onClick={handleLoad} disabled={loading}>
                {loading ? 'Carregando...' : 'Carregar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
