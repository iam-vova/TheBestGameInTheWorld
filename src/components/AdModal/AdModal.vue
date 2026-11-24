<script setup lang="ts">
import { ref } from 'vue';
import GameModal from '@/components/GameModal/GameModal.vue';
import { useGame } from '@/composables/useGame';

const { state, postAd, closeModal } = useGame();
const text = ref(state.adText);
</script>

<template>
  <GameModal title="Объявление">
    <textarea v-model="text" class="ad-modal__text" rows="3" maxlength="90" />
    <template #actions>
      <button class="ui-button" @click="closeModal">Отмена</button>
      <button class="ui-button ui-button--primary" data-ok @click="postAd(text)">Повесить</button>
    </template>
  </GameModal>
</template>

<style lang="scss" src="./component.scss"></style>
