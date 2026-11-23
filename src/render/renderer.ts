import { VIEW } from '@/data/scenes';
import { viewOf } from '@/functions/camera';
import { timeOfDay, type TimeOfDay } from '@/functions/texts';
import type { GameState } from '@/models/game';
import type { Hotspot } from '@/models/ui';
import type { World } from '@/models/world';
import { P, pen } from './canvas';
import { drawOutside } from './outside';
import { drawCabin, drawHome } from './rooms';

/** цвет и сила затемнения сцены по времени суток: [r, g, b, alpha] */
const TINT: Record<TimeOfDay, number[]> = {
  day: [255, 230, 170, 0],
  eve: [255, 140, 60, 0.14],
  night: [18, 26, 84, 0.5],
  morn: [255, 240, 190, 0.06],
};
const tint = [...TINT.day];

function drawMarker(h: Hotspot, i: number, t: number): void {
  const g = pen.ctx;
  const p = P(h.x, h.y, h.z);
  const X = Math.round(p[0]);
  const Y = Math.round(p[1]) + Math.round(Math.sin(t / 220 + i) * 2);
  g.fillStyle = '#231a10';
  g.beginPath();
  g.moveTo(X - 6, Y - 9);
  g.lineTo(X + 6, Y - 9);
  g.lineTo(X, Y + 1);
  g.fill();
  g.fillStyle = '#ffd35a';
  g.beginPath();
  g.moveTo(X - 4, Y - 8);
  g.lineTo(X + 4, Y - 8);
  g.lineTo(X, Y - 1);
  g.fill();
}

/** Рисует один кадр: сцену, где стоит хозяин, затемнение и стрелки над целями. */
export function drawFrame(ctx: CanvasRenderingContext2D, s: GameState, world: World, marks: Hotspot[], t: number): void {
  const scene = world.player.scene;
  pen.ctx = ctx;
  pen.sc = viewOf(scene, world.cam);
  ctx.setTransform(VIEW.scale, 0, 0, VIEW.scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = scene === 'out' ? '#2c3f2f' : '#231a2c';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);

  if (scene === 'out') drawOutside(s, world);
  else if (scene === 'home') drawHome(s, world);
  else drawCabin(s, world, scene);

  const target = TINT[timeOfDay(s)];
  for (let i = 0; i < 4; i++) tint[i] += (target[i] - tint[i]) * 0.06;
  const alpha = tint[3] * (scene === 'out' ? 1 : 0.6);
  if (alpha > 0.005) {
    ctx.fillStyle = `rgba(${tint[0] | 0},${tint[1] | 0},${tint[2] | 0},${alpha})`;
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  }
  marks.forEach((h, i) => drawMarker(h, i, t));
}
