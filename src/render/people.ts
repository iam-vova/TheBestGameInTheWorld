import type { Actor, Player, World } from '@/models/world';
import { P, drawSorted, pen, type Drawable } from './canvas';
import { drawChar } from './sprites';

function drawPerson(a: Actor, player: Player | null): void {
  const g = pen.ctx;
  const s = pen.sc.tw / 32;
  const r = (v: number) => Math.round(v * s);
  const p = P(a.x, a.y);
  const X = Math.round(p[0]);
  const Y = Math.round(p[1]);

  g.fillStyle = 'rgba(0,0,0,.22)';
  g.beginPath();
  g.ellipse(X, Y, r(6), r(2.5), 0, 0, 7);
  g.fill();

  drawChar(a.sprite, a.dir, a.walk, a.path.length > 0 && !player?.busy, X, Y, s);

  if (player?.busy) {
    // полоска прогресса над хозяином, пока он занят
    const w = r(18);
    const k = player.busy.t / player.busy.d;
    g.fillStyle = '#231a10';
    g.fillRect(X - w / 2 - 1, Y - r(28) - 1, w + 2, 5);
    g.fillStyle = '#ffd35a';
    g.fillRect(X - w / 2, Y - r(28), w * k, 3);
  }
}

/**
 * Глубина персонажа среди предметов. Обычно это x + y, но у длинного предмета (кровать, стол) одной цифры мало:
 * персонаж перед ним, если стоит правее или ниже его прямоугольника, и за ним, если левее или выше.
 */
function depthAmong(objects: Drawable[], a: Actor): number {
  let depth = a.x + a.y;
  for (const o of objects) {
    if (!o.rect) continue;
    const [x0, y0, x1, y1] = o.rect;
    const front = a.x >= x1 || a.y >= y1;
    const behind = a.x <= x0 || a.y <= y0;
    if (front && !behind && depth <= o.depth) depth = o.depth + 0.01;
    else if (behind && !front && depth >= o.depth) depth = o.depth - 0.01;
  }
  return depth;
}

/** Добавляет к предметам сцены хозяина и гостей и рисует всё по глубине. */
export function drawWithPeople(list: Drawable[], world: World): void {
  const scene = world.player.scene;
  const objects = [...list];
  for (const guest of world.guests) {
    if (guest.scene === scene && !guest.lying) list.push({ depth: depthAmong(objects, guest), draw: () => drawPerson(guest, null) });
  }
  const helper = world.helper;
  if (helper && helper.scene === scene) list.push({ depth: depthAmong(objects, helper), draw: () => drawPerson(helper, null) });
  list.push({ depth: depthAmong(objects, world.player), draw: () => drawPerson(world.player, world.player) });
  drawSorted(list);
}
