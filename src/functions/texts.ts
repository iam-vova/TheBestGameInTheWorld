import type { GameState } from '@/models/game';

export type TimeOfDay = 'day' | 'eve' | 'night' | 'morn';

export const timeOfDay = (s: GameState): TimeOfDay =>
  (({ ad: 'day', arrive: 'eve', night: 'night', morning: 'morn' }) as const)[s.phase];

export const TIME_ICON: Record<TimeOfDay, string> = { day: '☀️', eve: '🌙', night: '🌙', morn: '☀️' };

export const dayNumber = (s: GameState): number => s.day + (s.phase === 'morning' ? 1 : 0);

/** Одна короткая строка: что делать прямо сейчас. */
export function goalText(s: GameState): string {
  const R = s.rooms;
  const B = s.bookings;
  if (s.phase === 'ad') return R.home.bed === 'bare' ? 'Застели диван и повесь объявление' : 'Повесь объявление';
  if (s.phase === 'arrive') {
    if (B.some((b) => b.stage === 'door' && R[b.room].bed !== 'made')) return 'Гости ждут — застели постель';
    if (s.kitchen && !s.dinnerReady) return 'Приготовь ужин';
    if (B.some((b) => b.stage === 'door')) return 'Отдай ключ';
    return B.some((b) => R[b.room].bed !== 'made') ? 'Застели постель' : 'Встреть гостей';
  }
  if (s.phase === 'night') return 'Ночь…';
  return B.some((b) => b.stage === 'sleep') ? 'Убери свободные номера' : 'Забери оплату и сними бельё';
}
