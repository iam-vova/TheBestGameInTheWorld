<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <div class="game-modal">
    <div class="game-modal__box">
      <h2 class="game-modal__title">{{ title }}</h2>
      <slot />
      <div class="game-modal__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="./component.scss"></style>
