// Постройки двора. --params '{"model":"house|cabin","cls":"standard|economy|premium"}'
const kit = require('./_kit.js');

module.exports = toolkit => ({
  id: 'hotel-buildings', name: 'Постройки', seed: 3,
  build(seed, { controls = {} } = {}) {
    const { start, px } = kit(toolkit);
    const { S, mat, box, hipRoof, finish } = start(seed);
    const u = px.out;

    /** проём на передней стене (z = d) и на правой (x = w): наличник и заполнение */
    const front = (d, x0, x1, y0, y1, fill, frame, t = 0.05) => {
      box(x0 - 0.07, x1 + 0.07, Math.max(0, y0 - 0.07), y1 + 0.07, d, d + 0.025, frame, { res: 0.035 });
      box(x0, x1, y0, y1, d, d + t, fill, { res: 0.035 });
    };
    const side = (w, z0, z1, y0, y1, fill, frame, t = 0.05) => {
      box(w, w + 0.025, y0 - 0.07, y1 + 0.07, z0 - 0.07, z1 + 0.07, frame, { res: 0.035 });
      box(w, w + t, y0, y1, z0, z1, fill, { res: 0.035 });
    };
    const knob = (x, y, d) => S.ball([x, y, d + 0.07], 0.035, mat.brass, { res: 0.02 });

    if (controls.model === 'cabin') {
      // пристройка и домики 2,5 × 2,5: дверь по центру, окна по бокам от неё — не пересекаются
      const look = {
        standard: { wall: mat.plasterWall, roof: mat.roofTiles, frame: mat.trim, door: mat.doorPlanks },
        economy: { wall: mat.timberWall, roof: mat.brownTiles, frame: mat.wood, door: mat.woodPlanks },
        premium: { wall: mat.marbleWall, roof: mat.deepTiles, frame: mat.brass, door: mat.doorPlanks },
      }[controls.cls || 'standard'];
      const W = 2.5, D = 2.5, H = u(28), wy0 = H * 0.36, wy1 = H * 0.72;
      box(0, W, 0, H, 0, D, look.wall);
      box(-0.04, W + 0.04, 0, 0.1, -0.04, D + 0.04, look.frame);
      box(-0.05, W + 0.05, H - 0.08, H, -0.05, D + 0.05, look.frame);
      hipRoof(0, W, 0, D, H, u(20), 0.3, look.roof);
      front(D, 0.9, 1.6, 0, H * 0.66, look.door, look.frame);
      knob(1.47, H * 0.32, D);
      box(0.8, 1.7, 0, 0.06, D, D + 0.22, look.frame);                       // ступенька
      if (controls.cls === 'economy') front(D, 1.85, 2.3, wy0, wy1, mat.glass, look.frame);
      else for (const x of [0.2, 1.8]) {
        front(D, x, x + 0.5, wy0, wy1, mat.glass, look.frame);
        box(x + 0.23, x + 0.27, wy0, wy1, D, D + 0.06, look.frame, { res: 0.03 });
      }
      side(W, 0.75, 1.5, wy0, wy1, mat.glass, look.frame);
      box(W, W + 0.06, wy0, wy1, 1.105, 1.145, look.frame, { res: 0.03 });
      if (controls.cls === 'premium') {
        box(0.75, 1.75, H * 0.66 + 0.1, H * 0.66 + 0.16, D, D + 0.3, mat.brass); // козырёк
        for (const x of [0.1, W - 0.1]) box(x - 0.06, x + 0.06, 0.1, H - 0.08, D, D + 0.05, mat.brass); // пилястры
      }
      return finish();
    }

    // дом 5 × 4: слева дверь хозяина, по центру дверь номера, справа окно
    const W = 5, D = 4, H = u(34), wy0 = H * 0.34, wy1 = H * 0.7;
    box(0, W, 0, H, 0, D, mat.plasterWall);
    box(-0.04, W + 0.04, 0, 0.12, -0.04, D + 0.04, mat.trim);
    box(-0.05, W + 0.05, H - 0.1, H, -0.05, D + 0.05, mat.trim);
    hipRoof(0, W, 0, D, H, u(24), 0.3, mat.roofTiles);
    for (const [x0, x1] of [[0.5, 1.2], [2.15, 2.85]]) {
      front(D, x0, x1, 0, H * 0.62, mat.doorPlanks, mat.trim);
      knob(x1 - 0.13, H * 0.3, D);
      box(x0 - 0.1, x1 + 0.1, 0, 0.06, D, D + 0.22, mat.trim);
    }
    box(2.0, 3.0, H * 0.62 + 0.1, H * 0.62 + 0.16, D, D + 0.32, mat.roof);    // козырёк над дверью номера
    front(D, 3.75, 4.55, wy0, wy1, mat.glass, mat.trim);
    box(4.13, 4.17, wy0, wy1, D, D + 0.06, mat.trim, { res: 0.03 });
    side(W, 1.2, 2.4, wy0, wy1, mat.glass, mat.trim);
    box(W, W + 0.06, wy0, wy1, 1.78, 1.82, mat.trim, { res: 0.03 });
    box(4.04, 4.36, H + 0.5, H + 1.35, 1.14, 1.46, mat.plasterWall);          // труба
    box(4.0, 4.4, H + 1.35, H + 1.45, 1.1, 1.5, mat.trim);
    return finish();
  },
});
