import type { BedState, GameState, RoomId } from '@/models/game';
import { bookingWho, roomName } from './bookings';
import { freePlots } from './build';

export type TimeOfDay = 'day' | 'eve' | 'night' | 'morn';

export const timeOfDay = (s: GameState): TimeOfDay =>
  (({ ad: 'day', arrive: 'eve', night: 'night', morning: 'morn' }) as const)[s.phase];

const TIME_LABEL: Record<TimeOfDay, string> = { day: 'День', eve: 'Вечер', night: 'Ночь', morn: 'Утро' };

export const dayLabel = (s: GameState): string =>
  `День ${s.day + (s.phase === 'morning' ? 1 : 0)} · ${TIME_LABEL[timeOfDay(s)]}`;

export function goalText(s: GameState): string {
  const R = s.rooms;
  const B = s.bookings;
  if (s.phase === 'ad') {
    return R.home.bed === 'bare'
      ? `Застели ${R.home.cap === 1 ? 'диван' : 'постели'} и повесь объявление у дороги — в любом порядке.`
      : 'Номер готов. Повесь объявление у дороги.';
  }
  if (s.phase === 'arrive') {
    const waiting = B.filter((b) => b.stage === 'door' && R[b.room].bed !== 'made');
    if (waiting.length) {
      return `Гости ждут у входа. Осталось застелить: ${waiting.map((b) => roomName(b.room)).join(', ')}. Потом передай ключ.`;
    }
    if (s.kitchen && !s.dinnerReady) return 'Приготовь ужин на летней кухне — он уйдёт гостям вместе с ключом. Без ужина доплаты не будет.';
    if (B.some((b) => b.stage === 'door')) return 'Номер готов — передай ключ у двери.';
    return B.some((b) => R[b.room].bed !== 'made')
      ? 'Гости в пути. Застели постель до их прихода.'
      : 'Номер готов. Встреть гостей у двери и передай ключ.';
  }
  if (s.phase === 'night') return 'Ключи у гостей, двери закрыты. Наступает ночь…';
  return B.some((b) => b.stage === 'sleep')
    ? 'Пара в доме ещё спит, её номер закрыт. Убери пока освободившиеся номера.'
    : 'Ключ вернули. Забери оплату и сними бельё.';
}

export function bigGoal(s: GameState): string {
  if (s.rooms.home.cap === 1) return 'Большая цель: заработать на второе спальное место.';
  if (!s.rooms.annex.built) return 'Большая цель: заработать на одноместную пристройку.';
  const free = freePlots(s).length;
  if (free) return `Большая цель: застроить участки (свободно ${free}). Домики трёх классов — в меню «Стройка».`;
  return 'Все участки застроены. Дальше — улучшения номеров и свободная игра.';
}

const BED_TEXT: Record<BedState, string> = {
  made: 'готов к заселению',
  used: 'нужна уборка',
  bare: 'не застелен',
  wrecked: 'разгромлен после вечеринки',
};

export function roomStatus(s: GameState, id: RoomId): string {
  const bar = s.rooms[id].minibar ? ` · мини-бар ур. ${s.rooms[id].minibar}` : '';
  const bed = BED_TEXT[s.rooms[id].bed] + bar;
  const b = s.bookings.find((x) => x.room === id && x.stage !== 'left');
  if (!b) return `Свободен · ${bed}`;
  if (b.stage === 'sleep') return `Занят · ${bookingWho(b)} · ключ у гостей, дверь закрыта`;
  if (b.stage === 'door') return `${b.n === 2 ? 'Пара ждёт' : 'Гость ждёт'} у входа${b.late ? ' — заждались, будет скидка' : ''} · ${bed}`;
  return `Забронирован ${b.n === 2 ? 'парой' : 'гостем'} · ${bed}`;
}
