// Несохраняемый мир: персонажи на карте и их движение.
import type { RoomId, SceneId } from './game';
import type { TaskKind } from './ui';

export type PathStep =
  | { x: number; y: number }
  | { warp: SceneId; x: number; y: number }
  | { lie: true }
  | { gone: true };

export interface Busy {
  t: number;
  d: number;
  done: () => void;
}

export interface Actor {
  sprite: string;
  scene: SceneId;
  x: number;
  y: number;
  path: PathStep[];
  walk: number;
  dir: number;
}

export interface Guest extends Actor {
  booking: RoomId;
  slot: number;
  lying: boolean;
  gone: boolean;
}

export interface Player extends Actor {
  busy: Busy | null;
  then: (() => void) | null;
}

/** Помощник сам берёт работу по номерам и кухне. */
export interface Helper extends Actor {
  job: { kind: TaskKind; room?: RoomId; t: number } | null;
}

export interface World {
  player: Player;
  helper: Helper | null;
  guests: Guest[];
  nightTimer: number;
}
