<script setup lang="ts">
import { computed, ref } from 'vue';
import GameModal from '@/components/GameModal/GameModal.vue';
import { useGame } from '@/composables/useGame';
import { CLASS_IDS, ROOM_CLASSES, SITES } from '@/data/rooms';
import { buildStatus, freePlots, type BuildStatus } from '@/functions/build';

const { state, build, closeModal } = useGame();

const plots = computed(() => freePlots(state));
const plot = ref(plots.value[0]);

const NOTE: Record<BuildStatus, string> = {
  ok: '',
  poor: 'Не хватает монет',
  full: 'Свободных участков нет',
};
const cards = computed(() =>
  CLASS_IDS.map((id) => {
    const status = buildStatus(state, id);
    return { id, ...ROOM_CLASSES[id], status, note: NOTE[status] };
  }),
);
</script>

<template>
  <GameModal title="Стройка">
    <p>В кошельке: {{ state.coins }} монет</p>
    <div v-if="plots.length" class="build-modal__plots">
      Участок:
      <label v-for="p in plots" :key="p" class="build-modal__plot">
        <input v-model="plot" type="radio" :value="p" /> {{ SITES[p].title }}
      </label>
    </div>
    <div
      v-for="card in cards"
      :key="card.id"
      class="build-modal__card"
      :class="{ 'build-modal__card--off': card.status !== 'ok' }"
    >
      <div class="build-modal__info">
        <b>{{ card.title }}</b>
        <small class="build-modal__text">
          {{ card.text }} Мест: {{ card.cap }} · {{ card.rate }} монет за ночь · окупается за
          {{ Math.ceil(card.price / card.rate) }} ноч.<template v-if="card.note"> — {{ card.note }}</template>
        </small>
      </div>
      <button
        class="ui-button ui-button--paper ui-button--primary"
        :data-build="card.id"
        :disabled="card.status !== 'ok'"
        @click="build(plot, card.id)"
      >
        {{ card.price }} монет
      </button>
    </div>
    <template #actions>
      <button class="ui-button ui-button--paper" data-ok @click="closeModal">Закрыть</button>
    </template>
  </GameModal>
</template>

<style lang="scss" src="./component.scss"></style>
