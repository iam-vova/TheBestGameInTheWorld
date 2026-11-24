// Мебель и мелочи комнат. --params '{"model":"bed|sofa|table|nightstand|minibar|coins|mess","state":"bare|made|used|sleep"}'
const kit = require('./_kit.js');

module.exports = toolkit => ({
  id: 'hotel-furniture', name: 'Мебель', seed: 4,
  build(seed, { controls = {} } = {}) {
    const { start, px } = kit(toolkit);
    const { B, S, mat, box, cyl, finish } = start(seed);
    const u = px.room;
    const state = controls.state || 'bare';
    const res = { res: 0.03 };
    const soft = (rd, r = 0.03) => ({ res: r, rd });

    /** постель поверх лежака: простыня, подушка у изголовья, покрывало; alongX — изголовье слева */
    function bedding(x0, x1, z0, z1, top, alongX) {
      if (state === 'bare') return;
      box(x0, x1, top - 0.02, top + 0.03, z0, z1, mat.linen, soft(0.03));
      // оси «вдоль» и «поперёк» лежака
      const at = (a0, a1, c0, c1, y0, y1, m, o) =>
        alongX ? box(x0 + a0, x0 + a1, y0, y1, z0 + c0, z0 + c1, m, o) : box(x0 + c0, x0 + c1, y0, y1, z0 + a0, z0 + a1, m, o);
      const len = alongX ? x1 - x0 : z1 - z0, wid = alongX ? z1 - z0 : x1 - x0;
      const point = (a, c, y) => (alongX ? [x0 + a, y, z0 + c] : [x0 + c, y, z0 + a]);
      if (state === 'used') {
        at(0.12, 0.5, 0.2, wid - 0.05, top + 0.03, top + 0.12, mat.trim, soft(0.05));            // съехавшая подушка
        // скомканное покрывало: несколько складок разной высоты
        for (const [a, c, r] of [[0.55, 0.3, 0.2], [0.72, 0.52, 0.24], [0.6, 0.62, 0.17], [0.85, 0.3, 0.16]])
          S.ball(point(len * a, wid * c, top + r * 0.45), r, mat.blanket, res);
        at(len * 0.75, len - 0.02, 0.02, wid * 0.55, top + 0.02, top + 0.07, mat.blanket, soft(0.03));
        return;
      }
      at(0.1, 0.48, 0.1, wid - 0.1, top + 0.03, top + 0.14, mat.trim, soft(0.06));               // подушка
      at(len * 0.34, len, -0.01, wid + 0.01, top - 0.1, top + 0.07, mat.blanket, soft(0.04));     // покрывало
      at(len * 0.34, len * 0.34 + 0.14, -0.01, wid + 0.01, top + 0.05, top + 0.09, mat.linen, soft(0.03)); // отворот
      if (state === 'sleep') {
        at(len * 0.36, len * 0.92, wid * 0.22, wid * 0.78, top + 0.05, top + 0.2, mat.blanket, soft(0.1)); // тело под покрывалом
        S.ball(point(0.3, wid / 2, top + 0.2), 0.13, mat.skin, res);
        S.ball(point(0.24, wid / 2, top + 0.24), 0.125, mat.hair, res);
      }
    }

    switch (controls.model) {
      case 'bed': {
        const W = 0.85, D = 1.8, top = u(14);
        box(0, W, 0, u(9), 0, D, mat.woodPlanks, soft(0.02));
        box(0, W, 0, u(26), 0, 0.1, mat.woodPlanks, soft(0.02));
        box(0.03, W - 0.03, u(9), top, 0.1, D - 0.03, mat.linen, soft(0.05));
        bedding(0.02, W - 0.02, 0.1, D - 0.02, top, false);
        break;
      }
      case 'sofa': {
        const W = 1.8, D = 1, top = u(14);
        box(0, W, 0, u(8), 0.2, D, mat.lilac, soft(0.04));                    // основание
        box(0.04, W - 0.04, u(8), top, 0.2, D - 0.02, mat.lilac, soft(0.07)); // сиденье
        box(0, W, 0, u(34), 0, 0.22, mat.lilac, soft(0.06));                  // спинка
        box(-0.02, 0.12, 0, u(22), 0.18, D, mat.lilac, soft(0.05));           // подлокотники
        box(W - 0.12, W + 0.02, 0, u(22), 0.18, D, mat.lilac, soft(0.05));
        bedding(0.14, W - 0.14, 0.24, D - 0.02, top, true);
        break;
      }
      case 'table':
        for (const x of [-0.7, 0.58]) for (const z of [-0.45, 0.33]) box(x, x + 0.12, 0, u(20), z, z + 0.12, mat.wood, res);
        box(-0.75, 0.75, u(20), u(24), -0.5, 0.5, mat.woodPlanks, soft(0.02));
        box(-0.66, 0.66, u(17), u(20), -0.42, 0.42, mat.wood, res);
        break;
      case 'nightstand':
        box(-0.3, 0.3, 0, u(20), -0.3, 0.3, mat.woodPlanks, soft(0.02));
        box(-0.33, 0.33, u(20), u(21.5), -0.33, 0.33, mat.wood, res);
        box(-0.22, 0.22, u(11), u(17), 0.3, 0.33, mat.wood, res);            // ящик
        S.ball([0, u(14), 0.35], 0.035, mat.brass, { res: 0.015 });
        break;
      case 'minibar':
        box(-0.25, 0.25, 0, u(22), -0.25, 0.25, mat.trim, soft(0.03));
        box(-0.21, 0.21, u(2), u(20), 0.25, 0.28, mat.glass, res);           // стеклянная дверца
        for (const [x, m] of [[-0.12, mat.green], [0, mat.red], [0.12, mat.brass]]) cyl(x, 0.3, u(4), u(11), 0.035, m, { res: 0.015 });
        box(-0.21, 0.21, u(11.5), u(12.5), 0.25, 0.3, mat.trim, res);
        box(0.15, 0.19, u(8), u(15), 0.28, 0.31, mat.metal, { res: 0.015 });
        break;
      case 'coins':
        // три стопки монет; модель рендерится вдвое крупнее остальной мебели
        for (const [x, z, n] of [[-0.08, -0.02, 3], [0.08, 0.04, 5], [-0.01, 0.13, 2]])
          for (let i = 0; i < n; i++) cyl(x, z, i * 0.035, i * 0.035 + 0.028, 0.075, mat.gold, { res: 0.012 });
        break;
      default: {
        // мусор после вечеринки: коробка, бутылки, подушка, стаканчики
        box(-0.6, -0.1, 0, 0.22, -0.5, -0.1, mat.timber, soft(0.01, 0.025));
        cyl(0.1, -0.35, 0, 0.3, 0.05, mat.green, { res: 0.02 });
        cyl(0.1, -0.35, 0.3, 0.4, 0.02, mat.green, { res: 0.015 });
        S.tube([[0.3, 0.05, 0.05], [0.62, 0.05, 0.2]], 0.05, 0.05, mat.green, { res: 0.02 });
        box(-0.35, 0.1, 0, 0.1, 0.1, 0.45, mat.trim, soft(0.05, 0.025));
        cyl(0.5, -0.1, 0, 0.1, 0.045, mat.red, { res: 0.015 });
        cyl(-0.55, 0.2, 0, 0.1, 0.045, mat.brass, { res: 0.015 });
        cyl(0.65, 0.35, 0, 0.16, 0.06, mat.blanket, { res: 0.02 });
        for (let i = 0; i < 14; i++) {
          const x = -0.7 + B.n3(i * 3.1, 1, 2) * 1.5, z = -0.5 + B.n3(i * 1.7, 5, 9) * 1.1;
          box(x, x + 0.05, 0, 0.012, z, z + 0.05, [mat.red, mat.brass, mat.water, mat.lilac][i % 4], { res: 0.012 });
        }
      }
    }
    return finish();
  },
});
