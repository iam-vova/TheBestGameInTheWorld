import type { RoomClass, RoomId } from '@/models/game';

export const ROOM_IDS: RoomId[] = ['home', 'annex', 'cabin1', 'cabin2'];

export interface RoomSite {
  title: string;
  /** в середине предложения: «ключ у гостя (домик 1)» */
  name: string;
  /** клетка и размеры постройки на карте, высота стен */
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  /** дверь на передней стене */
  doorX: number;
  /** планировка интерьера */
  interior: 'home' | 'cabin';
  /** строится игроком через меню стройки */
  buildable: boolean;
}

const cabin = (title: string, x: number, buildable: boolean): RoomSite => ({
  title, name: title.toLowerCase(), x, y: 3.5, w: 2.5, d: 2.5, h: 28, doorX: x + 1.25, interior: 'cabin', buildable,
});

export const SITES: Record<RoomId, RoomSite> = {
  home: { title: 'Номер в доме', name: 'номер в доме', x: 4, y: 2, w: 5, d: 4, h: 34, doorX: 6.5, interior: 'home', buildable: false },
  annex: cabin('Пристройка', 10, false),
  cabin1: cabin('Домик 1', 14, true),
  cabin2: cabin('Домик 2', 17.5, true),
};

/** все двери выходят на одну линию */
export const FRONT_Y = 6;

/** где гость ждёт ключ у своей двери */
export const waitSpot = (r: RoomId, i: number): [number, number] =>
  r === 'home' ? [7.4 + i * 0.7, 6.9] : [SITES[r].doorX + 0.65 + i * 0.6, 6.9];

export interface RoomClassInfo {
  title: string;
  text: string;
  price: number;
  rate: number;
  cap: number;
}

/** Три класса жилья для домиков. Цена подобрана так, чтобы окупаться за 5–6 занятых ночей: при более дешёвых домиках весь отель покупается за неделю. */
export const ROOM_CLASSES: Record<RoomClass, RoomClassInfo> = {
  economy: { title: 'Эконом', text: 'Компактная комната с одной кроватью. Проще всего окупить.', price: 160, rate: 30, cap: 1 },
  standard: { title: 'Стандарт', text: 'Комната на двоих с местом для отдыха.', price: 300, rate: 55, cap: 2 },
  premium: { title: 'Премиум', text: 'Просторный номер на двоих. Самая высокая плата за ночь.', price: 500, rate: 90, cap: 2 },
};
export const CLASS_IDS: RoomClass[] = ['economy', 'standard', 'premium'];
