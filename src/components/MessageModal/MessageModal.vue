<script setup lang="ts">
import GameModal from '@/components/GameModal/GameModal.vue';

defineProps<{ title: string; lines: string[]; ok: string; cancel?: string }>();
defineEmits<{ ok: []; cancel: [] }>();
</script>

<template>
  <GameModal :title="title">
    <p v-for="(line, i) in lines" :key="i" class="message-modal__line">{{ line }}</p>
    <template #actions>
      <button v-if="cancel" class="ui-button" @click="$emit('cancel')">{{ cancel }}</button>
      <button class="ui-button ui-button--primary" data-ok @click="$emit('ok')">{{ ok }}</button>
    </template>
  </GameModal>
</template>

<style lang="scss" src="./component.scss"></style>
