// Общее для всех моделей: палитра, свет, камера в проекции игры и короткие помощники.
// Соглашения: 1 единица = 1 клетка; X — ось x игры, Z — ось y игры, Y — вверх.
// Точка привязки спрайта — начало координат модели: камера смотрит в (0,0,0).
const PALETTE = {
  ink: [0x1b1420],
  plaster: [0xb86f8c, 0xde93ab, 0xf2b3c6, 0xf9d3de],
  roof: [0x3d2466, 0x5f3a80, 0x7c4fa3, 0x9a6fc0],
  door: [0x2e1a40, 0x4a2b63, 0x6a418c],
  glass: [0x4f7f95, 0x8fc6da, 0xd7f0f5],
  trim: [0xd9c9d6, 0xf3ead8, 0xffffff],
  brass: [0xb8860b, 0xe9c46a, 0xffe27a],
  wood: [0x5e3d22, 0x85592f, 0xa9743f, 0xc99562],
  linen: [0xb5ab98, 0xd6cfbf, 0xefe6d2, 0xfbf7ec],
  blanket: [0x4a2b63, 0x6a418c, 0x8b5cb3, 0xa98ad0],
  floor: [0x8f6a3c, 0xa9793f, 0xbf9159, 0xd3a56c],
  wall: [0xd892ac, 0xeeb3c5, 0xf8cfda, 0xfde4ea],
  stone: [0xa86a82, 0xc98ea3, 0xe6b3c3, 0xf6d2dc],
  water: [0x3d93b5, 0x7cc7e0, 0xc2ecf5],
  metal: [0x3a3340, 0x77778a, 0xb9b9c6],
  timber: [0x6b4a2b, 0x946c42, 0xb98a58, 0xd9b48a],
  brownRoof: [0x3d2a1a, 0x5a3d24, 0x7d5a36, 0x9c7446],
  marble: [0xb9a898, 0xd8c9b8, 0xefe4d8, 0xfbf5ee],
  deepRoof: [0x22103f, 0x3d2466, 0x52328a, 0x6a44ad],
  skin: [0xc99a78, 0xe0b890, 0xf0c8a0],
  hair: [0x2a1a10, 0x3a2416, 0x5a3a22],
  paper: [0xc9b888, 0xe9d8a8, 0xfbf3d8],
  rug: [0x5a3378, 0x6a418c, 0x8b5cb3],
  lilac: [0x8468ad, 0x9a7cc0, 0xb99ad6, 0xd2bde8],
  mat: [0x5a4028, 0x7a5a3a, 0x94704a],
  green: [0x2f5a26, 0x417733, 0x6fae4a],
  red: [0x8f2e22, 0xb03a2a, 0xd94f3a],
  gold: [0xb8860b, 0xd9a520, 0xffd35a, 0xffe9a0],
  grass: [0x4f9a3a, 0x6cb53f, 0x86c94f, 0xa6dc6a],
  sand: [0xa9824e, 0xc39c63, 0xd6b47c, 0xe6cb98],
  pathStone: [0x9c8a74, 0xb7a48c, 0xcfc0a8, 0xe6dcc8],
  soil: [0x6b4a2b, 0x86603a, 0x9c7648, 0xb08a5a],
  leaf: [0x2a5f2a, 0x3f8a36, 0x5aa845, 0x7cc45a],
  blossom: [0xd97fa6, 0xf0a3c0, 0xf9c6d8, 0xfde3ec],
  trunk: [0x4a3220, 0x6b4a2b, 0x86603a],
  needle: [0x1f4a3a, 0x2c6650, 0x3f8468, 0x5aa080],
};

const colors = [];
const ramp = {};
for (const [name, list] of Object.entries(PALETTE)) {
  ramp[name] = list.map((c, i) => colors.length + i);
  colors.push(...list);
}

/** высота в логических пикселях игры → единицы модели: во дворе клетка 32 px, в комнате 48 px */
const COS30 = Math.cos(Math.PI / 6);
const px = { out: v => v / ((32 / Math.SQRT2) * COS30), room: v => v / ((48 / Math.SQRT2) * COS30) };

