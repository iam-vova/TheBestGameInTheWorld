import type { RoomId } from '@/models/game';
import type { HotspotId, HotspotPlace, RoomSpot } from '@/models/ui';
import { FRONT_Y, ROOM_IDS, SITES } from './rooms';

/** точки внутри комнаты для двух планировок */
const INSIDE: Record<'home' | 'cabin', Record<Exclude<RoomSpot, 'door'>, Omit<HotspotPlace, 'scene'>>> = {
  home: {
    bed: { x: 5.85, y: 1, z: 40, ax: 5.85, ay: 2.4 },
    pay: { x: 3.25, y: 3.1, z: 34, ax: 3.25, ay: 4.1 },
    mat: { x: 3.5, y: 5.6, z: 10, ax: 3.5, ay: 5.55 },
  },
  cabin: {
    bed: { x: 0.8, y: 1.3, z: 36, ax: 1.7, ay: 1.6 },
    pay: { x: 3.1, y: 0.5, z: 40, ax: 3.1, ay: 1.2 },
    mat: { x: 2, y: 3.6, z: 10, ax: 2, ay: 3.55 },
  },
};

function roomSpots(r: RoomId): [HotspotId, HotspotPlace][] {
  const site = SITES[r];
  const inside = INSIDE[site.interior];
  return [
    [`${r}:door`, { scene: 'out', x: site.doorX, y: FRONT_Y, z: 30, ax: site.doorX, ay: FRONT_Y + 0.4 }],
    [`${r}:bed`, { scene: r, ...inside.bed }],
    [`${r}:pay`, { scene: r, ...inside.pay }],
    [`${r}:mat`, { scene: r, ...inside.mat }],
  ];
}

export const HOTSPOTS = Object.fromEntries([
  ['board', { scene: 'out', x: 3, y: 8, z: 26, ax: 3.3, ay: 8.7 }],
  ['stove', { scene: 'out', x: 8.5, y: 11.3, z: 34, ax: 8.5, ay: 10.7 }],
  ...ROOM_IDS.flatMap(roomSpots),
]) as Record<HotspotId, HotspotPlace>;
