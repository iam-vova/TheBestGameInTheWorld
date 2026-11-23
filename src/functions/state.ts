import { DEFAULT_AD, SAVE_KEY } from '@/data/balance';
import type { GameState } from '@/models/game';

export function createState(): GameState {
  return {
    coins: 0,
    day: 1,
    phase: 'ad',
    adText: DEFAULT_AD,
    posted: false,
    rooms: {
      home: { built: true, cap: 1, rate: 30, bed: 'bare', minibar: 0 },
      annex: { built: false, cap: 1, rate: 30, bed: 'bare', minibar: 0 },
    },
    bookings: [],
    won: false,
    helper: false,
    kitchen: false,
    dinnerReady: false,
    story: 0,
    storyDay: 0,
    scene: 'out',
    ledger: [{ t: 'Начало игры', d: 0, b: 0 }],
  };
}

export function loadState(): GameState | null {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
    if (s && s.phase && s.rooms) return s as GameState;
  } catch {
    // хранилище недоступно или сохранение битое — начинаем заново
  }
  return null;
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // без сохранения игра всё равно работает
  }
}