module.exports = ({ makeBuilder, makeSculpt, KIT: K }) => {
  function start(seed) {
    const B = makeBuilder(seed, colors);
    const S = K.sculpt(makeSculpt(B));
    S.pixel = true;
    S.pixelSize(26);
    // один свет на все модели: левая передняя стена светлее правой
    S.sun = K.V.norm([0.35, 0.9, 0.55]);
    S.amb = 0.5;
    S.sunK = 0.6;
    S.sky = 0.2;
    const r = name => ({ r: ramp[name] });
    const mat = {
      ...Object.fromEntries(Object.keys(ramp).map(n => [n, r(n)])),
      plasterWall: K.pixel.masonry({ r: ramp.plaster, stone: [22, 9], joint: 0, vary: 0.12, seed: 5 }),
      marbleWall: K.pixel.masonry({ r: ramp.marble, stone: [16, 10], joint: 1, vary: 0.1, seed: 8 }),
      timberWall: K.pixel.planks({ r: ramp.timber, width: 5, along: 'x', seed: 3 }),
      roofTiles: K.pixel.tiles({ r: ramp.roof, tile: [7, 5], seed: 9 }),
      brownTiles: K.pixel.tiles({ r: ramp.brownRoof, tile: [7, 5], seed: 9 }),
      deepTiles: K.pixel.tiles({ r: ramp.deepRoof, tile: [6, 4], seed: 9 }),
      doorPlanks: K.pixel.planks({ r: ramp.door, width: 3, along: 'y', seed: 2 }),
      woodPlanks: K.pixel.planks({ r: ramp.wood, width: 4, along: 'x', seed: 6 }),
      floorPlanks: K.pixel.planks({ r: ramp.floor, width: 6, along: 'x', seed: 4 }),
      paving: K.pixel.masonry({ r: ramp.stone, stone: [9, 6], joint: 1, vary: 0.2, seed: 7 }),
      lawn: seed => K.pixel.lawn({ r: ramp.grass, tufts: 0.2, cell: 6, patch: 2.4, flowers: [[ramp.blossom[2], 0.03], [ramp.trim[2], 0.02]], seed }),
      road: K.pixel.masonry({ r: ramp.sand, stone: [14, 9], joint: 0, vary: 0.35, seed: 12 }),
      cobble: K.pixel.masonry({ r: ramp.pathStone, stone: [7, 5], joint: 1, vary: 0.3, seed: 14 }),
      furrows: K.pixel.planks({ r: ramp.soil, width: 5, along: 'x', seed: 16 }),
    };
    /** коробка по границам */
    const box = (x0, x1, y0, y1, z0, z1, m, o = {}) =>
      S.box([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], [(x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2], m, { res: 0.04, ...o });
    /** вертикальный цилиндр или усечённый конус */
    const cyl = (x, z, y0, y1, r0, m, o = {}, r1 = r0) => S.lathe([x, y0, z], y1 - y0, [r0, r1], m, { res: 0.04, ...o });
    /** вальмовая крыша над прямоугольником: свес, высота конька, конёк от 30 до 70 % длины */
    function hipRoof(x0, x1, z0, z1, y, rise, over, m, res = 0.05) {
      const c = [(x0 + x1) / 2, y, (z0 + z1) / 2];
      const w = x1 - x0;
      const runZ = (z1 - z0) / 2 + over;
      const runX = w * 0.3 + over;
      const n = K.V.norm;
      const plane = (nv, p) => ({ n: n(nv), d: K.V.dot(n(nv), [p[0] - c[0], p[1] - c[1], p[2] - c[2]]) });
      const solid = S.poly(c, [
        plane([0, runZ, rise], [c[0], y, z1 + over]),
        plane([0, runZ, -rise], [c[0], y, z0 - over]),
        plane([rise, runX, 0], [x1 + over, y, c[2]]),
        plane([-rise, runX, 0], [x0 - over, y, c[2]]),
        { n: [0, -1, 0], d: 0 },
      ], m, { res });
      // библиотека считает область выборки грани по ближайшему ребру и оставляет дыры на длинных скатах
      for (const f of solid.faces) f.r = Math.max(w, z1 - z0);
    }
    const finish = (radius = 12) => {
      S.bake();
      return B.finish({
        cam: { target: [0, 0, 0], dist: 14, pitch: Math.PI / 6, yaw: Math.PI / 4, ortho: true },
        detail: 18, dither: 0.1, radius, look: { pixel: true, native: true, clean: false },
      });
    };
    return { B, S, K, mat, box, cyl, hipRoof, finish };
  }
  return { start, px };
};
