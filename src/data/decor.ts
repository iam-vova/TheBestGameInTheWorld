import type { SceneSprite } from './sceneSprites';

/** декор двора: [спрайт, x, y] */
export const DECOR: [SceneSprite, number, number][] = [
  ['lamp', 8.6, 8.5],
  ['lamp', 1.6, 8.5],
  ['flowers', 4.6, 6.5],
  ['flowers', 8.4, 6.5],
  ['bench', 9.6, 7.2],
  ['bush', 13.2, 11.3],
  ['bush', 0.7, 11.4],
  ['mailbox', 5.2, 8.7],
  ['fountain', 1.5, 7.1],
  ['lamp', 13.4, 8.5],
  ['lamp', 20.6, 8.5],
  ['flowers', 16.9, 6.6],
  ['bush', 21.2, 11.4],
];
/** деревья: [клетка x, клетка y, вид] */
export const TREES: [number, number, SceneSprite][] = [
  [0, 5.2, 'tree_blossom'], [3, 0, 'pine'], [13, 1, 'tree'], [9, 0.5, 'pine'], [13, 3.4, 'tree_blossom'],
  [16, 0.6, 'tree'], [20.4, 1.2, 'pine'], [21, 6.3, 'tree_blossom'], [1.2, 0.2, 'pine'], [18.6, 0.3, 'tree_blossom'],
];
