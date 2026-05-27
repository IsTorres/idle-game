import type { Class } from '../types';

export const classes: Class[] = [
  {
    id: 'warrior',
    name: 'Guerreiro',
    description: 'Mestre do combate corpo a corpo, alta resistência e dano físico.',
    baseStats: {
      maxHp: 100,
      maxMp: 20,
      regenHp: 2,
      regenMp: 1,
      physicalDefense: 15,
      magicalDefense: 5,
      physicalDamage: 12,
      magicalDamage: 2,
      precision: 10,
      speed: 8,
    },
    statBonuses: {
      maxHp: 10,
      physicalDamage: 3,
      physicalDefense: 3,
    },
  },
  {
    id: 'mage',
    name: 'Mago',
    description: 'Manipula energias arcanas, causando imenso dano mágico.',
    baseStats: {
      maxHp: 40,
      maxMp: 100,
      regenHp: 1,
      regenMp: 5,
      physicalDefense: 3,
      magicalDefense: 10,
      physicalDamage: 2,
      magicalDamage: 15,
      precision: 12,
      speed: 6,
    },
    statBonuses: {
      maxMp: 10,
      magicalDamage: 3,
      magicalDefense: 2,
      regenMp: 1,
    },
  },
  {
    id: 'archer',
    name: 'Arqueiro',
    description: 'Atirador preciso e veloz, ataca à distância com pontaria mortal.',
    baseStats: {
      maxHp: 60,
      maxMp: 40,
      regenHp: 2,
      regenMp: 2,
      physicalDefense: 7,
      magicalDefense: 7,
      physicalDamage: 10,
      magicalDamage: 0,
      precision: 20,
      speed: 15,
    },
    statBonuses: {
      precision: 5,
      speed: 3,
      physicalDamage: 2,
    },
  },
];

export function getClass(id: string): Class | undefined {
  return classes.find((c) => c.id === id);
}
