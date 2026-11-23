import { DECOR, TREES } from '@/data/decor';
import type { SceneSprite } from '@/data/sceneSprites';
import { hasGuests } from '@/functions/bookings';
import type { GameState } from '@/models/game';
import type { World } from '@/models/world';
import { P, pen, quad, wallX, wallY, type Drawable } from './canvas';
import { drawWithPeople } from './people';
import { drawSprite } from './sprites';

const GROUND = { w: 14, h: 12 };
/** дом и пристройка: клетка, размеры и высота стен — те же, по которым сгенерированы спрайты */
const HOUSE = { x: 4, y: 2, w: 5, d: 4, h: 34 };
const ANNEX = { x: 10, y: 3.5, w: 2.5, d: 2.5, h: 28 };
const GLOW = 'rgba(255, 226, 122, 0.6)';

function groundTile(x: number, y: number, annex: boolean): SceneSprite {
  if (y === 9 || y === 10) return 'tile_road';
  if (x === 6 && y >= 6 && y < 9) return 'tile_path'; // тропинка к дому
  if (annex && x === 11 && y >= 6 && y < 9) return 'tile_path';
  if (x >= 10 && x < 13 && y >= 3 && y < 6) return 'tile_plot'; // участок под пристройку
  if (x < 3 && y >= 1 && y < 5) return 'tile_field';
  return (x * 7 + y * 13) % 5 === 0 ? 'tile_grass_b' : 'tile_grass_a';
}

/** свет в окнах, когда в номерах гости: полупрозрачные прямоугольники поверх окон спрайта */
function windowGlow(b: typeof HOUSE, big: boolean): void {
  const z0 = b.h * 0.34;
  const z1 = b.h * 0.7;
  if (big) wallX(b.x + b.w - 1.25, b.x + b.w - 0.45, b.y + b.d, z0, z1, GLOW);
  else wallX(b.x + 0.45, b.x + 1.25, b.y + b.d, z0, z1, GLOW);
  wallY(b.x + b.w, b.y + b.d * 0.3, b.y + b.d * 0.6, z0, z1, GLOW);
}

/** пунктир вокруг участка, где появится пристройка */
function buildSite(): void {
  const g = pen.ctx;
  g.strokeStyle = '#f3e9d6';
  g.setLineDash([3, 3]);
  g.beginPath();
  const { x, y, w, d } = ANNEX;
  [[x, y], [x + w, y], [x + w, y + d], [x, y + d], [x, y]].forEach((q, i) => {
    const p = P(q[0], q[1]);
    if (i) g.lineTo(p[0], p[1]);
    else g.moveTo(p[0], p[1]);
  });
  g.stroke();
  g.setLineDash([]);
  drawSprite('sign', 11.25, 6);
}

export function drawOutside(s: GameState, world: World): void {
  const annex = s.rooms.annex.built;
  const lit = hasGuests(s);
  // подложка под тайлы, чтобы на стыках не просвечивал фон
  quad([P(0, 0), P(GROUND.w, 0), P(GROUND.w, GROUND.h), P(0, GROUND.h)], '#6cb53f');
  for (let y = 0; y < GROUND.h; y++) {
    for (let x = 0; x < GROUND.w; x++) drawSprite(groundTile(x, y, annex), x, y);
  }
  TREES.forEach(([x, y]) => drawSprite('tree', x + 0.5, y + 0.6));
  drawSprite('house', HOUSE.x, HOUSE.y);
  if (lit) windowGlow(HOUSE, true);
  if (annex) {
    drawSprite('annex', ANNEX.x, ANNEX.y);
    if (lit) windowGlow(ANNEX, false);
  } else buildSite();
  const list: Drawable[] = DECOR.map(([name, x, y]) => ({ depth: x + y, draw: () => drawSprite(name, x, y) }));
  list.push({ depth: 16.05, draw: () => drawSprite(s.posted ? 'board_posted' : 'board', 3, 8) });
  if (s.kitchen) list.push({ depth: 21.9, draw: () => drawSprite('kitchen', 8.5, 11.3) });
  drawWithPeople(list, world);
}
