import type { GameState, RoomId } from '@/models/game';
import { BALANCE } from './balance';

export type UpgradeId = 'bed' | 'annex' | 'helper' | 'kitchen' | 'minibar_home' | 'minibar_annex';

export interface Upgrade {
  id: UpgradeId;
  title: (s: GameState) => string;
  /** что изменится после покупки — показывается до неё */
  text: (s: GameState) => string;
  price: (s: GameState) => number;
  need?: UpgradeId;
  done: (s: GameState) => boolean;
}

const pct = (v: number): string => `${Math.round(v * 100)}%`;
const { chance, price, sale } = BALANCE.minibar;
const MAX_BAR = price.length;

function minibar(room: RoomId, where: string): Upgrade {
  const level = (s: GameState) => s.rooms[room].minibar;
  return {
    id: `minibar_${room}`,
    title: (s) => `Мини-бар · ${where} (уровень ${level(s)} из ${MAX_BAR})`,
    text: (s) =>
      level(s) < MAX_BAR
        ? `Шанс покупки за занятую ночь: ${pct(chance[level(s)])} → ${pct(chance[level(s) + 1])}. Покупка добавляет к счёту ${sale} монет.`
        : `Шанс покупки за занятую ночь ${pct(chance[MAX_BAR])}, покупка добавляет ${sale} монет.`,
    price: (s) => price[level(s)] ?? 0,
    need: 'annex',
    done: (s) => level(s) >= MAX_BAR,
  };
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'bed',
    title: () => 'Второе спальное место',
    text: () => 'Диван → две кровати. Номер в доме принимает пару: 30 → 50 за ночь.',
    price: () => 30,
    done: (s) => s.rooms.home.cap === 2,
  },
  {
    id: 'annex',
    title: () => 'Одноместная пристройка',
    text: () => 'Второй номер с отдельным входом, +30 за ночь. Отель на трёх человек.',
    price: () => 50,
    need: 'bed',
    done: (s) => s.rooms.annex.built,
  },
  {
    id: 'helper',
    title: () => 'Помощник',
    text: () => 'Сам стелет постели, убирает номера после выезда и готовит на кухне. Ключи и оплата остаются за тобой.',
    price: () => 50,
    need: 'annex',
    done: (s) => s.helper,
  },
  {
    id: 'kitchen',
    title: () => 'Летняя кухня и ужины',
    text: () => `Приготовь ужин до заселения и передай вместе с ключом: +${BALANCE.dinnerFee} монет с гостя.`,
    price: () => 40,
    need: 'annex',
    done: (s) => s.kitchen,
  },
  minibar('home', 'номер в доме'),
  minibar('annex', 'пристройка'),
];
