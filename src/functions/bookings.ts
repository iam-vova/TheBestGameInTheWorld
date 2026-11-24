import { BALANCE } from '@/data/balance';
import { ROOM_IDS, SITES } from '@/data/rooms';
import { CAST_NAMES } from '@/data/sprites';
import type { Booking, GameState, RoomId } from '@/models/game';

export const roomName = (r: RoomId): string => SITES[r].name;

export const builtRooms = (s: GameState): RoomId[] => ROOM_IDS.filter((r) => s.rooms[r].built);

export const bookingWho = (b: Booking): string =>
  b.cast ? b.cast.map((n) => CAST_NAMES[n]).join(' и ') : b.n === 2 ? 'пара' : 'гость';

export const arrivingWho = (s: GameState): string => s.bookings.map(bookingWho).join(' и ');

/** номер закрыт для хозяина, пока ключ у гостей */
export const isLocked = (s: GameState, r: RoomId): boolean =>
  s.bookings.some((b) => b.room === r && b.stage === 'sleep');

export const hasGuests = (s: GameState): boolean => s.bookings.some((b) => b.stage === 'sleep');

export const findBooking = (s: GameState, r: RoomId): Booking | undefined => s.bookings.find((b) => b.room === r);

/**
 * Новый или изменившийся номер сразу попадает в сегодняшние брони, если вечер ещё идёт: остальные гости не трогаются.
 * Возвращает true, если бронь создана.
 */
export function bookRoom(s: GameState, r: RoomId): boolean {
  if (s.phase !== 'arrive' || isLocked(s, r)) return false;
  const booking: Booking = { id: r, room: r, n: s.rooms[r].cap, stage: 'coming', paid: false };
  const i = s.bookings.findIndex((b) => b.room === r);
  if (i >= 0) s.bookings[i] = booking;
  else s.bookings.push(booking);
  return true;
}

/** Объявление работает само: на каждый вечер по одному бронированию на построенный номер. */
export function makeBookings(s: GameState): void {
  s.bookings = builtRooms(s).map((r) => ({ id: r, room: r, n: s.rooms[r].cap, stage: 'coming', paid: false }));
  const home = findBooking(s, 'home');
  const annex = findBooking(s, 'annex');
  if (home && annex) {
    if (s.story === 0 && s.day >= BALANCE.storyFromDay) {
      home.n = 1;
      home.cast = ['anna'];
      annex.cast = ['mark'];
      s.story = 1;
    } else if (s.story === 2 && s.day > s.storyDay) {
      home.cast = ['anna', 'mark'];
      s.story = 3;
    }
  }
  s.posted = true;
  s.dinnerReady = false;
  s.phase = 'arrive';
}
