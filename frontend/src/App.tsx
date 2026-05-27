import { useGameStore } from './store/gameStore';
import { CharacterCreation } from './components/CharacterCreation/CharacterCreation';
import { Dashboard } from './components/Layout/Dashboard';
import './styles.css';

export default function App() {
  const player = useGameStore((s) => s.player);

  if (!player) {
    return <CharacterCreation />;
  }

  return <Dashboard />;
}
