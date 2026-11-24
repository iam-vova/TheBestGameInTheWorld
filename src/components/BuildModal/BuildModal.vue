<script setup lang="ts">
import { computed, ref } from 'vue';
import GameModal from '@/components/GameModal/GameModal.vue';
import { useGame } from '@/composables/useGame';
import { CLASS_IDS, ROOM_CLASSES } from '@/data/rooms';
import { buildStatus, freePlots } from '@/functions/build';

const { state, build, closeModal } = useGame();

const plots = computed(() => freePlots(state));
const plot = ref(plots.value[0]);
const cards = computed(() => CLASS_IDS.map((id) => ({ id, ...ROOM_CLASSES[id], status: buildStatus(state, id) })));
</script>

<template>
  <GameModal title="Стройка">
    <div v-if="plots.length > 1" class="build-modal__plots">
      <button
        v-for="(p, i) in plots"
        :key="p"
        class="build-modal__plot"
        :class="{ 'build-modal__plot--on': p === plot }"
        @click="plot = p"
      >
        Участок {{ i + 1 }}
      </button>
    </div>
    <p v-if="!plots.length" class="build-modal__full">Все участки застроены</p>
    <div class="build-modal__cards">
      <div v-for="card in cards" :key="card.id" class="build-modal__card">
        <b>{{ card.title }}</b>
        <span class="build-modal__beds">{{ '🛏️'.repeat(card.cap) }}</span>
        <span class="build-modal__rate">+{{ card.rate }} <i class="ui-coin" /> за ночь</span>
        <button
          class="ui-button ui-button--primary"
          :data-build="card.id"
          :disabled="card.status !== 'ok'"
          @click="build(plot, card.id)"
        >
          <i class="ui-coin" /> {{ card.price }}
        </button>
      </div>
    </div>
    <template #actions>
      <button class="ui-button" data-ok @click="closeModal">Закрыть</button>
    </template>
  </GameModal>
</template>

<style lang="scss" src="./component.scss"></style>
