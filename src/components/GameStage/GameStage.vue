<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import { useGame } from '@/composables/useGame';
import { VIEW } from '@/data/scenes';
import { drawFrame } from '@/render/renderer';
import { spritesReady } from '@/render/sprites';

const { state, world, toast, fading, labels, update, click, goToLabel } = useGame();
const canvas = ref<HTMLCanvasElement | null>(null);
const stage = ref<HTMLElement | null>(null);
const width = ref('100%');
let raf = 0;

/**
 * Пиксель канвы должен занимать целое число пикселей экрана. Иначе браузер растягивает строки неравномерно,
 * и при движении камеры вся картинка мелко дрожит.
 */
function fit(): void {
  const dpr = window.devicePixelRatio || 1;
  const room = (stage.value?.parentElement?.clientWidth ?? 960) * dpr;
  const full = VIEW.w * VIEW.scale;
  const k = Math.max(1, Math.floor(room / full));
  // на узком экране целого масштаба нет — тогда хотя бы на всю ширину
  width.value = room < full ? '100%' : `${(full * k) / dpr + 4}px`;
}

onMounted(() => {
  fit();
  window.addEventListener('resize', fit);
  const ctx = canvas.value!.getContext('2d')!;
  let last = performance.now();
  const frame = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    const marks = update(dt);
    drawFrame(ctx, toRaw(state), world, marks, t);
    raf = requestAnimationFrame(frame);
  };
  // первый кадр — когда атласы загружены
  spritesReady.then(() => (raf = requestAnimationFrame(frame)));
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('resize', fit);
});

function onPointerDown(ev: PointerEvent): void {
  const r = canvas.value!.getBoundingClientRect();
  click(((ev.clientX - r.left) / r.width) * VIEW.w, ((ev.clientY - r.top) / r.height) * VIEW.h);
}
</script>

<template>
  <div ref="stage" class="game-stage" :style="{ width }">
    <canvas
      ref="canvas"
      class="game-stage__canvas"
      :width="VIEW.w * VIEW.scale"
      :height="VIEW.h * VIEW.scale"
      @pointerdown="onPointerDown"
    />
    <div
      v-for="(label, i) in labels"
      :key="i"
      class="game-stage__label"
      :class="{ 'game-stage__label--edge': label.edge }"
      :style="{ left: label.left, top: label.top }"
      @click="goToLabel(i)"
    >
      {{ label.text }}
    </div>
    <div v-if="toast" class="game-stage__toast">
      <span class="game-stage__toast-text">{{ toast }}</span>
    </div>
    <div class="game-stage__fade" :class="{ 'game-stage__fade--on': fading }" />
  </div>
</template>

<style lang="scss" src="./component.scss"></style>
