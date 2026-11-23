<script setup lang="ts">
import { computed } from 'vue';
import { useGame } from '@/composables/useGame';
import { UPGRADES } from '@/data/upgrades';
import { ROOM_IDS } from '@/functions/bookings';
import { roomStatus } from '@/functions/texts';

const { state } = useGame();
const annexPrice = UPGRADES.find((u) => u.id === 'annex')?.price(state);
const cards = computed(() =>
  ROOM_IDS.map((id) => ({
    id,
    title: id === 'home' ? 'Номер в доме' : 'Пристройка',
    room: state.rooms[id],
    status: roomStatus(state, id),
  })),
);
</script>

<template>
  <div class="room-cards">
    <div v-for="card in cards" :key="card.id" class="room-cards__card" :class="{ 'room-cards__card--empty': !card.room.built }">
      <h3 class="room-cards__title">{{ card.title }}</h3>
      <template v-if="card.room.built">
        Мест: {{ card.room.cap }} · {{ card.room.rate }} монет за ночь<br />
        {{ card.status }}
      </template>
      <template v-else>Земля под застройку · {{ annexPrice }} монет</template>
    </div>
  </div>
</template>

<style lang="scss" src="./component.scss"></style>
