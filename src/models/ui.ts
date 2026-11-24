import type { NightEvent, RoomId, SceneId } from './game';

/** точки комнаты: дверь снаружи, кровать, место оплаты и коврик у выхода внутри */
export type RoomSpot = 'door' | 'bed' | 'pay' | 'mat';
export type HotspotId = 'board' | 'stove' | `${RoomId}:${RoomSpot}`;

export interface HotspotPlace {
  scene: SceneId;
  x: number;
  y: number;
  z: number;
  /** куда подойти, чтобы выполнить действие */
  ax: number;
  ay: number;
}

export type TaskKind = 'ad' | 'makeBed' | 'giveKey' | 'collect' | 'strip' | 'repair' | 'cook';

/** Что игрок может сделать прямо сейчас. Чистые данные, без замыканий. */
export interface Task {
  kind: TaskKind;
  hotspot: HotspotId;
  label: string;
  room?: RoomId;
}

export type Action =
  | { type: 'task'; task: Task }
  | { type: 'enter'; room: RoomId }
  | { type: 'exit'; from: RoomId }
  | { type: 'locked' }
  | { type: 'boardInfo' };

export interface Hotspot extends HotspotPlace {
  label?: string;
  mark: boolean;
  action: Action;
}

export interface Bill {
  room: RoomId;
  who: string;
  sum: number;
  tip: number;
  dinner: number;
  bar: number;
  /** скидка за долгое ожидание у двери, отрицательное число */
  late: number;
  ev?: NightEvent;
  total: number;
}

export type UpgradeStatus = 'hidden' | 'done' | 'need' | 'busy' | 'poor' | 'ok';

export type Modal =
  | { type: 'ad' }
  | { type: 'bill'; bill: Bill }
  | { type: 'upgrades' }
  | { type: 'build' }
  | { type: 'confirmNew' }
  | { type: 'ledger' }
  | { type: 'message'; title: string; lines: string[]; ok: string };

export interface StageLabel {
  text: string;
  left: string;
  top: string;
  /** цель за краем экрана: подпись прижата к краю и показывает направление */
  edge: boolean;
}
