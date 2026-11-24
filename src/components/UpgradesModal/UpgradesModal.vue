<script setup lang="ts">
import { computed } from 'vue';
import GameModal from '@/components/GameModal/GameModal.vue';
import { useGame } from '@/composables/useGame';
import { UPGRADES } from '@/data/upgrades';
import { upgradeStatus } from '@/functions/upgrades';

const { state, buy, closeModal } = useGame();

const items = computed(() =>
  UPGRADES.map((u) => ({ u, status: upgradeStatus(state, u) }))
    // закрытые предыдущим улучшением не показываем: список остаётся коротким
    .filter(({ status }) => status !== 'hidden' && status !== 'need')
    .map(({ u, status }) => ({
      id: u.id,
      status,
      icon: u.icon,
      title: u.title(state),
      text: status === 'busy' ? '💤 В номере гости' : u.text(state),
      price: u.price(state),
    })),
);
</script>

<template>
  <GameModal title="Улучшения">
    <div
      v-for="item in items"
      :key="item.id"
      class="upgrades-modal__item"
      :class="{ 'upgrades-modal__item--done': item.status === 'done' }"
    >
      <span class="upgrades-modal__icon">{{ item.icon }}</span>
      <div class="upgrades-modal__info">
        <b>{{ item.title }}</b>
        <small class="upgrades-modal__text">{{ item.text }}</small>
      </div>
      <span v-if="item.status === 'done'" class="upgrades-modal__check">✔</span>
      <button
        v-else
        class="ui-button ui-button--primary"
        :data-up="item.id"
        :disabled="item.status !== 'ok'"
        @click="buy(item.id)"
      >
        <i class="ui-coin" /> {{ item.price }}
      </button>
    </div>
    <template #actions>
      <button class="ui-button" data-ok @click="closeModal">Закрыть</button>
    </template>
  </GameModal>
</template>

<style lang="scss" src="./component.scss"></style>
