import { HOTSPOTS } from '@/data/hotspots';
import { walkArea, type Rect } from '@/data/obstacles';
import { ROOM_IDS, waitSpot } from '@/data/rooms';
import { DOOR_OUTSIDE, GROUND, SCENES, SPAWN } from '@/data/scenes';
import { DIR_ROW, GUEST_SPRITES } from '@/data/sprites';
import type { Booking, GameState, SceneId } from '@/models/game';
import type { Actor, Guest, Player } from '@/models/world';
import { findPath } from './path';

const ROAD_Y = 9.7;

export function createPlayer(scene: SceneId): Player {
  const [x, y] = SPAWN[scene];
  return { sprite: 'host', scene, x, y, path: [], walk: 0, dir: 0, busy: null, then: null };
}

/** Именные гости приходят со своим спрайтом, остальные — из общего набора; по дню и номеру, чтобы не повторяться. */
function guestSprite(b: Booking, i: number, day: number): string {
  if (b.cast) return b.cast[i];
  const base = day * 5 + ROOM_IDS.indexOf(b.room) * 2;
  return GUEST_SPRITES[(base + i) % GUEST_SPRITES.length];
}

function createGuest(b: Booking, i: number, day: number): Guest {
  return {
    booking: b.id, slot: i, sprite: guestSprite(b, i, day), scene: 'out', x: 0, y: 0, path: [], walk: 0, dir: 0,
    lying: false, gone: false,
  };
}

/** Расставляет гостей по сохранённому состоянию (после загрузки или новых бронирований). */
export function placeGuests(s: GameState): Guest[] {
  const guests: Guest[] = [];
  s.bookings.forEach((b, order) => {
    for (let i = 0; i < b.n; i++) {
      const g = createGuest(b, i, s.day);
      const [wx, wy] = waitSpot(b.room, i);
      if (b.stage === 'coming') {
        // приходят по дороге справа, друг за другом
        g.x = GROUND.w + 2 + order * 1.5 + i * 0.8;
        g.y = ROAD_Y;
        g.path = [{ x: wx, y: ROAD_Y }, { x: wx, y: wy }];
      } else if (b.stage === 'door') {
        g.x = wx;
        g.y = wy;
      } else if (b.stage === 'sleep') {
        g.scene = b.room;
        g.lying = true;
      } else continue;
      guests.push(g);
    }
  });
  return guests;
}

/** Гости получили ключ: заходят в свой номер и ложатся. */
export function sendToBed(guests: Guest[], b: Booking): void {
  const door = HOTSPOTS[`${b.room}:door`];
  const bed = HOTSPOTS[`${b.room}:bed`];
  const [sx, sy] = SPAWN[b.room];
  for (const g of guests) {
    if (g.booking !== b.id) continue;
    g.path = [{ x: door.ax, y: door.ay }, { warp: b.room, x: sx, y: sy }, { x: bed.ax, y: bed.ay }, { lie: true }];
  }
}

/** Гости выехали: выходят из двери и уходят по дороге. */
export function sendAway(guests: Guest[], b: Booking, day: number): Guest[] {
  const rest = guests.filter((g) => g.booking !== b.id);
  const [dx, dy] = DOOR_OUTSIDE[b.room];
  for (let i = 0; i < b.n; i++) {
    const g = createGuest(b, i, day);
    g.x = dx + i * 0.6;
    g.y = dy;
    g.path = [{ x: g.x, y: ROAD_Y }, { x: -1.5, y: ROAD_Y }, { gone: true }];
    rest.push(g);
  }
  return rest;
}

/** Один шаг движения по пути. Отрезок до следующей точки при первом шаге прокладывается в обход препятствий. */
export function stepActor(a: Actor, dt: number, obstacles: (scene: SceneId) => Rect[]): void {
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
  if (!p.routed) {
    const route = findPath(obstacles(a.scene), walkArea(a.scene), [a.x, a.y], [p.x, p.y]);
    a.path.splice(0, 1, ...route.map(([x, y]) => ({ x, y, routed: true })));
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
