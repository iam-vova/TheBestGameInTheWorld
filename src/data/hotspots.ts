import type { HotspotId, HotspotPlace } from '@/models/ui';

export const HOTSPOTS: Record<HotspotId, HotspotPlace> = {
  board: { scene: 'out', x: 3, y: 8, z: 26, ax: 3.3, ay: 8.7 },
  hdoor: { scene: 'out', x: 6.5, y: 6, z: 30, ax: 6.5, ay: 6.4 },
  adoor: { scene: 'out', x: 11.25, y: 6, z: 30, ax: 11.25, ay: 6.4 },
  table: { scene: 'home', x: 3.25, y: 3.1, z: 34, ax: 3.25, ay: 4.1 },
  hbed: { scene: 'home', x: 5.85, y: 1, z: 40, ax: 5.85, ay: 2.4 },
  hmat: { scene: 'home', x: 3.5, y: 5.6, z: 10, ax: 3.5, ay: 5.55 },
  abed: { scene: 'annex', x: 0.8, y: 1.3, z: 36, ax: 1.7, ay: 1.6 },
  astand: { scene: 'annex', x: 3.1, y: 0.5, z: 40, ax: 3.1, ay: 1.2 },
  amat: { scene: 'annex', x: 2, y: 3.6, z: 10, ax: 2, ay: 3.55 },
  stove: { scene: 'out', x: 8.5, y: 11.3, z: 34, ax: 8.5, ay: 10.7 },
};
