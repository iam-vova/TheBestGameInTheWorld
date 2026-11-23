import { BALANCE } from '@/data/balance';
import { CAST_NAMES } from '@/data/sprites';
import type { Booking, GameState, RoomId } from '@/models/game';

export const ROOM_IDS: RoomId[] = ['home', 'annex'];

export const roomName = (r: RoomId): string => (r === 'home' ? 'номер в доме' : 'пристройка');

export const bookingWho = (b: Booking): string =>
  b.cast ? b.cast.map((n) => CAST_NAMES[n]).join(' и ') : b.n === 2 ? 'пара' : 'гость';

export const arrivingWho = (s: GameState): string => s.bookings.map(bookingWho).join(' и ');

/** номер закрыт для хозяина, пока ключ у гостей */
export const isLocked = (s: GameState, r: RoomId): boolean =>
  s.bookings.some((b) => b.room === r && b.stage === 'sleep');

export const hasGuests = (s: GameState): boolean => s.bookings.some((b) => b.stage === 'sleep');

export const findBooking = (s: GameState, r: RoomId): Booking | undefined => s.bookings.find((b) => b.room === r);

/** Объявление работает само: на каждый вечер по одному бронированию на построенный номер. */
export function makeBookings(s: GameState): void {
  const home: Booking = { id: 'home', room: 'home', n: s.rooms.home.cap, stage: 'coming', paid: false };
  s.bookings = [home];
  if (s.rooms.annex.built) {
    const annex: Booking = { id: 'annex', room: 'annex', n: 1, stage: 'coming', paid: false };
    s.bookings.push(annex);
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
