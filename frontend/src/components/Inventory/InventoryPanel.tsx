import { useGameStore } from '../../store/gameStore';
import { getItemDefinition } from '../../game/items/itemDefinitions';
import { ItemStats, getItemRarity } from '../common/ItemStats';

export function InventoryPanel() {
  const player = useGameStore((s) => s.player);
  const equip = useGameStore((s) => s.equip);
  const useItem = useGameStore((s) => s.useItem);

  if (!player) return null;

  const items = player.inventory.map((inv) => ({
    ...inv,
    def: getItemDefinition(inv.itemId),
  }));

  return (
    <div className="card">
      <h3 className="mb-2">Inventário ({items.length})</h3>
      <div className="flex flex-col gap-1" style={{ maxHeight: 320, overflowY: 'auto' }}>
        {items.length === 0 && (
          <div className="text-sm text-muted">Inventário vazio.</div>
        )}
        {items.map((inv) => {
          const def = inv.def;
          if (!def) return null;
          const rarity = getItemRarity(inv.itemId, def.type === 'equipment' ? inv.rarity : undefined);
          const equipped =
            def.type === 'equipment'
              ? player.equipment.find((e) => e.slot === def.slot)
              : null;

          return (
            <div key={inv.id} className="card" style={{ padding: 8 }}>
              <div className="flex justify-between items-center">
                <div>
                  <span className={`item-${rarity} text-sm`}>{def.name}</span>
                  {inv.quantity > 1 && <span className="text-muted text-sm"> x{inv.quantity}</span>}
                  <div className="text-xs text-muted">
                    {def.type === 'equipment' ? def.slot : def.type}
                  </div>
                </div>
                {def.type === 'equipment' && (
                  <button onClick={() => equip(inv.id)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    Equipar
                  </button>
                )}
                {def.type === 'consumable' && (
                  <button onClick={() => useItem(inv.id)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                    Usar
                  </button>
                )}
              </div>
              {def.type === 'equipment' && (
                <ItemStats
                  itemId={def.id}
                  rarity={rarity}
                  compareTo={
                    equipped
                      ? { itemId: equipped.itemId, rarity: equipped.rarity ?? getItemRarity(equipped.itemId) }
                      : undefined
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}