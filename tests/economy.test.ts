import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/balance';
import { CLASS_IDS, ROOM_CLASSES } from '@/data/rooms';
import { UPGRADES } from '@/data/upgrades';
import { builtRooms, makeBookings } from '@/functions/bookings';
import { buildCabin, freePlots } from '@/functions/build';
import { repairRoom } from '@/functions/night';
import { createState } from '@/functions/state';
import { buyUpgrade, upgradeStatus } from '@/functions/upgrades';
import type { GameState } from '@/models/game';
import { playNight } from './helpers';

/** детерминированный генератор для прогонов */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a * 1664525 + 1013904223) % 4294967296;
    return a / 4294967296;
  };
}

function hotel(coins: number): GameState {
  const s = createState();
  makeBookings(s);
  playNight(s);
  buyUpgrade(s, 'bed');
  playNight(s);
  buyUpgrade(s, 'annex');
  s.coins = coins;
  return s;
}

describe('стройка домиков', () => {
  it('домик выбранного класса встаёт на участок и принимает гостей в тот же вечер', () => {
    const s = hotel(1000);
    expect(freePlots(s)).toEqual(['cabin1', 'cabin2']);
    expect(buildCabin(s, 'cabin1', 'standard')).toEqual({ rebooked: true });
    expect(s.coins).toBe(1000 - 300);
    expect(s.rooms.cabin1).toMatchObject({ built: true, cls: 'standard', cap: 2, rate: 55 });
    expect(s.bookings.map((b) => [b.room, b.n])).toEqual([['home', 2], ['annex', 1], ['cabin1', 2]]);
    expect(buildCabin(s, 'cabin1', 'economy')).toBeNull(); // участок занят
    buildCabin(s, 'cabin2', 'premium');
    expect(freePlots(s)).toEqual([]);
    playNight(s);
    expect(s.coins).toBe(1000 - 300 - 500 + 50 + 30 + 55 + 90);
  });

  it('до пристройки и при заселённых номерах строить нельзя', () => {
    const early = createState();
    early.coins = 500;
    expect(buildCabin(early, 'cabin1', 'economy')).toBeNull();
    const s = hotel(500);
    s.bookings[0].stage = 'sleep';
    expect(buildCabin(s, 'cabin1', 'economy')).toBeNull();
  });
});

describe('расходы', () => {
  it('помощник получает за смену, ремонт после вечеринки стоит денег', () => {
    const s = hotel(400);
    buyUpgrade(s, 'helper');
    const before = s.coins;
    playNight(s);
    expect(s.coins).toBe(before + 80 - BALANCE.helperWage);
    expect(s.ledger.some((l) => l.t === 'Смена помощника' && l.d === -BALANCE.helperWage)).toBe(true);

    s.rooms.annex.bed = 'wrecked';
    const c = s.coins;
    repairRoom(s, 'annex');
    expect(s.coins).toBe(c - BALANCE.repairCost);
    s.coins = 4;
    s.rooms.annex.bed = 'wrecked';
    repairRoom(s, 'annex');
    expect(s.coins).toBe(0); // в минус не уходим
  });
});

describe('математика: сроки окупаемости', () => {
  it('домики окупаются за 5–6 занятых ночей', () => {
    const payback = CLASS_IDS.map((c) => ROOM_CLASSES[c].price / ROOM_CLASSES[c].rate);
    for (const p of payback) expect(p).toBeGreaterThanOrEqual(5), expect(p).toBeLessThanOrEqual(6);
  });

  it('кухня окупается за 3–5 ночей в застроенном отеле на семь гостей', () => {
    const kitchen = UPGRADES.find((u) => u.id === 'kitchen')!.price(createState());
    const p = kitchen / (BALANCE.dinnerFee * 7);
    expect(p).toBeGreaterThanOrEqual(3);
    expect(p).toBeLessThanOrEqual(5);
  });

  it('каждый уровень мини-бара окупается за 8–20 ночей', () => {
    const { chance, price, sale } = BALANCE.minibar;
    price.forEach((cost, lvl) => {
      const p = cost / ((chance[lvl + 1] - chance[lvl]) * sale);
      expect(p).toBeGreaterThanOrEqual(8);
      expect(p).toBeLessThanOrEqual(20);
    });
  });

  it('смена помощника — не больше 15 % выручки отеля с двумя номерами', () => {
    expect(BALANCE.helperWage / 80).toBeLessThanOrEqual(0.15);
  });
});

describe('математика: прогон целой игры', () => {
  /** жадный игрок: каждое утро покупает самое дешёвое из доступного */
  function run(seed: number) {
    const rng = seeded(seed);
    const s = createState();
    makeBookings(s);
    const log: string[] = [];
    for (let night = 1; night <= 60; night++) {
      playNight(s, rng);
      for (let guard = 0; guard < 20; guard++) {
        const ups = UPGRADES.filter((u) => upgradeStatus(s, u) === 'ok').sort((a, b) => a.price(s) - b.price(s));
        const plot = s.rooms.annex.built ? freePlots(s)[0] : undefined;
        // на участки ставим стандарт: эконом дешевле, но занимает землю навсегда
        if (plot && s.coins >= ROOM_CLASSES.standard.price && buildCabin(s, plot, 'standard')) log.push(`${night}: ${plot}`);
        else if (ups[0] && !(plot && ups[0].id.startsWith('minibar'))) {
          buyUpgrade(s, ups[0].id);
          log.push(`${night}: ${ups[0].id}`);
        } else if (ups[0] && !plot) {
          buyUpgrade(s, ups[0].id);
          log.push(`${night}: ${ups[0].id}`);
        } else break;
      }
      const left = UPGRADES.some((u) => !['done', 'hidden'].includes(upgradeStatus(s, u))) || freePlots(s).length > 0;
      if (!left) return { nights: night, log, state: s };
    }
    return { nights: 61, log, state: s };
  }

  it('всё покупается за 12–25 ночей, первые две ночи проходят по тестовому балансу', () => {
    const results = [1, 2, 3, 4, 5].map(run);
    console.log(results[0].log.join(' | '));
    console.log('ночей до полной застройки:', results.map((r) => r.nights).join(', '));
    for (const r of results) {
      expect(r.log.slice(0, 2)).toEqual(['1: bed', '2: annex']);
      expect(r.nights).toBeGreaterThanOrEqual(12);
      expect(r.nights).toBeLessThanOrEqual(25);
      expect(builtRooms(r.state)).toHaveLength(4);
    }
  });
});
