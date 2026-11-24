import { describe, expect, it } from 'vitest';
import { HOTSPOTS } from '@/data/hotspots';
import { FURNITURE, getObstacles, walkArea, type Rect } from '@/data/obstacles';
import { ROOM_IDS } from '@/data/rooms';
import { SPAWN } from '@/data/scenes';
import { findPath } from '@/functions/path';
import { createState } from '@/functions/state';
import type { HotspotId } from '@/models/ui';

const hits = (r: Rect, x: number, y: number) => x > r[0] && x < r[2] && y > r[1] && y < r[3];
/** ни одна точка ломаной не проходит сквозь препятствие */
function crosses(rects: Rect[], pts: [number, number][]): boolean {
  for (let i = 1; i < pts.length; i++) {
    for (let k = 0; k <= 40; k++) {
      const x = pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * k) / 40;
      const y = pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * k) / 40;
      if (rects.some((r) => hits(r, x, y))) return true;
    }
  }
  return false;
}

describe('обход препятствий', () => {
  it('путь через комнату огибает стол', () => {
    const s = createState();
    const rects = getObstacles(s, 'home');
    const from: [number, number] = [3.25, 4.6];
    const to: [number, number] = [3.25, 1.6];
    const path = findPath(rects, walkArea('home'), from, to);
    expect(path.length).toBeGreaterThan(1);
    expect(path.at(-1)).toEqual(to);
    expect(crosses(rects, [from, ...path])).toBe(false);
  });

  it('клик внутрь мебели приводит к ближайшему свободному месту', () => {
    const s = createState();
    const rects = getObstacles(s, 'home');
    const [x0, y0, x1, y1] = FURNITURE.homeTable;
    const path = findPath(rects, walkArea('home'), [1, 5], [(x0 + x1) / 2, (y0 + y1) / 2]);
    const end = path.at(-1)!;
    expect(rects.some((r) => hits(r, end[0], end[1]))).toBe(false);
  });

  it('до каждой точки действия можно дойти от входа, не проходя сквозь предметы', () => {
    const s = createState();
    s.kitchen = true;
    for (const r of ROOM_IDS) Object.assign(s.rooms[r], { built: true, cap: r === 'annex' ? 1 : 2, minibar: 1 });
    for (const [id, spot] of Object.entries(HOTSPOTS) as [HotspotId, (typeof HOTSPOTS)[HotspotId]][]) {
      const rects = getObstacles(s, spot.scene);
      const from = SPAWN[spot.scene];
      const path = findPath(rects, walkArea(spot.scene), from, [spot.ax, spot.ay]);
      expect(path.at(-1), id).toEqual([spot.ax, spot.ay]);
      expect(crosses(rects, [from, ...path]), id).toBe(false);
    }
  });
});
