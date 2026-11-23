import { SCENE_SPRITES, type SceneSprite } from '@/data/sceneSprites';
import { CHARS, CHAR_FRAME } from '@/data/sprites';
import { P, pen } from './canvas';

const load = (name: string): HTMLImageElement => {
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}assets/${name}`;
  return img;
};
const chars = load('chars.png');
const scene = load('scene.png');

/** Сцена начинает рисоваться, когда оба атласа загружены. */
export const spritesReady: Promise<unknown> = Promise.all([chars, scene].map((img) => img.decode().catch(() => undefined)));

/**
 * Спрайт сцены в клетке (x, y) на высоте z. У каждого спрайта своя точка привязки (см. tools/pack_atlas.py),
 * поэтому постройки и мебель ставятся теми же координатами, что и в логике.
 */
export function drawSprite(name: SceneSprite, x: number, y: number, z = 0): void {
  const [sx, sy, w, h, k, dx, dy] = SCENE_SPRITES[name];
  const p = P(x, y, z);
  // округляем до половины логического пикселя — это целый пиксель канвы
  const left = Math.round((p[0] + dx / k) * 2) / 2;
  const topY = Math.round((p[1] + dy / k) * 2) / 2;
  pen.ctx.drawImage(scene, sx, sy, w, h, left, topY, w / k, h / k);
}

/** Кадр персонажа: frame 0 — стойка, 1..f — ходьба. */
export function drawChar(sprite: string, dir: number, walk: number, moving: boolean, X: number, Y: number, scale: number): void {
  const c = CHARS[sprite];
  if (!c) return;
  const frame = moving && c.f ? 1 + (Math.floor(walk * 10) % c.f) : 0;
  const size = (CHAR_FRAME / 2) * scale;
  pen.ctx.drawImage(chars, frame * CHAR_FRAME, (c.i * 8 + dir) * CHAR_FRAME, CHAR_FRAME, CHAR_FRAME, X - size / 2, Y - 23 * scale, size, size);
}
