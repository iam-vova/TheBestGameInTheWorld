import { HOTSPOTS } from '@/data/hotspots';
import type { GameState, SceneId } from '@/models/game';
import type { Hotspot, HotspotId, Task, TaskKind } from '@/models/ui';
import { ROOM_IDS, isLocked } from './bookings';
import { canGiveKey } from './night';

/** Всё, что хозяин может сделать сейчас, по всем сценам. */
export function getTasks(s: GameState): Task[] {
  const tasks: Task[] = [];
  const add = (kind: TaskKind, hotspot: HotspotId, label: string, room?: Task['room']) =>
    tasks.push({ kind, hotspot, label, room });
  const bedSpot = (r: Task['room']): HotspotId => (r === 'home' ? 'hbed' : 'abed');

  if (s.phase === 'ad') add('ad', 'board', 'Написать объявление');
  // Застелить можно в любой момент, когда номер свободен и убран — в том числе утром, сразу после выезда.
  if (s.phase !== 'night') {
    for (const r of ROOM_IDS) {
      const room = s.rooms[r];
      if (room.built && room.bed === 'bare' && !isLocked(s, r)) {
        add('makeBed', bedSpot(r), r === 'home' && room.cap === 1 ? 'Застелить диван' : 'Застелить постель', r);
      }
    }
  }
  if (s.phase === 'arrive') {
    // ужин готовят до заселения: он уходит гостям вместе с ключом
    if (s.kitchen && !s.dinnerReady) add('cook', 'stove', 'Приготовить ужин');
    for (const b of s.bookings) {
      const label = s.kitchen && s.dinnerReady ? 'Передать ключ и ужин' : 'Передать ключ';
      if (canGiveKey(s, b)) add('giveKey', b.room === 'home' ? 'hdoor' : 'adoor', label, b.room);
    }
  }
  if (s.phase === 'morning') {
    for (const b of s.bookings) {
      if (b.stage !== 'left') continue;
      const bed = s.rooms[b.room].bed;
      if (!b.paid) add('collect', b.room === 'home' ? 'table' : 'astand', 'Забрать оплату', b.room);
      if (bed === 'used') add('strip', bedSpot(b.room), 'Снять бельё', b.room);
      if (bed === 'wrecked') add('repair', bedSpot(b.room), 'Восстановить номер', b.room);
    }
  }
  return tasks;
}

/** Кликабельные точки текущей сцены: задачи, двери и доска. Метка стоит на том, куда игроку сейчас идти. */
export function getHotspots(s: GameState, scene: SceneId): Hotspot[] {
  const tasks = getTasks(s);
  const here: Hotspot[] = tasks
    .filter((t) => HOTSPOTS[t.hotspot].scene === scene)
    .map((task) => ({ ...HOTSPOTS[task.hotspot], label: task.label, mark: true, action: { type: 'task', task } }));
  const none = here.length === 0;
  const needIn = (r: SceneId) => none && tasks.some((t) => HOTSPOTS[t.hotspot].scene === r);
  const away = none && (tasks.length > 0 || s.phase === 'arrive' || s.phase === 'night');

  if (scene === 'out') {
    for (const r of ROOM_IDS) {
      const door = HOTSPOTS[r === 'home' ? 'hdoor' : 'adoor'];
      const keyHere = tasks.some((t) => t.kind === 'giveKey' && t.room === r);
      if (!s.rooms[r].built || keyHere) continue;
      if (isLocked(s, r)) here.push({ ...door, mark: false, action: { type: 'locked' } });
      else {
        here.push({
          ...door,
          label: r === 'home' ? 'Открыть номер' : 'Открыть пристройку',
          mark: needIn(r),
          action: { type: 'enter', room: r },
        });
      }
    }
    if (s.phase !== 'ad') here.push({ ...HOTSPOTS.board, mark: false, action: { type: 'boardInfo' } });
  } else {
    here.push({
      ...HOTSPOTS[scene === 'home' ? 'hmat' : 'amat'],
      label: 'Выйти',
      mark: away,
      action: { type: 'exit', from: scene },
    });
  }
  return here;
}
