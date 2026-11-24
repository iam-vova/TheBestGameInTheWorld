// Двор: земля, растения и предметы. --params '{"model":"tile|tree|pine|bush|flowers|lamp|mailbox|board|sign|fountain|bench|kitchen", ...}'
const kit = require('./_kit.js');

module.exports = toolkit => ({
  id: 'hotel-yard', name: 'Двор', seed: 5,
  build(seed, { controls = {} } = {}) {
    const { start, px } = kit(toolkit);
    const { S, mat, box, cyl, finish } = start(seed);
    const u = px.out;
    const res = { res: 0.025 };

    if (controls.model === 'ground') {
      // весь двор одной плитой 22 × 12 клеток (размер — как GROUND в src/data/scenes.ts): трава, дорога и грядки
      // полосы не перекрываются и режутся на куски: большие и наложенные плиты библиотека рендерит с дырами
      const lawn = mat.lawn(1);
      const strip = (z0, z1, x0, x1, m) => {
        for (let x = x0; x < x1; x += 3) box(x, Math.min(x + 3, x1), -0.14, 0, z0, z1, m, { res: 0.05 });
      };
      strip(0, 1, 0, 22, lawn);
      strip(1, 5, 0, 3, mat.furrows);
      strip(1, 5, 3, 22, lawn);
      strip(5, 9, 0, 22, lawn);
      strip(9, 11, 0, 22, mat.road);
      strip(11, 12, 0, 22, lawn);
      return finish(40);
    } else if (controls.model === 'tile') {
      // накладные клетки поверх двора: тропинка к двери и земля под стройку; привязка — дальний угол
      box(0, 1, 0, 0.03, 0, 1, controls.kind === 'path' ? mat.cobble : mat.soil, { res: 0.03 });
    } else if (controls.model === 'tree') {
      // лиственное дерево; blossom — в цвету
      const crown = controls.blossom ? mat.blossom : mat.leaf;
      cyl(0, 0, 0, 0.75, 0.11, mat.trunk, { res: 0.025 }, 0.07);
      S.canopy({ at: [0, 1.15, 0], size: [0.62, 0.55, 0.62], lobes: 5, mat: crown, seed: controls.blossom ? 4 : 2, res: 0.035 });
    } else if (controls.model === 'pine') {
      S.pine({ at: [0, 0, 0], h: 2.1, w: 0.5, tiers: 4, mat: mat.needle, trunk: mat.trunk, seed: 3 });
    } else if (controls.model === 'bush') {
      S.canopy({ at: [0, 0.26, 0], size: [0.38, 0.3, 0.38], lobes: 4, mat: mat.leaf, seed: 7, res: 0.03 });
      for (const [x, y, z] of [[0.2, 0.42, 0.2], [-0.05, 0.5, 0.3], [0.3, 0.3, -0.05], [0.05, 0.3, 0.37]]) S.ball([x, y, z], 0.045, mat.red, { res: 0.015 });
    } else if (controls.model === 'flowers') {
      // клумба: каменный бортик, зелень и цветы
      const outer = cyl(0, 0, 0, 0.14, 0.42, mat.stone, { hold: true });
      const inner = cyl(0, 0, 0.05, 0.3, 0.34, mat.stone, { hold: true });
      S.join('cut', outer, inner, { res: 0.025 });
      S.canopy({ at: [0, 0.16, 0], size: [0.32, 0.14, 0.32], lobes: 4, mat: mat.leaf, seed: 5, res: 0.025 });
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4, r = 0.08 + (i % 3) * 0.09;
        S.ball([Math.cos(a) * r, 0.27 + (i % 2) * 0.03, Math.sin(a) * r], 0.055, i % 3 ? mat.blossom : mat.trim, { res: 0.015 });
      }
    } else if (controls.model === 'lamp') {
      cyl(0, 0, 0, 0.08, 0.1, mat.door, res);
      cyl(0, 0, 0.08, u(21), 0.035, mat.door, { res: 0.015 });
      box(-0.09, 0.09, u(21), u(21) + 0.04, -0.09, 0.09, mat.door, res);
      box(-0.07, 0.07, u(21) + 0.04, u(27), -0.07, 0.07, mat.brass, res);
      box(-0.1, 0.1, u(27), u(27) + 0.04, -0.1, 0.1, mat.door, res);
      S.ball([0, u(27) + 0.07, 0], 0.04, mat.door, { res: 0.015 });
    } else if (controls.model === 'mailbox') {
      box(-0.04, 0.04, 0, u(12), -0.04, 0.04, mat.wood, res);
      box(-0.14, 0.14, u(12), u(19), -0.1, 0.16, mat.door, { res: 0.025, rd: 0.03 });
      box(-0.09, 0.09, u(15.5), u(16.5), 0.16, 0.18, mat.ink, { res: 0.015 });
      box(0.14, 0.17, u(15), u(20), 0, 0.05, mat.red, res);
    } else if (controls.model === 'board') {
      // доска объявлений: столб и щит вдоль оси x, листок появляется после расклейки
      box(-0.08, 0.08, 0, u(22), -0.05, 0.11, mat.wood, res);
      box(-0.6, 0.6, u(8), u(25), 0.1, 0.17, mat.wood, res);
      box(-0.53, 0.53, u(9.5), u(23.5), 0.17, 0.19, mat.timber, res);
      if (controls.posted) {
        box(-0.38, 0.38, u(11), u(22), 0.19, 0.21, mat.paper, res);
        for (let i = 0; i < 3; i++) box(-0.28, 0.2 - i * 0.12, u(19 - i * 3), u(19.8 - i * 3), 0.21, 0.22, mat.ink, { res: 0.015 });
      }
    } else if (controls.model === 'sign') {
      box(-0.05, 0.05, 0, u(13), -0.1, 0, mat.wood, res);
      box(-0.36, 0.36, u(8), u(17), 0, 0.05, mat.paper, res);
    } else if (controls.model === 'fountain') {
      // две круглые чаши: кольцо бортика вырезается из цилиндра, внутри тонкий диск воды
      const bowl = (y0, y1, r, wall) => {
        cyl(0, 0, y0, y1 - 0.08, r, mat.stone, { res: 0.035 });
        const outer = cyl(0, 0, y1 - 0.08, y1, r, mat.stone, { hold: true });
        const inner = cyl(0, 0, y1 - 0.2, y1 + 0.1, r - wall, mat.stone, { hold: true });
        S.join('cut', outer, inner, { res: 0.03 });
        cyl(0, 0, y1 - 0.1, y1 - 0.045, r - wall + 0.01, mat.water, { res: 0.03 });
      };
      bowl(0, u(6), 0.78, 0.12);
      cyl(0, 0, u(4), u(13), 0.13, mat.stone, { res: 0.03 });
      bowl(u(12), u(16.5), 0.36, 0.07);
      cyl(0, 0, u(15), u(21), 0.06, mat.stone, { res: 0.02 });
      S.ball([0, u(21.5), 0], 0.09, mat.stone, { res: 0.02 });
    } else if (controls.model === 'bench') {
      for (const x of [-0.55, 0.48]) for (const z of [-0.25, 0.18]) box(x, x + 0.08, 0, u(5), z, z + 0.08, mat.trim, res);
      box(-0.6, 0.6, u(5), u(6.5), -0.3, 0.27, mat.lilac, res);
      for (const x of [-0.58, 0.5]) box(x, x + 0.08, u(6.5), u(14), -0.3, -0.23, mat.trim, res);
      for (const y of [8.5, 11.5]) box(-0.6, 0.6, u(y), u(y + 2), -0.3, -0.24, mat.lilac, res);
    } else {
      // летняя кухня: тумба с плитой и кастрюлей под навесом на двух столбах
      const top = u(13);
      box(-0.6, 0.7, 0, top, -0.4, 0.3, mat.plasterWall, { res: 0.03 });
      box(-0.64, 0.74, top, top + 0.05, -0.44, 0.34, mat.trim, { res: 0.03 });
      box(-0.5, -0.05, top + 0.05, top + 0.08, -0.3, 0.15, mat.metal, res);
      cyl(-0.27, -0.07, top + 0.08, top + 0.3, 0.15, mat.metal, res);
      box(-0.44, -0.1, top + 0.22, top + 0.25, -0.09, -0.05, mat.metal, { res: 0.02 });
      box(0.2, 0.55, top + 0.05, top + 0.09, -0.25, 0.1, mat.wood, res);        // разделочная доска
      for (const x of [-0.58, 0.6]) box(x, x + 0.08, top, u(43), -0.4, -0.32, mat.door, res);
      box(-0.75, 0.85, u(43), u(46), -0.55, 0.45, mat.roofTiles, { res: 0.03 });
      for (let i = 0; i < 6; i++) box(-0.75 + i * 0.27, -0.61 + i * 0.27, u(40), u(43), 0.42, 0.45, i % 2 ? mat.trim : mat.roof, res);
    }
    return finish();
  },
});
