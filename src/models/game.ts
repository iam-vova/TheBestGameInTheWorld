// Сохраняемое состояние игры. Всё, что здесь, попадает в localStorage.
export type RoomId = 'home' | 'annex';
export type SceneId = 'out' | RoomId;
export type Phase = 'ad' | 'arrive' | 'night' | 'morning';
export type BedState = 'bare' | 'made' | 'used' | 'wrecked';
export type BookingStage = 'coming' | 'door' | 'sleep' | 'left';
export type NightEvent = 'party' | 'tidy' | 'tip';
export type CastId = 'anna' | 'mark';

export interface Room {
  built: boolean;
  cap: number;
  rate: number;
  bed: BedState;
  /** уровень мини-бара: 0 — не установлен */
  minibar: number;
}

export interface Booking {
  id: RoomId;
  room: RoomId;
  n: number;
  stage: BookingStage;
  paid: boolean;
  /** именные гости из историй; у обычных гостей поля нет */
  cast?: CastId[];
  /** исход случайного события, сохраняется вместе с бронированием */
  ev?: NightEvent;
  tip?: number;
  /** гости получили ужин вместе с ключом */
  dinner?: boolean;
  /** гости что-то купили в мини-баре; исход сохраняется с бронированием */
  bar?: boolean;
}

export interface LedgerEntry {
  t: string;
  d: number;
  b: number;
}

export interface GameState {
  coins: number;
  day: number;
  phase: Phase;
  adText: string;
  posted: boolean;
  rooms: Record<RoomId, Room>;
  bookings: Booking[];
  won: boolean;
  helper: boolean;
  kitchen: boolean;
  /** ужин на сегодняшних гостей приготовлен */
  dinnerReady: boolean;
  /** этап истории Анны и Марка: 0 не началась, 1 приехали порознь, 2 уехали вместе, 3 вернулись парой, 4 закончена */
  story: number;
  storyDay: number;
  scene: SceneId;
  ledger: LedgerEntry[];
}

export type Rng = () => number;
