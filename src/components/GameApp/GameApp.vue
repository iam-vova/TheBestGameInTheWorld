<script setup lang="ts">
import GameHeader from '@/components/GameHeader/GameHeader.vue';
import GoalBar from '@/components/GoalBar/GoalBar.vue';
import GameStage from '@/components/GameStage/GameStage.vue';
import RoomCards from '@/components/RoomCards/RoomCards.vue';
import LedgerPanel from '@/components/LedgerPanel/LedgerPanel.vue';
import AdModal from '@/components/AdModal/AdModal.vue';
import BillModal from '@/components/BillModal/BillModal.vue';
import UpgradesModal from '@/components/UpgradesModal/UpgradesModal.vue';
import BuildModal from '@/components/BuildModal/BuildModal.vue';
import MessageModal from '@/components/MessageModal/MessageModal.vue';
import { useGame } from '@/composables/useGame';

const { modal, closeModal, newGame } = useGame();
</script>

<template>
  <div class="game-app">
    <GameHeader />
    <GoalBar />
    <GameStage />
    <RoomCards />
    <LedgerPanel />
    <p class="game-app__hint">
      Клик по земле — идти. Клик по объекту с меткой — действие. Прогресс сохраняется в этом браузере.
    </p>

    <AdModal v-if="modal?.type === 'ad'" />
    <BillModal v-else-if="modal?.type === 'bill'" :bill="modal.bill" />
    <UpgradesModal v-else-if="modal?.type === 'upgrades'" />
    <BuildModal v-else-if="modal?.type === 'build'" />
    <MessageModal
      v-else-if="modal?.type === 'message'"
      :title="modal.title"
      :lines="modal.lines"
      :ok="modal.ok"
      @ok="closeModal"
    />
    <MessageModal
      v-else-if="modal?.type === 'confirmNew'"
      title="Начать заново?"
      :lines="['Текущий прогресс будет стёрт.']"
      ok="Новая игра"
      cancel="Отмена"
      @ok="newGame"
      @cancel="closeModal"
    />
  </div>
</template>

<style lang="scss" src="./component.scss"></style>
