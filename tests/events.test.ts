import { describe, expect, it } from 'vitest';
import { makeBookings } from '@/functions/bookings';
import { checkOut } from '@/functions/night';
import { createState } from '@/functions/state';
import { buyUpgrade } from '@/functions/upgrades';
import { playNight } from './helpers';

/** отель после двух ночей: два номера, идёт третья ночь */
function thirdNight() {
  const s = createState();
  makeBookings(s);
  playNight(s);
  buyUpgrade(s, 'bed');
  playNight(s);
  buyUpgrade(s, 'annex');
  return s;
}

describe('случайные события', () => {
  it('в первые две ночи событий нет при любом броске', () => {
    const s = createState();
    makeBookings(s);
    checkOut(s, s.bookings[0], () => 0);
    expect(s.bookings[0].ev).toBeUndefined();
    expect(s.rooms.home.bed).toBe('used');
  });

  it('вечеринка громит номер, уборка гостями снимает бельё, чаевые добавляют 10', () => {
    const s = thirdNight();
    const [home, annex] = s.bookings;
    checkOut(s, home, () => 0.05);
    expect(home.ev).toBe('party');
    expect(s.rooms.home.bed).toBe('wrecked');
    checkOut(s, annex, () => 0.2);
    expect(annex.ev).toBe('tidy');
    expect(s.rooms.annex.bed).toBe('bare');

    const t = thirdNight();
    playNight(t, () => 0.3);
    expect(t.coins).toBe(80 + 20);
    expect(t.ledger.filter((l) => l.t.startsWith('Событие: чаевые'))).toHaveLength(2);
  });
});

describe('история Анны и Марка', () => {
  it('приезжают порознь, возвращаются парой и оставляют 20 чаевых', () => {
    const s = thirdNight();
    playNight(s); // ночь 3
    expect(s.day).toBe(4);
    expect(s.bookings.map((b) => b.cast)).toEqual([['anna'], ['mark']]);
    playNight(s); // ночь 4: уезжают вместе
    expect(s.story).toBe(2);
    playNight(s); // ночь 5: обычные гости
    expect(s.bookings[0].cast).toEqual(['anna', 'mark']);
    const before = s.coins;
    playNight(s); // ночь 6: вернулись парой
    expect(s.story).toBe(4);
    expect(s.coins).toBe(before + 50 + 20 + 30);
  });
});
