<script setup lang="ts">
import GameStage from '@/components/GameStage/GameStage.vue';
import LedgerModal from '@/components/LedgerModal/LedgerModal.vue';
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
    <GameStage />

    <AdModal v-if="modal?.type === 'ad'" />
    <BillModal v-else-if="modal?.type === 'bill'" :bill="modal.bill" />
    <UpgradesModal v-else-if="modal?.type === 'upgrades'" />
    <BuildModal v-else-if="modal?.type === 'build'" />
    <LedgerModal v-else-if="modal?.type === 'ledger'" />
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
      :lines="['Прогресс сотрётся.']"
      ok="Заново"
      cancel="Нет"
      @ok="newGame"
      @cancel="closeModal"
    />
  </div>
</template>

<style lang="scss" src="./component.scss"></style>
