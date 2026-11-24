import { describe, expect, it } from 'vitest';
import { makeBookings } from '@/functions/bookings';
import { createHelper, routeTo, stepHelper } from '@/functions/helper';
import { checkOut, collectPayment, cookDinner, giveKey, startMorning, waitAtDoor } from '@/functions/night';
import { createState } from '@/functions/state';
import { getTasks } from '@/functions/tasks';
import { buyUpgrade } from '@/functions/upgrades';
import { playNight } from './helpers';

/** отель с двумя номерами и запасом монет, вечер перед заселением */
function hotel(coins = 500) {
  const s = createState();
  makeBookings(s);
  playNight(s);
  buyUpgrade(s, 'bed');
  playNight(s);
  buyUpgrade(s, 'annex');
  s.coins = coins;
  return s;
}

describe('кухня и ужины', () => {
  it('ужин уходит вместе с ключом и оплачивается отдельной строкой: 10 монет с гостя', () => {
    const s = hotel();
    buyUpgrade(s, 'kitchen');
    expect(getTasks(s).map((t) => t.kind)).toContain('cook');
    cookDinner(s);
    expect(getTasks(s).some((t) => t.kind === 'cook')).toBe(false);
    for (const b of s.bookings) {
      b.stage = 'door';
      s.rooms[b.room].bed = 'made';
      giveKey(s, b);
    }
    s.story = 1; // оба выезжают одновременно
    startMorning(s, () => 0.99);
    const [home, annex] = s.bookings.map((b) => collectPayment(s, b)!);
    expect([home.dinner, annex.dinner]).toEqual([20, 10]);
    expect(home.total).toBe(70);
    expect(s.ledger.filter((l) => l.t.startsWith('Ужин'))).toHaveLength(2);
  });

  it('без приготовленного ужина доплаты нет, а на следующий вечер готовить нужно заново', () => {
    const s = hotel();
    buyUpgrade(s, 'kitchen');
    const b = s.bookings[0];
    b.stage = 'door';
    s.rooms.home.bed = 'made';
    giveKey(s, b);
    expect(b.dinner).toBe(false);
    cookDinner(s);
    makeBookings(s);
    expect(s.dinnerReady).toBe(false);
  });
});

describe('мини-бар', () => {
  it('уровни 20 / 35 / 50 %, цена и шанс видны до покупки', () => {
    const s = hotel();
    expect(buyUpgrade(s, 'minibar_home')).not.toBeNull();
    expect(s.coins).toBe(480);
    buyUpgrade(s, 'minibar_home');
    buyUpgrade(s, 'minibar_home');
    expect(s.rooms.home.minibar).toBe(3);
    expect(buyUpgrade(s, 'minibar_home')).toBeNull();
    expect(s.rooms.annex.minibar).toBe(0);
  });

  it('заданные исходы: покупка добавляет 10 монет отдельной строкой, без покупки итог не меняется', () => {
    const s = hotel();
    buyUpgrade(s, 'minibar_home');
    const [home, annex] = s.bookings;
    const rolls = [0.99, 0.1]; // событие ночи не выпало, мини-бар сработал
    checkOut(s, home, () => rolls.shift()!);
    expect(home.bar).toBe(true);
    expect(collectPayment(s, home)).toMatchObject({ sum: 50, bar: 10, total: 60 });

    checkOut(s, annex, () => 0.99); // в пристройке мини-бара нет — бросок не тратится
    expect(annex.bar).toBeUndefined();
    expect(collectPayment(s, annex)!.total).toBe(30);

    const t = hotel();
    buyUpgrade(t, 'minibar_home');
    const quiet = [0.99, 0.5];
    checkOut(t, t.bookings[0], () => quiet.shift()!);
    expect(collectPayment(t, t.bookings[0])!.total).toBe(50);
  });
});

describe('помощник', () => {
  it('берёт постели, уборку и кухню, но не ключи и не оплату', () => {
    const s = hotel();
    buyUpgrade(s, 'helper');
    buyUpgrade(s, 'kitchen');
    const h = createHelper();
    expect(stepHelper(h, getTasks(s), 0.1)).toBeNull();
    // сначала постели — без них гостей не заселить, потом кухня
    expect(h.job?.kind).toBe('makeBed');
    s.rooms.home.bed = 'made';
    s.rooms.annex.bed = 'made';
    stepHelper(h, getTasks(s), 0.1);
    stepHelper(h, getTasks(s), 0.1);
    expect(h.job?.kind).toBe('cook');

    for (const b of s.bookings) b.stage = 'door';
    s.rooms.home.bed = 'made';
    s.rooms.annex.bed = 'made';
    s.dinnerReady = true;
    const idle = createHelper();
    stepHelper(idle, getTasks(s), 0.1);
    expect(getTasks(s).map((t) => t.kind)).toEqual(['giveKey', 'giveKey']);
    expect(idle.job).toBeNull();
  });

  it('бросает задачу, если хозяин сделал её сам, и доводит работу до конца, если нет', () => {
    const s = hotel();
    const h = createHelper();
    stepHelper(h, getTasks(s), 0.1);
    expect(h.job).toMatchObject({ kind: 'makeBed', room: 'home' });
    s.rooms.home.bed = 'made';
    stepHelper(h, getTasks(s), 0.1);
    expect(h.job).toBeNull();

    stepHelper(h, getTasks(s), 0.1); // берёт пристройку
    h.path = []; // дошёл
    expect(stepHelper(h, getTasks(s), 5)).toMatchObject({ kind: 'makeBed', room: 'annex' });
  });

  it('из комнаты идёт через коврик на улицу и в нужную дверь', () => {
    const h = createHelper();
    h.scene = 'home';
    const path = routeTo(h, 'annex', 1, 1);
    expect(path.filter((p) => 'warp' in p).map((p) => ('warp' in p ? p.warp : ''))).toEqual(['out', 'annex']);
  });
});

describe('терпение гостей', () => {
  it('кто ждал ключ дольше 20 секунд, получает скидку 20 % от платы за ночь', () => {
    const s = hotel();
    const [home] = s.bookings;
    home.stage = 'door';
    expect(waitAtDoor(s, home, 19)).toBe(false);
    expect(waitAtDoor(s, home, 21)).toBe(true);
    expect(waitAtDoor(s, home, 30)).toBe(false); // срабатывает один раз
    s.rooms.home.bed = 'made';
    giveKey(s, home);
    checkOut(s, home, () => 0.99);
    expect(collectPayment(s, home)).toMatchObject({ sum: 50, late: -10, total: 40 });
    expect(s.ledger.at(-1)).toMatchObject({ d: -10 });
  });

  it('в первые две ночи ожидание не штрафуется', () => {
    const s = createState();
    makeBookings(s);
    s.bookings[0].stage = 'door';
    expect(waitAtDoor(s, s.bookings[0], 100)).toBe(false);
  });
});

describe('покупки при гостях', () => {
  it('помощника, кухню и мини-бар свободного номера можно купить, пока в другом номере гости', () => {
    const s = hotel();
    s.bookings[0].stage = 'sleep'; // гости в доме
    expect(buyUpgrade(s, 'helper')).not.toBeNull();
    expect(buyUpgrade(s, 'kitchen')).not.toBeNull();
    expect(buyUpgrade(s, 'minibar_annex')).not.toBeNull();
    expect(buyUpgrade(s, 'minibar_home')).toBeNull(); // в доме гости — мини-бар подождёт выезда
  });
});
