import type { Rect } from '@/data/obstacles';

type Pt = [number, number];
const STEP = 0.25;
/** запас вокруг препятствия, чтобы персонаж не шёл вплотную */
const PAD = 0.12;

const inside = (r: Rect, x: number, y: number): boolean => x > r[0] - PAD && x < r[2] + PAD && y > r[1] - PAD && y < r[3] + PAD;
const blocked = (rects: Rect[], x: number, y: number): boolean => rects.some((r) => inside(r, x, y));

/** прямая между точками свободна */
function clear(rects: Rect[], a: Pt, b: Pt): boolean {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.08));
  for (let i = 1; i <= n; i++) {
    if (blocked(rects, a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n)) return false;
  }
  return true;
}

/**
 * Путь из точки в точку в обход препятствий: A* по сетке с шагом четверть клетки, затем спрямление.
 * Если цель внутри препятствия, идём к ближайшей свободной точке. Возвращает точки без начальной.
 */
export function findPath(rects: Rect[], area: Rect, from: Pt, to: Pt): Pt[] {
  if (clear(rects, from, to)) return [to];
  const w = Math.ceil((area[2] - area[0]) / STEP) + 1;
  const h = Math.ceil((area[3] - area[1]) / STEP) + 1;
  const cell = (p: Pt): number => {
    const cx = Math.min(w - 1, Math.max(0, Math.round((p[0] - area[0]) / STEP)));
    const cy = Math.min(h - 1, Math.max(0, Math.round((p[1] - area[1]) / STEP)));
    return cy * w + cx;
  };
  const point = (i: number): Pt => [area[0] + (i % w) * STEP, area[1] + Math.floor(i / w) * STEP];
  const free = (i: number): boolean => !blocked(rects, ...point(i));

  const start = cell(from);
  let goal = cell(to);
  let exact = !blocked(rects, to[0], to[1]);
  if (!free(goal)) {
    // ближайшая свободная ячейка к цели
    exact = false;
    let best = -1;
    let bestDist = Infinity;
    for (let i = 0; i < w * h; i++) {
      const p = point(i);
      const d = Math.hypot(p[0] - to[0], p[1] - to[1]);
      if (d < bestDist && free(i)) {
        best = i;
        bestDist = d;
      }
    }
    if (best < 0) return [to];
    goal = best;
  }

  const cost = new Float32Array(w * h).fill(Infinity);
  const prev = new Int32Array(w * h).fill(-1);
  const open = new Set<number>([start]);
  const [gx, gy] = [goal % w, Math.floor(goal / w)];
  const guess = (i: number): number => Math.hypot((i % w) - gx, Math.floor(i / w) - gy);
  cost[start] = 0;
  while (open.size) {
    let cur = -1;
    let best = Infinity;
    for (const i of open) {
      const f = cost[i] + guess(i);
      if (f < best) {
        best = f;
        cur = i;
      }
    }
    if (cur === goal) break;
    open.delete(cur);
    const cx = cur % w;
    const cy = Math.floor(cur / w);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const next = ny * w + nx;
        if (!free(next)) continue;
        // по диагонали нельзя срезать угол препятствия
        if (dx && dy && (!free(cy * w + nx) || !free(ny * w + cx))) continue;
        const c = cost[cur] + (dx && dy ? Math.SQRT2 : 1);
        if (c < cost[next]) {
          cost[next] = c;
          prev[next] = cur;
          open.add(next);
        }
      }
    }
  }
  if (prev[goal] < 0 && goal !== start) return [to];

  const cells: Pt[] = [];
  for (let i = goal; i !== start && i >= 0; i = prev[i]) cells.unshift(point(i));
  if (exact) cells.push(to);
  // спрямление: пропускаем точки, пока видна следующая
  const out: Pt[] = [];
  let at = from;
  for (let i = 0; i < cells.length; ) {
    let far = i;
    for (let j = cells.length - 1; j > i; j--) {
      if (clear(rects, at, cells[j])) {
        far = j;
        break;
      }
    }
    out.push(cells[far]);
    at = cells[far];
    i = far + 1;
  }
  return out;
}
