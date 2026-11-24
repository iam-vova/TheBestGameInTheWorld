import type { GameState, RoomId, SceneId } from '@/models/game';
import { DECOR, TREES } from './decor';
import { SITES } from './rooms';
import { GROUND } from './scenes';
import type { SceneSprite } from './sceneSprites';

/** прямоугольник на земле в клетках: [x0, y0, x1, y1] */
export type Rect = [number, number, number, number];

const around = (x: number, y: number, r: number): Rect => [x - r, y - r, x + r, y + r];

/** мебель комнат: по этим же прямоугольникам её обходят и решают, кто кого заслоняет */
export const FURNITURE = {
  homeTable: [2.5, 2.6, 4, 3.6] as Rect,
  homeSofa: [4.95, 0.25, 6.75, 1.25] as Rect,
  homeBeds: [[4.9, 0.25, 5.75, 2.05], [5.95, 0.25, 6.8, 2.05]] as Rect[],
  homeMinibar: [0.95, 0.25, 1.45, 0.75] as Rect,
  cabinBeds: [[0.3, 0.25, 1.15, 2.05], [1.3, 0.25, 2.15, 2.05]] as Rect[],
  cabinStand: [2.8, 0.2, 3.4, 0.8] as Rect,
  cabinMinibar: (cap: number): Rect => (cap > 1 ? [2.4, 0.25, 2.9, 0.75] : [1.7, 0.25, 2.2, 0.75]),
};
export const YARD = {
  board: [2.4, 7.9, 3.6, 8.3] as Rect,
  kitchen: [7.9, 10.9, 9.2, 11.6] as Rect,
  bench: [9.0, 6.9, 10.2, 7.5] as Rect,
};

/** сколько места занимает декор двора вокруг своей точки */
const DECOR_RADIUS: Partial<Record<SceneSprite, number>> = { lamp: 0.15, flowers: 0.3, bush: 0.3, mailbox: 0.15, fountain: 0.8 };

function roomObstacles(s: GameState, r: RoomId): Rect[] {
  const room = s.rooms[r];
  if (SITES[r].interior === 'home') {
    return [
      FURNITURE.homeTable,
      ...(room.cap === 1 ? [FURNITURE.homeSofa] : FURNITURE.homeBeds),
      ...(room.minibar ? [FURNITURE.homeMinibar] : []),
    ];
  }
  return [
    ...FURNITURE.cabinBeds.slice(0, room.cap),
    FURNITURE.cabinStand,
    ...(room.minibar ? [FURNITURE.cabinMinibar(room.cap)] : []),
  ];
}

/** Всё, сквозь что нельзя пройти в сцене. */
export function getObstacles(s: GameState, scene: SceneId): Rect[] {
  if (scene !== 'out') return roomObstacles(s, scene);
  return [
    YARD.board,
    ...(s.kitchen ? [YARD.kitchen] : []),
    ...DECOR.map(([name, x, y]) => (name === 'bench' ? YARD.bench : around(x, y, DECOR_RADIUS[name] ?? 0.2))),
    ...TREES.map(([x, y]) => around(x + 0.5, y + 0.6, 0.25)),
  ];
}

/** область, внутри которой прокладывается путь: двор с запасом на дорогу за краями карты и пол комнаты */
export function walkArea(scene: SceneId): Rect {
  if (scene === 'out') return [-3, 6, GROUND.w + 14, 12.2];
  return SITES[scene].interior === 'home' ? [0.2, 1, 6.9, 5.9] : [0.2, 0.9, 3.9, 3.9];
}
