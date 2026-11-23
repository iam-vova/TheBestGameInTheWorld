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

/** Добавляет к предметам сцены хозяина и гостей и рисует всё по глубине. */
export function drawWithPeople(list: Drawable[], world: World): void {
  const scene = world.player.scene;
  for (const guest of world.guests) {
    if (guest.scene === scene && !guest.lying) list.push({ depth: guest.x + guest.y, draw: () => drawPerson(guest, null) });
  }
  const helper = world.helper;
  if (helper && helper.scene === scene) list.push({ depth: helper.x + helper.y, draw: () => drawPerson(helper, null) });
  list.push({ depth: world.player.x + world.player.y, draw: () => drawPerson(world.player, world.player) });
  drawSorted(list);
}
