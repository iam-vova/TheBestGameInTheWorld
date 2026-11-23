<script setup lang="ts">
import GameModal from '@/components/GameModal/GameModal.vue';
import { useGame } from '@/composables/useGame';
import { roomName } from '@/functions/bookings';
import type { Bill } from '@/models/ui';

defineProps<{ bill: Bill }>();
const { closeBill } = useGame();
</script>

<template>
  <GameModal :title="`Счёт: ${roomName(bill.room)}`">
    <table class="ui-table ui-table--paper">
      <tr>
        <td class="ui-table__cell">Ночлег, 1 ночь, {{ bill.who }}</td>
        <td class="ui-table__cell ui-table__cell--num">{{ bill.sum }}</td>
      </tr>
      <tr>
        <td class="ui-table__cell">Ключ</td>
        <td class="ui-table__cell ui-table__cell--num">возвращён</td>
      </tr>
      <tr v-if="bill.late">
        <td class="ui-table__cell">Скидка за ожидание у двери</td>
        <td class="ui-table__cell ui-table__cell--num">−{{ -bill.late }}</td>
      </tr>
      <tr v-if="bill.tip">
        <td class="ui-table__cell">Событие: чаевые</td>
        <td class="ui-table__cell ui-table__cell--num">+{{ bill.tip }}</td>
      </tr>
      <tr v-if="bill.dinner">
        <td class="ui-table__cell">Ужин</td>
        <td class="ui-table__cell ui-table__cell--num">+{{ bill.dinner }}</td>
      </tr>
      <tr v-if="bill.bar">
        <td class="ui-table__cell">Покупка из мини-бара</td>
        <td class="ui-table__cell ui-table__cell--num">+{{ bill.bar }}</td>
      </tr>
      <tr v-if="bill.ev === 'tidy'">
        <td class="ui-table__cell">Событие: гости убрали за собой</td>
        <td class="ui-table__cell ui-table__cell--num">бельё снято</td>
      </tr>
      <tr v-if="bill.ev === 'party'">
        <td class="ui-table__cell">Событие: вечеринка</td>
        <td class="ui-table__cell ui-table__cell--num">номер разгромлен</td>
      </tr>
      <tr>
        <th class="ui-table__cell">Получено</th>
        <th class="ui-table__cell ui-table__cell--num">{{ bill.total }} монет</th>
      </tr>
    </table>
    <template #actions>
      <button class="ui-button ui-button--paper ui-button--primary" data-ok @click="closeBill">Забрать</button>
    </template>
  </GameModal>
</template>
