import { BALANCE } from '@/data/balance';
import { HOTSPOTS } from '@/data/hotspots';
import { DOOR_OUTSIDE, SPAWN } from '@/data/scenes';
import type { SceneId } from '@/models/game';
import type { Task, TaskKind } from '@/models/ui';
import type { Actor, Helper, PathStep } from '@/models/world';

/** работа, которую помощник берёт на себя; ключи и оплата остаются за хозяином */
const HELPER_JOBS: TaskKind[] = ['cook', 'makeBed', 'strip', 'repair'];
/** где помощник ждёт, когда работы нет */
const IDLE: [number, number] = [5.2, 7.4];

export function createHelper(): Helper {
  return { sprite: 'helper', scene: 'out', x: IDLE[0], y: IDLE[1], path: [], walk: 0, dir: 0, job: null };
}

export const sameJob = (job: NonNullable<Helper['job']>, t: Task): boolean => t.kind === job.kind && t.room === job.room;

/** Путь до точки в любой сцене: из комнаты через коврик на улицу и в нужную дверь. */
export function routeTo(a: Actor, scene: SceneId, x: number, y: number): PathStep[] {
  const path: PathStep[] = [];
  if (a.scene !== scene) {
    if (a.scene !== 'out') {
      const mat = HOTSPOTS[`${a.scene}:mat`];
      const [ox, oy] = DOOR_OUTSIDE[a.scene];
      path.push({ x: mat.ax, y: mat.ay }, { warp: 'out', x: ox, y: oy });
    }
    if (scene !== 'out') {
      const door = HOTSPOTS[`${scene}:door`];
      path.push({ x: door.ax, y: door.ay }, { warp: scene, x: SPAWN[scene][0], y: SPAWN[scene][1] });
    }
  }
  path.push({ x, y });
  return path;
}

/**
 * Шаг помощника: выбирает задачу, идёт к ней, работает. Возвращает задачу, которую он только что закончил.
 * Если хозяин успел сделать её сам, помощник бросает и берёт следующую.
 */
export function stepHelper(h: Helper, tasks: Task[], dt: number): Task | null {
  if (h.job) {
    const task = tasks.find((t) => sameJob(h.job!, t));
    if (!task) {
      h.job = null;
      h.path = [];
      return null;
    }
    if (h.path.length) return null;
    h.job.t += dt;
    if (h.job.t < BALANCE.duration[h.job.kind as keyof typeof BALANCE.duration]) return null;
    h.job = null;
    return task;
  }
  const next = tasks.find((t) => HELPER_JOBS.includes(t.kind));
  if (next) {
    const spot = HOTSPOTS[next.hotspot];
    h.job = { kind: next.kind, room: next.room, t: 0 };
    // встаёт чуть в стороне от точки хозяина, чтобы не сливаться с ним
    h.path = routeTo(h, spot.scene, spot.ax - 0.5, spot.ay + 0.1);
  } else if (!h.path.length && (h.scene !== 'out' || Math.hypot(h.x - IDLE[0], h.y - IDLE[1]) > 0.1)) {
    h.path = routeTo(h, 'out', IDLE[0], IDLE[1]);
  }
  return null;
}
