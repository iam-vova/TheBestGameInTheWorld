/** Числа баланса в одном месте. */
export const BALANCE = {
  /** случайные события включаются с этой ночи */
  eventsFromDay: 3,
  /** пороги броска: [0, party) вечеринка, [party, tidy) убрали сами, [tidy, tip) чаевые */
  eventRoll: { party: 0.1, tidy: 0.25, tip: 0.5 },
  tip: 10,
  storyTip: 20,
  /** с какой ночи может начаться история Анны и Марка */
  storyFromDay: 4,
  /** сколько секунд занимают действия хозяина */
  duration: { makeBed: 1.2, strip: 1, repair: 3, cook: 2 },
  /** пауза перед наступлением утра, когда все легли */
  nightPause: 1.6,
  /** доплата за ужин с одного гостя */
  dinnerFee: 10,
  /** мини-бар: шанс покупки за занятую ночь по уровням 0..3, цена следующего уровня, доплата за покупку */
  minibar: { chance: [0, 0.2, 0.35, 0.5], price: [30, 40, 60], sale: 10 },
};

export const DEFAULT_AD = 'Сдам место на ночь';
export const SAVE_KEY = 'farm-hotel-proto-v4';
