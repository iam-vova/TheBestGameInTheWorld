<script setup lang="ts">
import { computed } from 'vue';
import { useGame } from '@/composables/useGame';
import { dayLabel } from '@/functions/texts';
import { hasAffordableUpgrade } from '@/functions/upgrades';

const { state, openUpgrades, askNewGame } = useGame();
const time = computed(() => dayLabel(state));
const canUpgrade = computed(() => hasAffordableUpgrade(state));
</script>

<template>
  <header class="game-header">
    <h1 class="game-header__title">От дивана до фермерского отеля</h1>
    <span class="game-header__stat">{{ time }}</span>
    <span class="game-header__stat">Монеты: <b class="game-header__coins">{{ state.coins }}</b></span>
    <button class="ui-button" :class="{ 'ui-button--primary': canUpgrade }" @click="openUpgrades">Улучшения</button>
    <button class="ui-button" @click="askNewGame">Новая игра</button>
  </header>
</template>

<style lang="scss" src="./component.scss"></style>
