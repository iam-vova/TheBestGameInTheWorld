<script setup lang="ts">
import { computed } from 'vue';
import { useGame } from '@/composables/useGame';
import { ROOM_CLASSES, SITES } from '@/data/rooms';
import { UPGRADES } from '@/data/upgrades';
import { builtRooms } from '@/functions/bookings';
import { buildUnlocked, freePlots } from '@/functions/build';
import { roomStatus } from '@/functions/texts';

const { state } = useGame();
const annexPrice = UPGRADES.find((u) => u.id === 'annex')?.price(state);
const cards = computed(() =>
  builtRooms(state).map((id) => {
    const room = state.rooms[id];
    return {
      id,
      title: SITES[id].title + (room.cls ? ` · ${ROOM_CLASSES[room.cls].title.toLowerCase()}` : ''),
      room,
      status: roomStatus(state, id),
    };
  }),
);
/** что можно построить дальше */
const next = computed(() => {
  if (!buildUnlocked(state)) return `Пристройка: земля под застройку · ${annexPrice} монет`;
  const free = freePlots(state).length;
  return free ? `Свободных участков: ${free} · домики — в меню «Стройка»` : '';
});
</script>

<template>
  <div class="room-cards">
    <div v-for="card in cards" :key="card.id" class="room-cards__card">
      <h3 class="room-cards__title">{{ card.title }}</h3>
      Мест: {{ card.room.cap }} · {{ card.room.rate }} монет за ночь<br />
      {{ card.status }}
    </div>
    <div v-if="next" class="room-cards__card room-cards__card--empty">{{ next }}</div>
  </div>
</template>

<style lang="scss" src="./component.scss"></style>
