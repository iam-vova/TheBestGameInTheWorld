import { DECOR, TREES } from '@/data/decor';
import { YARD } from '@/data/obstacles';
import { FRONT_Y, ROOM_IDS, SITES, type RoomSite } from '@/data/rooms';
import type { SceneSprite } from '@/data/sceneSprites';
import { GROUND } from '@/data/scenes';
import { hasGuests } from '@/functions/bookings';
import { buildUnlocked } from '@/functions/build';
import type { GameState, RoomId } from '@/models/game';
import type { World } from '@/models/world';
import { P, pen, quad, wallX, wallY, type Drawable } from './canvas';
import { drawWithPeople } from './people';
import { drawSprite } from './sprites';

const GLOW = 'rgba(255, 226, 122, 0.6)';

/** участок виден, если на нём уже что-то стоит или его можно застраивать */
const plotVisible = (s: GameState, r: RoomId): boolean =>
  s.rooms[r].built || !SITES[r].buildable || buildUnlocked(s);

function groundTile(s: GameState, x: number, y: number): SceneSprite {
  if (y === 9 || y === 10) return 'tile_road';
  for (const r of ROOM_IDS) {
    const site = SITES[r];
    // тропинка от двери к дороге
    if (s.rooms[r].built && x === Math.floor(site.doorX) && y >= FRONT_Y && y < 9) return 'tile_path';
    // земля под ещё не построенным домиком
    if (!s.rooms[r].built && plotVisible(s, r) && x >= site.x && x < site.x + 3 && y >= 3 && y < FRONT_Y) return 'tile_plot';
  }
  if (x < 3 && y >= 1 && y < 5) return 'tile_field';
  return (x * 7 + y * 13) % 11 === 0 ? 'tile_grass_b' : 'tile_grass_a';
}

function buildingSprite(s: GameState, r: RoomId): SceneSprite {
  if (r === 'home') return 'house';
  const cls = s.rooms[r].cls;
  return cls ? `cabin_${cls}` : 'annex';
}

/** окна на спрайтах построек: отрезки вдоль передней и правой стены и высота в долях стены — как в art/models/buildings.js */
const WINDOWS = {
  house: { front: [[3.75, 4.55]], side: [[1.2, 2.4]], y: [0.34, 0.7] },
  cabin: { front: [[0.2, 0.7], [1.8, 2.3]], side: [[0.75, 1.5]], y: [0.36, 0.72] },
  economy: { front: [[1.85, 2.3]], side: [[0.75, 1.5]], y: [0.36, 0.72] },
};

/** свет в окнах, когда в номерах гости: полупрозрачные прямоугольники поверх окон спрайта */
function windowGlow(b: RoomSite, kind: keyof typeof WINDOWS): void {
  const win = WINDOWS[kind];
  const z0 = b.h * win.y[0];
  const z1 = b.h * win.y[1];
  for (const [x0, x1] of win.front) wallX(b.x + x0, b.x + x1, b.y + b.d, z0, z1, GLOW);
  for (const [y0, y1] of win.side) wallY(b.x + b.w, b.y + y0, b.y + y1, z0, z1, GLOW);
}

/** пунктир вокруг свободного участка и табличка */
function emptyPlot(b: RoomSite): void {
  const g = pen.ctx;
  g.strokeStyle = '#f3e9d6';
  g.setLineDash([3, 3]);
  g.beginPath();
  [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.d], [b.x, b.y + b.d], [b.x, b.y]].forEach((q, i) => {
    const p = P(q[0], q[1]);
    if (i) g.lineTo(p[0], p[1]);
    else g.moveTo(p[0], p[1]);
  });
  g.stroke();
  g.setLineDash([]);
  drawSprite('sign', b.doorX, FRONT_Y);
}

export function drawOutside(s: GameState, world: World): void {
  const lit = hasGuests(s);
  // подложка под тайлы, чтобы на стыках не просвечивал фон
  quad([P(0, 0), P(GROUND.w, 0), P(GROUND.w, GROUND.h), P(0, GROUND.h)], '#6cb53f');
  for (let y = 0; y < GROUND.h; y++) {
    for (let x = 0; x < GROUND.w; x++) drawSprite(groundTile(s, x, y), x, y);
  }
  TREES.forEach(([x, y]) => drawSprite('tree', x + 0.5, y + 0.6));
  // постройки стоят в один ряд, слева направо — так они правильно перекрывают друг друга
  for (const r of ROOM_IDS) {
    const site = SITES[r];
    if (s.rooms[r].built) {
      drawSprite(buildingSprite(s, r), site.x, site.y);
      if (lit) windowGlow(site, r === 'home' ? 'house' : s.rooms[r].cls === 'economy' ? 'economy' : 'cabin');
    } else if (plotVisible(s, r)) emptyPlot(site);
  }
  const list: Drawable[] = DECOR.map(([name, x, y]) => ({
    depth: x + y,
    rect: name === 'bench' ? YARD.bench : undefined,
    draw: () => drawSprite(name, x, y),
  }));
  list.push({ depth: 11.05, rect: YARD.board, draw: () => drawSprite(s.posted ? 'board_posted' : 'board', 3, 8) });
  if (s.kitchen) list.push({ depth: 19.8, rect: YARD.kitchen, draw: () => drawSprite('kitchen', 8.5, 11.3) });
  drawWithPeople(list, world);
}
