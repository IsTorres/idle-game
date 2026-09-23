import type { Rarity, Stat } from '../../game/types';
import { getItemDefinition } from '../../game/items/itemDefinitions';
import { getItemStats } from '../../game/items/itemStats';

export const STAT_LABELS: Partial<Record<Stat, string>> = {
  maxHp: 'Vida Máx',
  maxMp: 'Mana Máx',
  regenHp: 'Regen HP',
  regenMp: 'Regen MP',
  physicalDefense: 'Def. Física',
  magicalDefense: 'Def. Mágica',
  physicalDamage: 'Dano Físico',
  magicalDamage: 'Dano Mágico',
};

// Mechanical only; precision/speed are flavor and stay hidden per design
const MECHANICAL_STATS: Stat[] = [
  'maxHp', 'maxMp', 'regenHp', 'regenMp',
  'physicalDefense', 'magicalDefense', 'physicalDamage', 'magicalDamage',
];

export function getItemRarity(itemId: string, rarity?: Rarity): Rarity {
  const def = getItemDefinition(itemId);
  return rarity ?? def?.rarity ?? 'common';
}

interface Props {
  itemId: string;
  rarity: Rarity;
  compareTo?: { itemId: string; rarity: Rarity };
}

export function ItemStats({ itemId, rarity, compareTo }: Props) {
  const def = getItemDefinition(itemId);
  if (!def || def.type !== 'equipment') return null;

  const stats = getItemStats(def, rarity);
  const compareStats = compareTo ? getItemStats(getItemDefinition(compareTo.itemId)!, compareTo.rarity) : null;

  const rows = MECHANICAL_STATS.filter((stat) => stats[stat]);

  return (
    <div className="item-stats text-xs">
      {rows.map((stat) => {
        const delta = compareStats ? (stats[stat] ?? 0) - (compareStats[stat] ?? 0) : null;
        return (
          <div key={stat} className="flex justify-between">
            <span className="text-muted">{STAT_LABELS[stat]}</span>
            <span className="stat-current">
              {stats[stat]}
              {delta !== null && delta !== 0 && (
                <span className={delta > 0 ? 'stat-up' : 'stat-down'}>
                  {' '}{delta > 0 ? '+' : ''}{delta}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}