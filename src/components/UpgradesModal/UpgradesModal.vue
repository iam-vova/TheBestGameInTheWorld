<script setup lang="ts">
import { computed } from 'vue';
import GameModal from '@/components/GameModal/GameModal.vue';
import { useGame } from '@/composables/useGame';
import { UPGRADES } from '@/data/upgrades';
import { upgradeStatus } from '@/functions/upgrades';
import type { UpgradeStatus } from '@/models/ui';

const { state, buy, closeModal } = useGame();

const NOTE: Record<UpgradeStatus, string> = {
  ok: '',
  done: 'Куплено',
  need: '',
  busy: 'Пока гости в номерах — нельзя',
  poor: 'Не хватает монет',
};
const items = computed(() =>
  UPGRADES.map((u) => {
    const status = upgradeStatus(state, u);
    const need = UPGRADES.find((x) => x.id === u.need);
    return {
      id: u.id,
      status,
      title: u.title(state),
      text: u.text(state),
      price: u.price(state),
      note: status === 'need' && need ? `Сначала: ${need.title(state).toLowerCase()}` : NOTE[status],
    };
  }),
);
</script>

<template>
  <GameModal title="Улучшения">
    <p>В кошельке: {{ state.coins }} монет</p>
    <div
      v-for="item in items"
      :key="item.id"
      class="upgrades-modal__item"
      :class="{ 'upgrades-modal__item--off': item.status !== 'ok' }"
    >
      <div class="upgrades-modal__info">
        <b>{{ item.title }}</b>
        <small class="upgrades-modal__text">{{ item.text }}<template v-if="item.note"> — {{ item.note }}</template></small>
      </div>
      <button
        v-if="item.status !== 'done'"
        class="ui-button ui-button--paper ui-button--primary"
        :data-up="item.id"
        :disabled="item.status !== 'ok'"
        @click="buy(item.id)"
      >
        {{ item.price }} монет
      </button>
    </div>
    <template #actions>
      <button class="ui-button ui-button--paper" data-ok @click="closeModal">Закрыть</button>
    </template>
  </GameModal>
</template>

<style lang="scss" src="./component.scss"></style>
