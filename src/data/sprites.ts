import type { CastId } from '@/models/game';

/** assets/chars.png: на персонажа блок из 8 рядов (направления), колонка 0 — стойка, дальше f кадров ходьбы. Кадр 48px. */
export const CHAR_FRAME = 48;
export const CHARS: Record<string, { i: number; f: number }> = {
  host: { i: 0, f: 6 },
  guestA: { i: 1, f: 6 },
  guestB: { i: 2, f: 6 },
  guestC: { i: 3, f: 6 },
  anna: { i: 4, f: 6 },
  mark: { i: 5, f: 6 },
  helper: { i: 6, f: 6 },
  friend1: { i: 7, f: 6 },
  friend2: { i: 8, f: 6 },
  friend3: { i: 9, f: 6 },
  writer: { i: 10, f: 6 },
  dog_owner: { i: 11, f: 6 },
  star: { i: 12, f: 6 },
};

/** индекс октанта экранного угла → ряд направления в атласе (ряды: S, SE, E, NE, N, NW, W, SW) */
export const DIR_ROW = [2, 1, 0, 7, 6, 5, 4, 3];

/** обычные гости выбираются из этого набора по дню и номеру */
export const GUEST_SPRITES = ['guestA', 'guestB', 'guestC', 'friend1', 'writer', 'friend2', 'dog_owner', 'friend3', 'star'];
export const CAST_NAMES: Record<CastId, string> = { anna: 'Анна', mark: 'Марк' };
