import { GROUND, SCENES, VIEW, type SceneConfig } from '@/data/scenes';
import type { SceneId } from '@/models/game';
import type { World } from '@/models/world';
import { clamp, project } from './iso';

/** Конфигурация сцены с учётом камеры: во дворе карта шире экрана и едет за хозяином. */
export function viewOf(scene: SceneId, cam: World['cam']): SceneConfig {
  const sc = SCENES[scene];
  // камера встаёт на целый пиксель канвы (полпикселя сцены): иначе спрайты округляются вразнобой и дрожат
  const snap = (v: number): number => Math.round(v * VIEW.scale) / VIEW.scale;
  return scene === 'out' ? { ...sc, ox: sc.ox - snap(cam.x), oy: sc.oy - snap(cam.y) } : sc;
}

const OUT = SCENES.out;
/** насколько камера может уехать, чтобы не показывать пустоту за краями двора */
const MAX_X = Math.max(0, project(OUT, GROUND.w, 0)[0] + 24 - VIEW.w);
const MAX_Y = Math.max(0, project(OUT, GROUND.w, GROUND.h)[1] + 16 - VIEW.h);

/** Плавно ведёт камеру за хозяином, пока он во дворе. */
export function followPlayer(world: World, instant = false): void {
  const p = world.player;
  if (p.scene !== 'out') return;
  const [px, py] = project(OUT, p.x, p.y);
  const tx = clamp(px - VIEW.w / 2, 0, MAX_X);
  const ty = clamp(py - VIEW.h * 0.6, 0, MAX_Y);
  const k = instant ? 1 : 0.08;
  world.cam.x += (tx - world.cam.x) * k;
  world.cam.y += (ty - world.cam.y) * k;
}
