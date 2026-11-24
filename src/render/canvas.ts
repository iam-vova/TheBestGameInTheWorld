// Общий контекст отрисовки и изометрическая проекция. Перед кадром renderer выставляет pen.ctx и pen.sc.
import { SCENES, type SceneConfig } from '@/data/scenes';
import { project } from '@/functions/iso';

export type Pt = [number, number];

export const pen: { ctx: CanvasRenderingContext2D; sc: SceneConfig } = {
  ctx: null as unknown as CanvasRenderingContext2D,
  sc: SCENES.out,
};

export const P = (x: number, y: number, z = 0): Pt => project(pen.sc, x, y, z);

export function quad(pts: Pt[], color: string): void {
  const g = pen.ctx;
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  g.fill();
}

/** прямоугольник на стене, идущей вдоль x */
export function wallX(x0: number, x1: number, y: number, z0: number, z1: number, color: string): void {
  quad([P(x0, y, z0), P(x1, y, z0), P(x1, y, z1), P(x0, y, z1)], color);
}

/** прямоугольник на стене, идущей вдоль y */
export function wallY(x: number, y0: number, y1: number, z0: number, z1: number, color: string): void {
  quad([P(x, y0, z0), P(x, y1, z0), P(x, y1, z1), P(x, y0, z1)], color);
}

/** рисует список по глубине: дальние раньше */
export interface Drawable {
  depth: number;
  /** место на земле [x0, y0, x1, y1]: по нему решается, перед предметом персонаж или за ним */
  rect?: readonly number[];
  draw: () => void;
}
export function drawSorted(list: Drawable[]): void {
  list.sort((a, b) => a.depth - b.depth).forEach((o) => o.draw());
}
