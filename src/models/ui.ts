import type { NightEvent, RoomId, SceneId } from './game';

export type HotspotId = 'board' | 'hdoor' | 'adoor' | 'table' | 'hbed' | 'hmat' | 'abed' | 'astand' | 'amat' | 'stove';

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
  ev?: NightEvent;
  total: number;
}

export type UpgradeStatus = 'done' | 'need' | 'busy' | 'poor' | 'ok';

export type Modal =
  | { type: 'ad' }
  | { type: 'bill'; bill: Bill }
  | { type: 'upgrades' }
  | { type: 'confirmNew' }
  | { type: 'message'; title: string; lines: string[]; ok: string };

export interface StageLabel {
  text: string;
  left: string;
  top: string;
}
