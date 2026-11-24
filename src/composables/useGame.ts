// Единственный экземпляр игры: связывает чистую логику (functions), мир с персонажами и интерфейс.
import { reactive, ref, shallowRef, toRaw } from 'vue';
import { BALANCE, DEFAULT_AD } from '@/data/balance';
import { getObstacles } from '@/data/obstacles';
import { DOOR_OUTSIDE, SPAWN, VIEW } from '@/data/scenes';
import type { UpgradeId } from '@/data/upgrades';
import { findBooking, makeBookings } from '@/functions/bookings';
import { SITES } from '@/data/rooms';
import { buildCabin } from '@/functions/build';
import { followPlayer, viewOf } from '@/functions/camera';
import { clamp, project, unproject } from '@/functions/iso';
import { createHelper, stepHelper } from '@/functions/helper';
import {
  advanceMorning, clearBed, collectPayment, cookDinner, giveKey, makeBed, repairRoom, startMorning, waitAtDoor,
} from '@/functions/night';
import { createState, loadState, saveState } from '@/functions/state';
import { getHotspots, getTasks } from '@/functions/tasks';
import { buyUpgrade, hasAffordableUpgrade } from '@/functions/upgrades';
import { createPlayer, placeGuests, sendAway, sendToBed, stepActor } from '@/functions/world';
import type { GameState, Rng, RoomClass, RoomId, SceneId } from '@/models/game';
import type { Action, Hotspot, Modal, StageLabel, Task } from '@/models/ui';
import type { World } from '@/models/world';

const saved = loadState();
const state = reactive<GameState>(saved ?? createState());
const world: World = {
  player: createPlayer(state.scene),
  helper: state.helper ? createHelper() : null,
  guests: placeGuests(state),
  nightTimer: 0,
  waits: {},
  cam: { x: 0, y: 0 },
};
followPlayer(world, true);

const toast = ref('');
const modal = ref<Modal | null>(null);
const fading = ref(false);
const labels = shallowRef<StageLabel[]>([]);

/** для тестов: заранее заданные броски случайных событий */
const forcedRolls: number[] = [];
const rng: Rng = () => forcedRolls.shift() ?? Math.random();

const commit = (): void => saveState(toRaw(state));

let toastTimer = 0;
function showToast(text: string): void {
  toast.value = text;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.value = ''), 3500);
}

function newGame(): void {
  Object.assign(state, createState());
  world.player = createPlayer(state.scene);
  world.helper = null;
  world.guests = placeGuests(state);
  followPlayer(world, true);
  modal.value = null;
  commit();
}

function go(scene: SceneId, x: number, y: number): void {
  const p = world.player;
  p.scene = state.scene = scene;
  p.x = x;
  p.y = y;
  p.path = [];
  p.then = null;
  followPlayer(world, true);
  commit();
}

function busy(seconds: number, done: () => void): void {
  world.player.busy = { t: 0, d: seconds, done };
}

function postAd(text: string): void {
  state.adText = text.trim() || DEFAULT_AD;
  makeBookings(state);
  world.guests = placeGuests(state);
  modal.value = null;
  commit();
  showToast('Объявление висит. Гости уже едут!');
}

/** После каждого шага утренней уборки проверяем, не пора ли выпускать пару или начинать новый день. */
function afterCleaning(): void {
  const step = advanceMorning(state, rng);
  if (step.type === 'lateLeft') world.guests = sendAway(world.guests, step.booking, state.day);
  if (step.type === 'newDay') world.guests = placeGuests(state);
  commit();
  if (step.type === 'none') return;
  showToast(step.message);
  // меню само открывается только на первых двух улучшениях; дальше игрок решает сам, кнопка подсвечивается
  if (step.type === 'newDay' && !state.won && hasAffordableUpgrade(state)) modal.value = { type: 'upgrades' };
}

