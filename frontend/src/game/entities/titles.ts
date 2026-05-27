import type { Title } from '../types';

export const titles: Title[] = [
  { id: 'novato', name: 'Novato', experienceRequired: 0 },
  { id: 'aspirante', name: 'Aspirante', experienceRequired: 100 },
  { id: 'recruta', name: 'Recruta', experienceRequired: 300 },
  { id: 'explorador', name: 'Explorador', experienceRequired: 700 },
  { id: 'aventureiro', name: 'Aventureiro', experienceRequired: 1500 },
  { id: 'veterano', name: 'Veterano', experienceRequired: 3000 },
  { id: 'campeao', name: 'Campeão', experienceRequired: 6000 },
  { id: 'guardiao', name: 'Guardião', experienceRequired: 12000 },
  { id: 'heroi', name: 'Herói', experienceRequired: 24000 },
  { id: 'mestre_aventureiro', name: 'Mestre Aventureiro', experienceRequired: 50000 },
  { id: 'conquistador', name: 'Conquistador', experienceRequired: 100000 },
  { id: 'lorde_masmorras', name: 'Lorde das Masmorras', experienceRequired: 200000 },
  { id: 'mitico', name: 'Mítico', experienceRequired: 400000 },
  { id: 'ascendente', name: 'Ascendente', experienceRequired: 800000 },
  { id: 'lenda_viva', name: 'Lenda Viva', experienceRequired: 1600000 },
];

export function getTitle(experience: number): Title {
  let currentTitle = titles[0];
  for (const title of titles) {
    if (experience >= title.experienceRequired) {
      currentTitle = title;
    } else {
      break;
    }
  }
  return currentTitle;
}

export function getTitleById(id: string): Title | undefined {
  return titles.find((t) => t.id === id);
}
