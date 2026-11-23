import { describe, expect, it } from 'vitest';
import { makeBookings } from '@/functions/bookings';
import { collectPayment, giveKey, canGiveKey, startMorning } from '@/functions/night';
import { createState } from '@/functions/state';
import { getTasks } from '@/functions/tasks';
import { buyUpgrade, upgradeStatus } from '@/functions/upgrades';
import { UPGRADES } from '@/data/upgrades';
import { playNight } from './helpers';

const start = () => {
  const s = createState();
  makeBookings(s);
  return s;
};

describe('тестовый баланс первых двух ночей', () => {
  it('0 → 30 → 0 → 50 → 0, в итоге два номера на трёх человек', () => {
    const s = start();
    playNight(s);
    expect(s.coins).toBe(30);
    expect(buyUpgrade(s, 'bed')).not.toBeNull();
    expect(s.coins).toBe(0);
    expect(s.bookings.map((b) => b.n)).toEqual([2]);

    playNight(s);
    expect(s.coins).toBe(50);
    buyUpgrade(s, 'annex');
    expect(s.coins).toBe(0);
    expect(s.won).toBe(true);
    expect(s.bookings.reduce((n, b) => n + b.n, 0)).toBe(3);

    playNight(s);
    expect(s.coins).toBe(80);
  });

  it('пристройку нельзя купить раньше второго места и пока гости в номерах', () => {
    const s = start();
    s.coins = 100;
    const annex = UPGRADES.find((u) => u.id === 'annex')!;
    expect(upgradeStatus(s, annex)).toBe('need');
    buyUpgrade(s, 'bed');
    s.bookings[0].stage = 'sleep';
    expect(upgradeStatus(s, annex)).toBe('busy');
    expect(buyUpgrade(s, 'annex')).toBeNull();
  });
});

describe('ключ и оплата', () => {
  it('утром освободившийся номер можно сразу застелить заново', () => {
    const s = start();
    playNight(s);
    buyUpgrade(s, 'bed');
    playNight(s);
    buyUpgrade(s, 'annex');
    for (const b of s.bookings) {
      b.stage = 'door';
      s.rooms[b.room].bed = 'made';
      giveKey(s, b);
    }
    startMorning(s, () => 0.99); // гость из пристройки уехал, пара ещё спит
    const bedTasks = () => getTasks(s).filter((t) => t.room === 'annex').map((t) => t.kind);
    expect(bedTasks()).toEqual(['collect', 'strip']);
    s.rooms.annex.bed = 'bare';
    expect(bedTasks()).toEqual(['makeBed', 'collect']);
    expect(getTasks(s).some((t) => t.room === 'home')).toBe(false);
  });

  it('ключ передаётся только в застеленный номер', () => {
    const s = start();
    const b = s.bookings[0];
    b.stage = 'door';
    expect(canGiveKey(s, b)).toBe(false);
    expect(getTasks(s).map((t) => t.kind)).toEqual(['makeBed']);
    s.rooms.home.bed = 'made';
    expect(getTasks(s).map((t) => t.kind)).toEqual(['giveKey']);
  });

  it('оплату за выезд можно получить один раз', () => {
    const s = start();
    const b = s.bookings[0];
    b.stage = 'door';
    s.rooms.home.bed = 'made';
    giveKey(s, b);
    expect(s.phase).toBe('night');
    startMorning(s, () => 0.99);
    expect(collectPayment(s, b)?.total).toBe(30);
    expect(collectPayment(s, b)).toBeNull();
    expect(s.coins).toBe(30);
  });
});
