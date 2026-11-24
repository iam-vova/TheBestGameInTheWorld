import type { GameState, RoomId } from '@/models/game';
import { BALANCE } from './balance';
import { ROOM_IDS, SITES } from './rooms';

export type UpgradeId = 'bed' | 'annex' | 'helper' | 'kitchen' | `minibar_${RoomId}`;

export interface Upgrade {
  id: UpgradeId;
  icon: string;
  title: (s: GameState) => string;
  /** что изменится после покупки — показывается до неё */
  text: (s: GameState) => string;
  price: (s: GameState) => number;
  need?: UpgradeId;
  /** улучшение конкретного номера: показывается, когда номер построен */
  room?: RoomId;
  done: (s: GameState) => boolean;
}

const pct = (v: number): string => `${Math.round(v * 100)}%`;
const { chance, price, sale } = BALANCE.minibar;
const MAX_BAR = price.length;

function minibar(room: RoomId): Upgrade {
  const where = SITES[room].name;
  const level = (s: GameState) => s.rooms[room].minibar;
  return {
    id: `minibar_${room}`,
    icon: '🍾',
    title: (s) => `Мини-бар · ${where} ${'●'.repeat(level(s))}${'○'.repeat(MAX_BAR - level(s))}`,
    text: (s) =>
      level(s) < MAX_BAR
        ? `+${sale} к счёту · шанс ${pct(chance[level(s)])} → ${pct(chance[level(s) + 1])}`
        : `+${sale} к счёту · шанс ${pct(chance[MAX_BAR])}`,
    price: (s) => price[level(s)] ?? 0,
    need: 'annex',
    room,
    done: (s) => level(s) >= MAX_BAR,
  };
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'bed',
    icon: '🛏️',
    title: () => 'Вторая кровать',
    text: () => 'Номер на двоих: 30 → 50 за ночь',
    price: () => 30,
    done: (s) => s.rooms.home.cap === 2,
  },
  {
    id: 'annex',
    icon: '🏠',
    title: () => 'Пристройка',
    text: () => 'Второй номер: +30 за ночь',
    price: () => 50,
    need: 'bed',
    done: (s) => s.rooms.annex.built,
  },
  {
    id: 'helper',
    icon: '🧹',
    title: () => 'Помощник',
    text: () => `Стелет, убирает, готовит · −${BALANCE.helperWage} за ночь`,
    price: () => 150,
    need: 'annex',
    done: (s) => s.helper,
  },
  {
    id: 'kitchen',
    icon: '🍲',
    title: () => 'Летняя кухня',
    text: () => `Ужин: +${BALANCE.dinnerFee} с гостя`,
    price: () => 300,
    need: 'annex',
    done: (s) => s.kitchen,
  },
  ...ROOM_IDS.map(minibar),
];
