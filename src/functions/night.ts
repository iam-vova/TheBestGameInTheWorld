import { BALANCE } from '@/data/balance';
import type { Booking, GameState, Rng, RoomId } from '@/models/game';
import type { Bill } from '@/models/ui';
import { arrivingWho, bookingWho, makeBookings, roomName } from './bookings';

export function makeBed(s: GameState, r: RoomId): void {
  s.rooms[r].bed = 'made';
}

/** снять бельё */
export function clearBed(s: GameState, r: RoomId): void {
  s.rooms[r].bed = 'bare';
}

/** восстановить номер после вечеринки: стоит денег, но не больше, чем есть в кошельке */
export function repairRoom(s: GameState, r: RoomId): void {
  const cost = Math.min(s.coins, BALANCE.repairCost);
  if (cost) {
    s.coins -= cost;
    s.ledger.push({ t: `Ремонт после вечеринки, ${roomName(r)}`, d: -cost, b: s.coins });
  }
  s.rooms[r].bed = 'bare';
}

/**
 * Гость ждёт ключ у двери. Если ждёт дольше терпения — получит скидку. Первые две ночи обучающие, без штрафа.
 * Возвращает true в момент, когда терпение кончилось.
 */
export function waitAtDoor(s: GameState, b: Booking, waited: number): boolean {
  if (b.late || b.stage !== 'door' || s.day < BALANCE.eventsFromDay || waited < BALANCE.patience) return false;
  b.late = true;
  return true;
}

/** Ключ передаётся только в застеленный номер. */
export function canGiveKey(s: GameState, b: Booking): boolean {
  return b.stage === 'door' && s.rooms[b.room].bed === 'made';
}

/** Ужин готовится один раз на всех сегодняшних гостей. */
export function cookDinner(s: GameState): void {
  s.dinnerReady = true;
}

export function giveKey(s: GameState, b: Booking): void {
  b.stage = 'sleep';
  b.dinner = s.kitchen && s.dinnerReady;
  if (s.bookings.every((x) => x.stage === 'sleep')) s.phase = 'night';
}

/** Гости выезжают: бросаем случайное событие и возвращаем его описание для сообщения. */
export function checkOut(s: GameState, b: Booking, rng: Rng): string {
  if (b.cast && b.cast.length === 2) {
    b.ev = 'tip';
    b.tip = BALANCE.storyTip;
  } else if (s.day >= BALANCE.eventsFromDay && !b.cast) {
    const r = rng();
    const roll = BALANCE.eventRoll;
    if (r < roll.party) b.ev = 'party';
    else if (r < roll.tidy) b.ev = 'tidy';
    else if (r < roll.tip) {
      b.ev = 'tip';
      b.tip = BALANCE.tip;
    }
  }
  // мини-бар: одна проверка на бронирование за ночь, пара считается одним бронированием
  const barChance = BALANCE.minibar.chance[s.rooms[b.room].minibar] ?? 0;
  if (barChance > 0) b.bar = rng() < barChance;
  b.stage = 'left';
  s.rooms[b.room].bed = b.ev === 'party' ? 'wrecked' : b.ev === 'tidy' ? 'bare' : 'used';
  const room = roomName(b.room);
  if (b.ev === 'party') return ` Событие: в номере (${room}) ночью была вечеринка — он разгромлен.`;
  if (b.ev === 'tidy') return ` Событие: гости сами убрали за собой (${room}).`;
  if (b.ev === 'tip') return ` Событие: гости оставили чаевые (${room}).`;
  return '';
}

export interface MorningResult {
  left: Booking[];
  message: string;
}

/** Наступает утро. Если заняты оба номера, пара из дома выезжает позже — её номер пока закрыт. */
export function startMorning(s: GameState, rng: Rng): MorningResult {
  const story = s.story === 1;
  const late = s.bookings.length > 1 && !story;
  s.phase = 'morning';
  const left: Booking[] = [];
  let notes = '';
  for (const b of s.bookings) {
    if (late && b.room === 'home') continue;
    notes += checkOut(s, b, rng);
    left.push(b);
  }
  const head = story
    ? 'Утро. Анна и Марк вчера разговорились во дворе — и уезжают вместе.'
    : late
      ? 'Утро. Гости вернули ключи и уехали. Пара в доме ещё спит.'
      : 'Утро. Ключ вернули, плата лежит в комнате.';
  return { left, message: head + notes };
}

/** Оплату за выезд можно получить один раз. */
export function collectPayment(s: GameState, b: Booking): Bill | null {
  if (b.stage !== 'left' || b.paid) return null;
  const sum = s.rooms[b.room].rate;
  const tip = b.ev === 'tip' ? (b.tip ?? 0) : 0;
  const who = bookingWho(b);
  b.paid = true;
  s.coins += sum;
  s.ledger.push({ t: `Утро после ночи ${s.day}: ${who}, ${roomName(b.room)}`, d: sum, b: s.coins });
  const late = b.late ? -Math.round(sum * BALANCE.lateDiscount) : 0;
  const dinner = b.dinner ? BALANCE.dinnerFee * b.n : 0;
  const bar = b.bar ? BALANCE.minibar.sale : 0;
  // доплаты учитываются отдельными строками, отдельно от гарантированной платы за ночлег
  const extra = (label: string, d: number): void => {
    if (!d) return;
    s.coins += d;
    s.ledger.push({ t: `${label}, ${roomName(b.room)}`, d, b: s.coins });
  };
  extra('Скидка за ожидание у двери', late);
  extra('Событие: чаевые', tip);
  extra('Ужин', dinner);
  extra('Мини-бар', bar);
  return { room: b.room, who, sum, tip, dinner, bar, late, ev: b.ev, total: sum + tip + dinner + bar + late };
}

const isDone = (s: GameState, b: Booking): boolean =>
  b.stage === 'left' && b.paid && s.rooms[b.room].bed !== 'used' && s.rooms[b.room].bed !== 'wrecked';

export type MorningStep =
  | { type: 'none' }
  | { type: 'lateLeft'; booking: Booking; message: string }
  | { type: 'newDay'; message: string };

/** Вызывается после каждого шага утренней уборки: выпускает позднюю пару или начинает новый день. */
export function advanceMorning(s: GameState, rng: Rng): MorningStep {
  if (s.phase !== 'morning') return { type: 'none' };
  const late = s.bookings.find((b) => b.stage === 'sleep');
  if (late) {
    if (!s.bookings.every((b) => b === late || isDone(s, b))) return { type: 'none' };
    const note = checkOut(s, late, rng);
    return {
      type: 'lateLeft',
      booking: late,
      message: 'Пара проснулась, вернула ключ и уехала. Номер в доме снова можно открыть.' + note,
    };
  }
  if (!s.bookings.every((b) => isDone(s, b))) return { type: 'none' };
  let note = '';
  if (s.story === 1) {
    s.story = 2;
    s.storyDay = s.day + 1;
    note = ' Кажется, Анна и Марк ещё вернутся.';
  } else if (s.story === 3) {
    s.story = 4;
    note = ' История Анны и Марка: они познакомились у тебя и вернулись парой.';
  }
  if (s.helper) {
    const wage = Math.min(s.coins, BALANCE.helperWage);
    s.coins -= wage;
    s.ledger.push({ t: 'Смена помощника', d: -wage, b: s.coins });
  }
  s.day++;
  makeBookings(s);
  const message =
    s.story === 3
      ? 'Знакомые лица: Анна и Марк возвращаются — уже парой, в один номер.'
      : `Уборка закончена. По объявлению уже едут новые гости: ${arrivingWho(s)}.${note}`;
  return { type: 'newDay', message };
}
