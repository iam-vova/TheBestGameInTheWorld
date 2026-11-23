import { UPGRADES, type Upgrade, type UpgradeId } from '@/data/upgrades';
import type { GameState } from '@/models/game';
import type { UpgradeStatus } from '@/models/ui';
import { hasGuests, makeBookings } from './bookings';

export function upgradeStatus(s: GameState, u: Upgrade): UpgradeStatus {
  if (u.done(s)) return 'done';
  const need = u.need && UPGRADES.find((x) => x.id === u.need);
  if (need && !need.done(s)) return 'need';
  // стройка возможна, только пока в номерах никого нет
  if (hasGuests(s)) return 'busy';
  return s.coins >= u.price(s) ? 'ok' : 'poor';
}

export const hasAffordableUpgrade = (s: GameState): boolean => UPGRADES.some((u) => upgradeStatus(s, u) === 'ok');

/** Покупает улучшение. Возвращает true, если бронирования пересозданы (объявление обновилось само). */
export function buyUpgrade(s: GameState, id: UpgradeId): { rebooked: boolean } | null {
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
    else s.rooms[id === 'minibar_home' ? 'home' : 'annex'].minibar++;
    s.ledger.push({ t: title, d: -price, b: s.coins });
    return { rebooked: false };
  }
  const rebooked = s.phase === 'arrive';
  if (rebooked) makeBookings(s);
  return { rebooked };
}
