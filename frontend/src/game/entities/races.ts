import type { Race } from '../types';

export const races: Race[] = [
  {
    id: 'human',
    name: 'Humano',
    description: 'Versátil e equilibrado, recebe pequenos bônus em todos os atributos.',
    statBonuses: {
      maxHp: 5,
      maxMp: 5,
      regenHp: 1,
      regenMp: 1,
      physicalDefense: 5,
      magicalDefense: 5,
      physicalDamage: 5,
      magicalDamage: 5,
      precision: 5,
      speed: 5,
    },
  },
  {
    id: 'elf',
    name: 'Elfo',
    description: 'Ágil e mágico, com afinidade arcana e reflexos apurados.',
    statBonuses: {
      maxHp: 0,
      maxMp: 15,
      regenHp: 0,
      regenMp: 3,
      physicalDefense: 2,
      magicalDefense: 8,
      physicalDamage: 2,
      magicalDamage: 8,
      precision: 8,
      speed: 10,
    },
  },
  {
    id: 'dwarf',
    name: 'Anão',
    description: 'Robusto e resiliente, com grande resistência física.',
    statBonuses: {
      maxHp: 15,
      maxMp: 0,
      regenHp: 3,
      regenMp: 0,
      physicalDefense: 10,
      magicalDefense: 2,
      physicalDamage: 8,
      magicalDamage: 0,
      precision: 3,
      speed: 0,
    },
  },
];

export function getRace(id: string): Race | undefined {
  return races.find((r) => r.id === id);
}
