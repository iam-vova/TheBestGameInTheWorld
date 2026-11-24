import { UPGRADES, type Upgrade, type UpgradeId } from '@/data/upgrades';
import type { GameState, RoomId } from '@/models/game';
import type { UpgradeStatus } from '@/models/ui';
import { bookRoom, isLocked } from './bookings';

export function upgradeStatus(s: GameState, u: Upgrade): UpgradeStatus {
  if (u.room && !s.rooms[u.room].built) return 'hidden';
  if (u.done(s)) return 'done';
  const need = u.need && UPGRADES.find((x) => x.id === u.need);
  if (need && !need.done(s)) return 'need';
  // занятый номер не переделывают: вторая кровать и мини-бар ждут выезда гостей. Остальное можно купить когда угодно
  const room = u.id === 'bed' ? 'home' : u.room;
  if (room && isLocked(s, room)) return 'busy';
  return s.coins >= u.price(s) ? 'ok' : 'poor';
}

export const hasAffordableUpgrade = (s: GameState): boolean => UPGRADES.some((u) => upgradeStatus(s, u) === 'ok');

/** Покупает улучшение. booked — номер, в который объявление сразу позвало новых гостей. */
export function buyUpgrade(s: GameState, id: UpgradeId): { booked: RoomId | null } | null {
  const u = UPGRADES.find((x) => x.id === id);
  if (!u || upgradeStatus(s, u) !== 'ok') return null;
  const price = u.price(s);
  const title = u.title(s);
  s.coins -= price;
  if (id === 'bed') {
    const home = s.rooms.home;
    home.cap = 2;
    home.rate = 50;
    if (home.bed === 'made') home.bed = 'bare';
    s.ledger.push({ t: 'Переделка номера в двухместный', d: -price, b: s.coins });
  } else if (id === 'annex') {
    s.rooms.annex.built = true;
    s.won = true;
    s.ledger.push({ t: 'Покупка одноместной пристройки', d: -price, b: s.coins });
  } else {
    if (id === 'helper') s.helper = true;
    else if (id === 'kitchen') s.kitchen = true;
    else if (u.room) s.rooms[u.room].minibar++;
    s.ledger.push({ t: title, d: -price, b: s.coins });
    return { booked: null };
  }
  const room: RoomId = id === 'bed' ? 'home' : 'annex';
  return { booked: bookRoom(s, room) ? room : null };
}
