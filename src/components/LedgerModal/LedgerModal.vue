<script setup lang="ts">
import { computed } from 'vue';
import GameModal from '@/components/GameModal/GameModal.vue';
import { useGame } from '@/composables/useGame';

const { state, closeModal } = useGame();
const delta = (d: number): string => (d > 0 ? `+${d}` : d < 0 ? `−${-d}` : '—');
/** свежие записи сверху */
const rows = computed(() => state.ledger.slice(-12).reverse());
</script>

<template>
  <GameModal title="Баланс">
    <table class="ui-table ui-table--paper ledger-modal">
      <tr v-for="(row, i) in rows" :key="i">
        <td class="ui-table__cell">{{ row.t }}</td>
        <td class="ui-table__cell ui-table__cell--num">{{ delta(row.d) }}</td>
        <td class="ui-table__cell ui-table__cell--num">{{ row.b }}</td>
      </tr>
    </table>
    <template #actions>
      <button class="ui-button" data-ok @click="closeModal">Закрыть</button>
    </template>
  </GameModal>
</template>

<style lang="scss" src="./component.scss"></style>
