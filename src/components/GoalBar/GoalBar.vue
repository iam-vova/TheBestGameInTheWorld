<script setup lang="ts">
import { computed } from 'vue';
import { useGame } from '@/composables/useGame';
import { bigGoal, goalText } from '@/functions/texts';

const { state } = useGame();
const goal = computed(() => goalText(state));
const big = computed(() => bigGoal(state));
</script>

<template>
  <div class="goal-bar">
    <div class="goal-bar__now">{{ goal }}</div>
    <small class="goal-bar__big">{{ big }}</small>
  </div>
</template>

<style lang="scss" src="./component.scss"></style>