function runTask(task: Task): void {
  const room = task.room ?? 'home';
  const booking = findBooking(state, room);
  switch (task.kind) {
    case 'ad':
      modal.value = { type: 'ad' };
      break;
    case 'makeBed':
    case 'cook':
    case 'strip':
    case 'repair':
      busy(BALANCE.duration[task.kind], () => finishWork(task));
      break;
    case 'giveKey':
      if (!booking) break;
      giveKey(state, booking);
      sendToBed(world.guests, booking);
      commit();
      showToast('Ключ отдан. Дверь закрыта до утра.');
      break;
    case 'collect': {
      const bill = booking && collectPayment(state, booking);
      if (!bill) break;
      commit();
      modal.value = { type: 'bill', bill };
      break;
    }
  }
}

/** Результат работы, которая занимает время. Её может закончить и хозяин, и помощник. */
function finishWork(task: Task): void {
  const room = task.room ?? 'home';
  if (task.kind === 'makeBed') makeBed(state, room);
  else if (task.kind === 'cook') {
    cookDinner(state);
    showToast('Ужин готов!');
  } else if (task.kind === 'strip' || task.kind === 'repair') {
    if (task.kind === 'repair') repairRoom(state, room);
    else clearBed(state, room);
    afterCleaning();
    return;
  }
  commit();
}

function runAction(action: Action): void {
  switch (action.type) {
    case 'task':
      runTask(action.task);
      break;
    case 'enter':
      go(action.room, ...SPAWN[action.room]);
      break;
    case 'exit':
      go('out', ...DOOR_OUTSIDE[action.from]);
      break;
    case 'locked':
      showToast('Занято — ключ у гостей.');
      break;
    case 'boardInfo':
      showToast(`«${state.adText}»`);
      break;
  }
}

function closeBill(): void {
  modal.value = null;
  afterCleaning();
}

function buy(id: UpgradeId): void {
  const result = buyUpgrade(state, id);
  if (!result) return;
  if (result.booked) arrive(result.booked);
  commit();
  if (id === 'helper') world.helper = createHelper();
  if (id === 'bed') {
    modal.value = null;
    showToast(result.booked ? 'Две кровати! Едет пара — застели.' : 'Две кровати! Пара приедет завтра.');
  } else if (id !== 'annex') {
    // меню остаётся открытым: видно, что куплено и на что ещё хватает
    if (id === 'helper') showToast('Помощник нанят!');
  } else {
    modal.value = {
      type: 'message',
      title: '🏠 Пристройка готова!',
      lines: ['Теперь у тебя два номера. У каждого свой ключ.'],
      ok: 'Дальше',
    };
  }
}

/** Новые гости одного номера выходят на дорогу; остальные остаются там, где были. */
function arrive(room: RoomId): void {
  world.guests = world.guests.filter((g) => g.booking !== room).concat(placeGuests(state).filter((g) => g.booking === room));
}

/** Стройка домика на свободном участке. */
function build(plot: RoomId, cls: RoomClass): void {
  const result = buildCabin(state, plot, cls);
  if (!result) return;
  if (result.booked) arrive(plot);
  commit();
  modal.value = null;
  showToast(result.booked ? 'Домик построен! Гости уже едут — застели.' : 'Домик построен! Гости приедут завтра.');
}

function toMorning(): void {
  fading.value = true;
  window.setTimeout(() => {
    const morning = startMorning(state, rng);
    for (const b of morning.left) world.guests = sendAway(world.guests, b, state.day);
    commit();
    fading.value = false;
    showToast(morning.message);
  }, 700);
}

const hotspots = (): Hotspot[] => getHotspots(state, world.player.scene);

let marked: Hotspot[] = [];

/** Подписи над целями меняются редко, поэтому обновляем ref только при изменении. */
function syncLabels(marks: Hotspot[]): void {
  const sc = viewOf(world.player.scene, world.cam);
  marked = marks;
  const next = marks.map((h) => {
    const p = project(sc, h.x, h.y, h.z);
    const x = (p[0] / VIEW.w) * 100;
    const y = ((p[1] - 13) / VIEW.h) * 100;
    // цель за краем экрана прижимаем к краю со стрелкой — по подписи можно кликнуть и пойти туда
    const edge = x < 4 || x > 96 || y < 12 || y > 92;
    const text = edge ? (x > 96 ? `${h.label} →` : x < 4 ? `← ${h.label}` : `${h.label}`) : (h.label ?? '');
    return { text, left: `${clamp(x, 9, 91).toFixed(3)}%`, top: `${clamp(y, 16, 88).toFixed(3)}%`, edge };
  });
  if (JSON.stringify(next) !== JSON.stringify(labels.value)) labels.value = next;
}

