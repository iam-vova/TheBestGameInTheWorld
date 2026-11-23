import { findBooking } from '@/functions/bookings';
import { timeOfDay, type TimeOfDay } from '@/functions/texts';
import type { BedState, GameState, RoomId } from '@/models/game';
import type { World } from '@/models/world';
import { wallX, type Drawable } from './canvas';
import { drawWithPeople } from './people';
import { drawSprite } from './sprites';

/** оттенок окна по времени суток поверх нарисованного стекла */
const SKY: Record<TimeOfDay, string | null> = {
  day: null,
  eve: 'rgba(242, 150, 90, 0.55)',
  night: 'rgba(30, 40, 100, 0.75)',
  morn: 'rgba(255, 244, 200, 0.35)',
};

function shell(room: RoomId, winX0: number, winX1: number, sky: string | null): void {
  drawSprite(room === 'home' ? 'shell_home' : 'shell_annex', 0, 0);
  if (sky) wallX(winX0, winX1, 0, 27, 53, sky);
}

/** Кровать или диван в нужном состоянии. Разгромленный номер выглядит как неубранный плюс мусор на полу. */
function bed(kind: 'sofa' | 'bed', x: number, y: number, state: BedState, occupied: boolean): void {
  const look = occupied ? 'sleep' : state === 'wrecked' ? 'used' : state;
  drawSprite(`${kind}_${look}`, x, y);
}

const sleeping = (world: World, room: RoomId): number => world.guests.filter((g) => g.scene === room && g.lying).length;
const paymentWaits = (s: GameState, room: RoomId): boolean => {
  const b = findBooking(s, room);
  return !!b && b.stage === 'left' && !b.paid;
};

export function drawHome(s: GameState, world: World): void {
  const room = s.rooms.home;
  const asleep = sleeping(world, 'home');
  shell('home', 3, 4.2, SKY[timeOfDay(s)]);
  if (room.bed === 'wrecked') drawSprite('mess', 3.8, 4.4);
  const list: Drawable[] = [
    {
      depth: 6.35,
      draw: () => {
        drawSprite('table', 3.25, 3.1);
        if (paymentWaits(s, 'home')) drawSprite('coins', 3.3, 3.4, 25);
      },
    },
  ];
  if (room.minibar) list.push({ depth: 1.7, draw: () => drawSprite('minibar', 1.2, 0.5) });
  if (room.cap === 1) list.push({ depth: 6.6, draw: () => bed('sofa', 4.95, 0.25, room.bed, asleep > 0) });
  else {
    list.push({ depth: 6.4, draw: () => bed('bed', 4.9, 0.25, room.bed, asleep > 0) });
    list.push({ depth: 7.5, draw: () => bed('bed', 5.95, 0.25, room.bed, asleep > 1) });
  }
  drawWithPeople(list, world);
}

export function drawAnnex(s: GameState, world: World): void {
  const room = s.rooms.annex;
  shell('annex', 1.6, 2.5, SKY[timeOfDay(s)]);
  if (room.bed === 'wrecked') drawSprite('mess', 2.2, 2.8);
  drawWithPeople(
    [
      { depth: 1.9, draw: () => bed('bed', 0.3, 0.25, room.bed, sleeping(world, 'annex') > 0) },
      ...(room.minibar ? [{ depth: 2.4, draw: () => drawSprite('minibar', 1.95, 0.5) }] : []),
      {
        depth: 3.6,
        draw: () => {
          drawSprite('nightstand', 3.1, 0.5);
          if (paymentWaits(s, 'annex')) drawSprite('coins', 3.1, 0.5, 21);
        },
      },
    ],
    world,
  );
}
