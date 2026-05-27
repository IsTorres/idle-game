import { useGameStore } from '../../store/gameStore';
import { getItemDefinition } from '../../game/items/itemDefinitions';
import { canCraft } from '../../game/crafting/recipes';

export function CraftingPanel() {
  const player = useGameStore((s) => s.player);
  const craft = useGameStore((s) => s.craft);

  if (!player) return null;

  const unlockedRecipeDefs = player.unlockedRecipes
    .map((id) => getItemDefinition(id))
    .filter((d): d is NonNullable<typeof d> => d !== undefined);

  return (
    <div className="card">
      <h3 className="mb-2">Crafting</h3>
      <div className="flex flex-col gap-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
        {unlockedRecipeDefs.length === 0 && (
          <div className="text-sm text-muted">
            Nenhuma receita descoberta. Derrote monstros para encontrar receitas!
          </div>
        )}
        {unlockedRecipeDefs.map((recipe) => {
          const craftable = canCraft(player, recipe.id);
          const resultDef = recipe.resultItemId ? getItemDefinition(recipe.resultItemId) : null;

          return (
            <div key={recipe.id} className="card" style={{ padding: 8 }}>
              <div className="flex justify-between items-center mb-2">
                <span className={`item-${recipe.rarity} text-sm`}>{recipe.name}</span>
                <button
                  onClick={() => craft(recipe.id)}
                  disabled={!craftable}
                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  Craftar
                </button>
              </div>
              <div className="text-xs text-muted">
                {resultDef ? `→ ${resultDef.name}` : ''}
              </div>
              <div className="text-xs text-muted">
                {recipe.ingredients?.map((ing) => {
                  const ingDef = getItemDefinition(ing.itemId);
                  const have = player.inventory.find((inv) => inv.itemId === ing.itemId)?.quantity ?? 0;
                  return (
                    <span key={ing.itemId} style={{ marginRight: 8 }}>
                      {ingDef?.name ?? ing.itemId}: {have}/{ing.quantity}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