const obstacles = (scene: SceneId) => getObstacles(state, scene);

/** Шаг симуляции. Возвращает отмеченные цели для отрисовки стрелок. */
function update(dt: number): Hotspot[] {
  const p = world.player;
  if (p.busy) {
    p.busy.t += dt;
    if (p.busy.t >= p.busy.d) {
      const done = p.busy.done;
      p.busy = null;
      done();
    }
  } else {
    stepActor(p, dt, obstacles);
    if (!p.path.length && p.then) {
      const then = p.then;
      p.then = null;
      then();
    }
  }
  if (world.helper) {
    stepActor(world.helper, dt, obstacles);
    const done = stepHelper(world.helper, getTasks(state), dt);
    if (done) finishWork(done);
  }
  for (const g of world.guests) stepActor(g, dt, obstacles);
  world.guests = world.guests.filter((g) => !g.gone);

  for (const b of state.bookings) {
    if (b.stage === 'door') {
      const waited = (world.waits[b.room] = (world.waits[b.room] ?? 0) + dt);
      if (waitAtDoor(state, b, waited)) {
        commit();
        showToast(`${SITES[b.room].title}: заждались ключа — будет скидка.`);
      }
    } else world.waits[b.room] = 0;
    if (b.stage !== 'coming') continue;
    const group = world.guests.filter((g) => g.booking === b.id);
    if (group.length && group.every((g) => !g.path.length)) {
      b.stage = 'door';
      commit();
    }
  }
  if (state.phase === 'night' && world.guests.every((g) => g.lying) && !fading.value) {
    world.nightTimer += dt;
    if (world.nightTimer > BALANCE.nightPause) {
      world.nightTimer = 0;
      toMorning();
    }
  } else world.nightTimer = 0;

  followPlayer(world);
  const marks = p.busy ? [] : hotspots().filter((h) => h.mark);
  syncLabels(marks);
  return marks;
}

/** Клик по сцене в логических координатах: ближайшая точка действия или просто идти. */
function click(mx: number, my: number): void {
  const p = world.player;
  if (p.busy || fading.value) return;
  const sc = viewOf(p.scene, world.cam);
  let best: Hotspot | null = null;
  let bestDist = (24 * sc.tw) / 32;
  for (const h of hotspots()) {
    const pt = project(sc, h.x, h.y, h.z * 0.5);
    const d = Math.hypot(pt[0] - mx, pt[1] - my) - (h.mark ? 6 : 0);
    if (d < bestDist) {
      bestDist = d;
      best = h;
    }
  }
  if (best) {
    walkTo(best);
    return;
  }
  const [x, y] = unproject(sc, mx, my);
  p.path = [{ x: clamp(x, sc.minx, sc.maxx), y: clamp(y, sc.miny, sc.maxy) }];
  p.then = null;
}

function walkTo(h: Hotspot): void {
  world.player.path = [{ x: h.ax, y: h.ay }];
  world.player.then = () => runAction(h.action);
}

export function useGame() {
  return {
    state, world, toast, modal, fading, labels, forcedRolls,
    update, click, hotspots, walkTo,
    /** клик по подписи: идти к этой цели, даже если она за краем экрана */
    goToLabel: (i: number) => {
      if (marked[i] && !world.player.busy && !fading.value) walkTo(marked[i]);
    }, postAd, buy, build, closeBill, newGame,
    openBuild: () => (modal.value = { type: 'build' }),
    openUpgrades: () => (modal.value = { type: 'upgrades' }),
    askNewGame: () => (modal.value = { type: 'confirmNew' }),
    openLedger: () => (modal.value = { type: 'ledger' }),
    closeModal: () => (modal.value = null),
  };
}
