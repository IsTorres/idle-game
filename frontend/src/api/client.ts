const API_BASE = '/api';

export interface SaveData {
  hp: number;
  mp: number;
  gold: number;
  experience: number;
  title: string;
  currentDungeonId: string | null;
  deathPenaltyUntil: string | null;
  inventory: { itemId: string; quantity: number }[];
  equipment: { slot: string; itemId: string }[];
  recipes: { recipeId: string }[];
}

export const apiClient = {
  async createPlayer(data: {
    id: string;
    name: string;
    race: string;
    class: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    baseStats: string;
  }) {
    const res = await fetch(`${API_BASE}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getPlayer(id: string) {
    const res = await fetch(`${API_BASE}/players/${id}`);
    if (res.status === 404) return null;
    return res.json();
  },

  async savePlayer(id: string, data: SaveData) {
    const res = await fetch(`${API_BASE}/save/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
