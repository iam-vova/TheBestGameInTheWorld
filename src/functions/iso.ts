import type { SceneConfig } from '@/data/scenes';

/** клетка (x, y) и высота z → точка на экране */
export function project(sc: SceneConfig, x: number, y: number, z = 0): [number, number] {
  return [sc.ox + ((x - y) * sc.tw) / 2, sc.oy + ((x + y) * sc.th) / 2 - z];
}

/** точка на экране → клетка на земле */
export function unproject(sc: SceneConfig, mx: number, my: number): [number, number] {
  const a = (mx - sc.ox) / (sc.tw / 2);
  const b = (my - sc.oy) / (sc.th / 2);
  return [(a + b) / 2, (b - a) / 2];
}

export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
