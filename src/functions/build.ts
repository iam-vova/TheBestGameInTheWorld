import { ROOM_CLASSES, SITES } from '@/data/rooms';
import { ROOM_IDS } from '@/data/rooms';
import type { GameState, RoomClass, RoomId } from '@/models/game';
import { hasGuests, makeBookings } from './bookings';

/** участки, на которых ещё можно строить */
export const freePlots = (s: GameState): RoomId[] => ROOM_IDS.filter((r) => SITES[r].buildable && !s.rooms[r].built);

/** стройка открывается после пристройки */
export const buildUnlocked = (s: GameState): boolean => s.rooms.annex.built;

export type BuildStatus = 'ok' | 'poor' | 'busy' | 'full';

export function buildStatus(s: GameState, cls: RoomClass): BuildStatus {
  if (!freePlots(s).length) return 'full';
  // как и улучшения: только пока в номерах никого нет
  if (hasGuests(s)) return 'busy';
  return s.coins >= ROOM_CLASSES[cls].price ? 'ok' : 'poor';
}

export const canBuildSomething = (s: GameState): boolean =>
  buildUnlocked(s) && (Object.keys(ROOM_CLASSES) as RoomClass[]).some((c) => buildStatus(s, c) === 'ok');

/** Строит домик выбранного класса на участке. Объявление обновляется само, если вечер ещё не начался. */
export function buildCabin(s: GameState, plot: RoomId, cls: RoomClass): { rebooked: boolean } | null {
  if (!buildUnlocked(s) || !freePlots(s).includes(plot) || buildStatus(s, cls) !== 'ok') return null;
  const info = ROOM_CLASSES[cls];
  s.coins -= info.price;
  Object.assign(s.rooms[plot], { built: true, cls, cap: info.cap, rate: info.rate, bed: 'bare' });
  s.ledger.push({ t: `Стройка: ${SITES[plot].name}, ${info.title.toLowerCase()}`, d: -info.price, b: s.coins });
  const rebooked = s.phase === 'arrive';
  if (rebooked) makeBookings(s);
  return { rebooked };
}
