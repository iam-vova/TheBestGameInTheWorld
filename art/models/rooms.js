// Комнаты без мебели. --params '{"model":"home|cabin"}'
const kit = require('./_kit.js');

module.exports = toolkit => ({
  id: 'hotel-rooms', name: 'Комнаты', seed: 7,
  build(seed, { controls = {} } = {}) {
    const { start, px } = kit(toolkit);
    const { mat, box, finish } = start(seed);
    const u = px.room;
    const home = controls.model !== 'cabin';
    const [gw, gh] = home ? [7, 6] : [4, 4];
    const [wx0, wx1] = home ? [3, 4.2] : [1.6, 2.5];     // окно на дальней стене, те же клетки, что в игре
    const H = u(64), T = 0.14;

    box(0, gw, -0.16, 0, 0, gh, mat.floorPlanks, { res: 0.05 });
    box(-T, 0, -0.16, H, -T, gh, mat.wall, { res: 0.05 });   // левая стена
    box(0, gw, -0.16, H, -T, 0, mat.wall, { res: 0.05 });    // дальняя стена
    box(0, 0.04, 0, u(5), 0, gh, mat.rug);                   // плинтусы
    box(0, gw, 0, u(5), 0, 0.04, mat.rug);
    box(wx0 - 0.09, wx1 + 0.09, u(24), u(56), 0, 0.04, mat.rug, { res: 0.03 });
    box(wx0, wx1, u(27), u(53), 0.03, 0.06, mat.glass, { res: 0.03 });
    box((wx0 + wx1) / 2 - 0.02, (wx0 + wx1) / 2 + 0.02, u(27), u(53), 0.05, 0.08, mat.rug, { res: 0.02 });
    box(wx0 - 0.12, wx1 + 0.12, u(22), u(24), 0, 0.12, mat.trim, { res: 0.03 }); // подоконник
    if (home) {
      box(4.55, 6.95, 0, 0.02, 0.15, 2.9, mat.rug, { res: 0.04 });
      box(4.7, 6.8, 0.02, 0.03, 0.3, 2.75, mat.blanket, { res: 0.04 });
      box(3.0, 4.0, 0, 0.02, 5.35, 5.95, mat.mat, { res: 0.04 });
    } else {
      box(1.5, 2.5, 0, 0.02, 3.35, 3.95, mat.mat, { res: 0.04 });
    }
    return finish();
  },
});
