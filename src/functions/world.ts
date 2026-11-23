import { SCENES, SPAWN } from '@/data/scenes';
import { DIR_ROW, GUEST_SPRITES } from '@/data/sprites';
import type { Booking, GameState, SceneId } from '@/models/game';
import type { Actor, Guest, Player } from '@/models/world';

/** где гость ждёт у двери своего номера */
const doorX = (b: Booking, i: number): number => (b.room === 'home' ? 7.4 + i * 0.7 : 11.9);
const WAIT_Y = 6.9;
const ROAD_Y = 9.7;

export function createPlayer(scene: SceneId): Player {
  const [x, y] = SPAWN[scene];
  return { sprite: 'host', scene, x, y, path: [], walk: 0, dir: 0, busy: null, then: null };
}

function createGuest(b: Booking, i: number): Guest {
  const slot = b.room === 'annex' ? 2 : i;
  const sprite = b.cast ? b.cast[i] : GUEST_SPRITES[slot];
  return {
    booking: b.id, slot, sprite, scene: 'out', x: 0, y: 0, path: [], walk: 0, dir: 0,
    lying: false, gone: false,
  };
}

/** Расставляет гостей по сохранённому состоянию (после загрузки или новых бронирований). */
export function placeGuests(s: GameState): Guest[] {
  const guests: Guest[] = [];
  for (const b of s.bookings) {
    for (let i = 0; i < b.n; i++) {
      const g = createGuest(b, i);
      const dx = doorX(b, i);
      if (b.stage === 'coming') {
        g.x = 16 + g.slot * 0.9;
        g.y = ROAD_Y;
        g.path = [{ x: dx, y: ROAD_Y }, { x: dx, y: WAIT_Y }];
      } else if (b.stage === 'door') {
        g.x = dx;
        g.y = WAIT_Y;
      } else if (b.stage === 'sleep') {
        g.scene = b.room;
        g.lying = true;
      } else continue;
      guests.push(g);
    }
  }
  return guests;
}

/** Гости получили ключ: заходят в свой номер и ложатся. */
export function sendToBed(guests: Guest[], b: Booking): void {
  for (const g of guests) {
    if (g.booking !== b.id) continue;
    g.path =
      b.room === 'home'
        ? [{ x: 6.5, y: 6.4 }, { warp: 'home', x: 3.5, y: 5.3 }, { x: 5.85, y: 2.4 }, { lie: true }]
        : [{ x: 11.25, y: 6.4 }, { warp: 'annex', x: 2, y: 3.3 }, { x: 1.7, y: 1.6 }, { lie: true }];
  }
}

/** Гости выехали: выходят из двери и уходят по дороге. */
export function sendAway(guests: Guest[], b: Booking): Guest[] {
  const rest = guests.filter((g) => g.booking !== b.id);
  const dx = b.room === 'home' ? 6.5 : 11.25;
  for (let i = 0; i < b.n; i++) {
    const g = createGuest(b, i);
    g.x = dx + i * 0.6;
    g.y = 6.6;
    g.path = [{ x: g.x, y: ROAD_Y }, { x: -1.5, y: ROAD_Y }, { gone: true }];
    rest.push(g);
  }
  return rest;
}

/** Один шаг движения по пути. */
export function stepActor(a: Actor, dt: number): void {
  const p = a.path[0];
  if (!p) {
    a.walk = 0;
    a.dir = 0;
    return;
  }
  if ('warp' in p) {
    a.scene = p.warp;
    a.x = p.x;
    a.y = p.y;
    a.path.shift();
    return;
  }
  if ('lie' in p) {
    (a as Guest).lying = true;
    a.path.shift();
    return;
  }
  if ('gone' in p) {
    (a as Guest).gone = true;
    a.path = [];
    return;
  }
  const step = SCENES[a.scene].speed * dt;
  const dx = p.x - a.x;
  const dy = p.y - a.y;
  const d = Math.hypot(dx, dy);
  if (d > 0.01) a.dir = DIR_ROW[(Math.round(Math.atan2((dx + dy) / 2, dx - dy) / (Math.PI / 4)) + 8) % 8];
  if (d <= step) {
    a.x = p.x;
    a.y = p.y;
    a.path.shift();
  } else {
    a.x += (dx / d) * step;
    a.y += (dy / d) * step;
  }
  a.walk += dt;
}
