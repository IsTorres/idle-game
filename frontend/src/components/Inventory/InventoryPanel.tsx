import { useGameStore } from '../../store/gameStore';
import { getItemDefinition } from '../../game/items/itemDefinitions';

export function InventoryPanel() {
  const player = useGameStore((s) => s.player);
  const equip = useGameStore((s) => s.equip);

  if (!player) return null;

  const items = player.inventory.map((inv) => ({
    ...inv,
    def: getItemDefinition(inv.itemId),
  }));

  return (
    <div className="card">
      <h3 className="mb-2">Inventário ({items.length})</h3>
      <div className="flex flex-col gap-1" style={{ maxHeight: 300, overflowY: 'auto' }}>
        {items.length === 0 && (
          <div className="text-sm text-muted">Inventário vazio.</div>
        )}
        {items.map((inv) => {
          if (!inv.def) return null;
          return (
            <div key={inv.id} className="card" style={{ padding: 8 }}>
              <div className="flex justify-between items-center">
                <div>
                  <span className={`item-${inv.def.rarity} text-sm`}>
                    {inv.def.name}
                  </span>
                  {inv.quantity > 1 && (
                    <span className="text-muted text-sm"> x{inv.quantity}</span>
                  )}
                  <div className="text-xs text-muted">
                    {inv.def.type === 'equipment' ? inv.def.slot : inv.def.type}
                  </div>
                </div>
                {inv.def.type === 'equipment' && (
                  <button
                    onClick={() => equip(inv.id)}
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    Equipar
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
