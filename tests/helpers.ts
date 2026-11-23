import { advanceMorning, clearBed, collectPayment, giveKey, makeBed, startMorning } from '@/functions/night';
import type { GameState, Rng } from '@/models/game';

/** Проигрывает одну ночь целиком: заселение, утро, оплата, уборка — до начала следующего дня. */
export function playNight(s: GameState, rng: Rng = () => 0.99): void {
  for (const b of s.bookings) {
    b.stage = 'door';
    makeBed(s, b.room);
    giveKey(s, b);
  }
  startMorning(s, rng);
  const day = s.day;
  for (let guard = 0; s.day === day && guard < 10; guard++) {
    for (const b of s.bookings) {
      if (b.stage !== 'left') continue;
      collectPayment(s, b);
      clearBed(s, b.room);
    }
    advanceMorning(s, rng);
  }
}
