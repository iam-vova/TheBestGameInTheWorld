<script setup lang="ts">
import { computed } from 'vue';
import GameModal from '@/components/GameModal/GameModal.vue';
import { useGame } from '@/composables/useGame';
import { SITES } from '@/data/rooms';
import type { Bill } from '@/models/ui';

const props = defineProps<{ bill: Bill }>();
const { closeBill } = useGame();

const sign = (n: number): string => (n < 0 ? `−${-n}` : `+${n}`);
/** строки счёта: только то, что реально повлияло на сумму или на номер */
const rows = computed(() => {
  const b = props.bill;
  const list: [string, string, string][] = [['🛏️', 'Ночлег', sign(b.sum)]];
  if (b.late) list.push(['⏳', 'Долго ждали', sign(b.late)]);
  if (b.dinner) list.push(['🍲', 'Ужин', sign(b.dinner)]);
  if (b.bar) list.push(['🍾', 'Мини-бар', sign(b.bar)]);
  if (b.tip) list.push(['💝', 'Чаевые', sign(b.tip)]);
  if (b.ev === 'tidy') list.push(['✨', 'Убрали за собой', '']);
  if (b.ev === 'party') list.push(['💥', 'Вечеринка: разгром', '']);
  return list;
});
</script>

<template>
  <GameModal :title="SITES[bill.room].title">
    <table class="bill-modal">
      <tr v-for="row in rows" :key="row[1]">
        <td class="bill-modal__icon">{{ row[0] }}</td>
        <td>{{ row[1] }}</td>
        <td class="bill-modal__num">{{ row[2] }}</td>
      </tr>
    </table>
    <div class="bill-modal__total"><i class="ui-coin" /> +{{ bill.total }}</div>
    <template #actions>
      <button class="ui-button ui-button--primary" data-ok @click="closeBill">Забрать</button>
    </template>
  </GameModal>
</template>

<style lang="scss" src="./component.scss"></style>
