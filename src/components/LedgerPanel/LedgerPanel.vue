<script setup lang="ts">
import { useGame } from '@/composables/useGame';

const { state } = useGame();
const delta = (d: number): string => (d > 0 ? `+${d}` : d < 0 ? `−${-d}` : '—');
</script>

<template>
  <details class="ledger-panel">
    <summary class="ledger-panel__summary">Баланс</summary>
    <table class="ui-table ledger-panel__table">
      <tr>
        <th class="ui-table__cell">Момент</th>
        <th class="ui-table__cell ui-table__cell--num">Доход / расход</th>
        <th class="ui-table__cell ui-table__cell--num">Остаток</th>
      </tr>
      <tr v-for="(row, i) in state.ledger" :key="i">
        <td class="ui-table__cell">{{ row.t }}</td>
        <td class="ui-table__cell ui-table__cell--num">{{ delta(row.d) }}</td>
        <td class="ui-table__cell ui-table__cell--num">{{ row.b }}</td>
      </tr>
    </table>
  </details>
</template>

<style lang="scss" src="./component.scss"></style>
