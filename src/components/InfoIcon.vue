<template>
  <div class="relative inline-flex">
    <button
      type="button"
      @click="toggle"
      class="info-icon-btn w-5 h-5 rounded-full border border-gray-500/60 flex items-center justify-center text-[10px] font-bold text-gray-400 hover:text-metric-green hover:border-metric-green/50 transition-colors shrink-0"
      aria-label="Подсказка"
    >
      i
    </button>
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div
          v-if="show"
          class="fixed inset-0 z-[500]"
          @click="close"
        >
          <div
            class="absolute bottom-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,280px)] p-4 rounded-xl bg-[#1a1a1a] border border-metric-green/30 shadow-xl text-sm text-gray-300"
            @click.stop
          >
            <div class="flex justify-end mb-2">
              <button type="button" @click="close" class="p-1 -m-1 text-gray-400 hover:text-white" aria-label="Закрыть">✕</button>
            </div>
            {{ tooltipText }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  tooltipText: { type: String, default: 'Инструкция будет добавлена' }
});

const show = ref(false);

function toggle() {
  show.value = !show.value;
}

function close() {
  show.value = false;
}
</script>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
