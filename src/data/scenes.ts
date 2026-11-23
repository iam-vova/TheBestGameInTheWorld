import type { RoomId, SceneId } from '@/models/game';
import { ROOM_IDS, SITES } from './rooms';

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
/** размер двора в клетках */
export const GROUND = { w: 22, h: 12 };

const OUT: SceneConfig = { tw: 32, th: 16, ox: 230, oy: 70, minx: 0.3, maxx: GROUND.w - 0.3, miny: 6.3, maxy: 11.7, speed: 3.4 };
const HOME: SceneConfig = { tw: 48, th: 24, ox: 228, oy: 108, minx: 0.4, maxx: 6.6, miny: 1.3, maxy: 5.7, speed: 2.8 };
const CABIN: SceneConfig = { tw: 48, th: 24, ox: 240, oy: 134, minx: 0.4, maxx: 3.6, miny: 1.1, maxy: 3.7, speed: 2.8 };

const perRoom = <T>(f: (r: RoomId) => T): Record<RoomId, T> =>
  Object.fromEntries(ROOM_IDS.map((r) => [r, f(r)])) as Record<RoomId, T>;
const isHome = (r: RoomId): boolean => SITES[r].interior === 'home';

export const SCENES: Record<SceneId, SceneConfig> = { out: OUT, ...perRoom((r) => (isHome(r) ? HOME : CABIN)) };

/** где появляется хозяин при загрузке и при входе в сцену */
export const SPAWN: Record<SceneId, [number, number]> = {
  out: [6.5, 7.2],
  ...perRoom((r): [number, number] => (isHome(r) ? [3.5, 5.2] : [2, 3.2])),
};
/** куда выходят из комнаты */
export const DOOR_OUTSIDE: Record<RoomId, [number, number]> = perRoom((r) => [SITES[r].doorX, 6.6]);
