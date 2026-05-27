import { useGameStore } from '../../store/gameStore';
import { getItemDefinition } from '../../game/items/itemDefinitions';

const slotLabels: Record<string, string> = {
  weapon: 'Arma',
  armor: 'Armadura',
  accessory: 'Acessório',
};

export function EquipmentSlots() {
  const player = useGameStore((s) => s.player);
  const unequip = useGameStore((s) => s.unequip);

  if (!player) return null;

  return (
    <div className="card">
      <h3 className="mb-2">Equipamentos</h3>
      <div className="flex flex-col gap-2">
        {(['weapon', 'armor', 'accessory'] as const).map((slot) => {
          const equipped = player.equipment.find((e) => e.slot === slot);
          const def = equipped ? getItemDefinition(equipped.itemId) : null;

          return (
            <div key={slot} className="card" style={{ padding: 8 }}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted">{slotLabels[slot]}</div>
                  {def ? (
                    <span className={`item-${def.rarity}`}>{def.name}</span>
                  ) : (
                    <span className="text-sm text-muted">Vazio</span>
                  )}
                </div>
                {def && (
                  <button onClick={() => unequip(slot)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    Remover
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
