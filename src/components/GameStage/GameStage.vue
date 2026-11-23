<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRaw } from 'vue';
import { useGame } from '@/composables/useGame';
import { VIEW } from '@/data/scenes';
import { drawFrame } from '@/render/renderer';
import { spritesReady } from '@/render/sprites';

const { state, world, toast, fading, labels, update, click } = useGame();
const canvas = ref<HTMLCanvasElement | null>(null);
let raf = 0;

onMounted(() => {
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
onBeforeUnmount(() => cancelAnimationFrame(raf));

function onPointerDown(ev: PointerEvent): void {
  const r = canvas.value!.getBoundingClientRect();
  click(((ev.clientX - r.left) / r.width) * VIEW.w, ((ev.clientY - r.top) / r.height) * VIEW.h);
}
</script>

<template>
  <div class="game-stage">
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
      :style="{ left: label.left, top: label.top }"
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
