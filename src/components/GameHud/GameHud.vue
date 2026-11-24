<script setup lang="ts">
import { computed } from 'vue';
import { useGame } from '@/composables/useGame';
import { TIME_ICON, dayNumber, goalText, timeOfDay } from '@/functions/texts';
import { buildUnlocked, canBuildSomething } from '@/functions/build';
import { hasAffordableUpgrade } from '@/functions/upgrades';

const { state, openUpgrades, openBuild, openLedger, askNewGame } = useGame();
const goal = computed(() => goalText(state));
</script>

<template>
  <div class="game-hud">
    <div class="game-hud__top">
      <span class="game-hud__chip">{{ TIME_ICON[timeOfDay(state)] }} День {{ dayNumber(state) }}</span>
      <button class="game-hud__chip game-hud__chip--coins" data-hud="ledger" title="Баланс" @click="openLedger">
        <i class="ui-coin" /><b :key="state.coins" class="game-hud__coins">{{ state.coins }}</b>
      </button>
      <span class="game-hud__gap" />
      <button
        class="game-hud__btn"
        :class="{ 'game-hud__btn--hot': hasAffordableUpgrade(state) }"
        data-hud="upgrades"
        title="Улучшения"
        @click="openUpgrades"
      >
        🛒
      </button>
      <button
        v-if="buildUnlocked(state)"
        class="game-hud__btn"
        :class="{ 'game-hud__btn--hot': canBuildSomething(state) }"
        data-hud="build"
        title="Стройка"
        @click="openBuild"
      >
        🔨
      </button>
      <button class="game-hud__btn game-hud__btn--small" data-hud="new" title="Новая игра" @click="askNewGame">↺</button>
    </div>
    <div :key="goal" class="game-hud__goal">{{ goal }}</div>
  </div>
</template>

<style lang="scss" src="./component.scss"></style>
