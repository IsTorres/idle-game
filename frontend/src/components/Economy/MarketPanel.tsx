import { useGameStore } from '../../store/gameStore';
import { getShopOfferings } from '../../game/economy/shop';
import { getItemDefinition } from '../../game/items/itemDefinitions';
import { ItemStats, getItemRarity } from '../common/ItemStats';

export function MarketPanel() {
  const player = useGameStore((s) => s.player);
  const buyItem = useGameStore((s) => s.buyItem);

  if (!player) return null;
  const offerings = getShopOfferings(player);

  return (
    <div className="card">
      <h3 className="mb-2">Mercado</h3>
      <div className="market-list">
        {offerings.length === 0 && <div className="text-sm text-muted">O mercado está vazio.</div>}
        {offerings.map((offering) => {
          const def = getItemDefinition(offering.itemId);
          if (!def) return null;
          const rarity = getItemRarity(offering.itemId, offering.rarity);
          const affordable = player.gold >= offering.price;
          return (
            <div key={offering.itemId} className="market-row">
              <div className="flex justify-between items-center mb-1">
                <span className={`item-${rarity} text-sm`}>{def.name}</span>
                <span className={`text-sm ${affordable ? 'text-gold' : 'text-muted'}`}>{offering.price} gold</span>
              </div>
              {def.type === 'equipment' && <ItemStats itemId={offering.itemId} rarity={rarity} />}
              {def.type === 'consumable' && <div className="text-xs text-muted">{def.description}</div>}
              <button
                onClick={() => buyItem(offering.itemId)}
                disabled={!affordable}
                className="market-buy"
              >
                {affordable ? 'Comprar' : `Faltam ${offering.price - player.gold} gold`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}