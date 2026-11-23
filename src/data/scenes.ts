import type { SceneId } from '@/models/game';

export interface SceneConfig {
  /** размер тайла на экране */
  tw: number;
  th: number;
  /** экранная точка тайла (0,0) */
  ox: number;
  oy: number;
  /** границы, в которых может ходить хозяин */
  minx: number;
  maxx: number;
  miny: number;
  maxy: number;
  speed: number;
}

/** логический размер сцены; канва в 2 раза больше, чтобы спрайты 48px шли пиксель в пиксель */
export const VIEW = { w: 480, h: 300, scale: 2 };

export const SCENES: Record<SceneId, SceneConfig> = {
  out: { tw: 32, th: 16, ox: 230, oy: 70, minx: 0.3, maxx: 13.7, miny: 6.3, maxy: 11.7, speed: 3.4 },
  home: { tw: 48, th: 24, ox: 228, oy: 108, minx: 0.4, maxx: 6.6, miny: 1.3, maxy: 5.7, speed: 2.8 },
  annex: { tw: 48, th: 24, ox: 240, oy: 134, minx: 0.4, maxx: 3.6, miny: 1.1, maxy: 3.7, speed: 2.8 },
};

/** где появляется хозяин при загрузке и при переходе между сценами */
export const SPAWN: Record<SceneId, [number, number]> = { out: [6.5, 7.2], home: [3.5, 5.2], annex: [2, 3.2] };
export const DOOR_OUTSIDE: Record<'home' | 'annex', [number, number]> = { home: [6.5, 6.6], annex: [11.25, 6.6] };
