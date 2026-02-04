<template>
  <header class="graphics-header shrink-0 flex flex-wrap items-center gap-2 px-2 py-1.5 border-b border-white/10 bg-black/60">
    <button
      @click="$emit('back')"
      class="text-metric-silver hover:text-white p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded border border-white/10 shrink-0 touch-manipulation"
      aria-label="Назад"
    >
      ←
    </button>
    <img
      src="/logo.png"
      alt="DentMetric"
      class="graphics-header-logo h-7 w-auto object-contain shrink-0"
      onerror="this.style.display='none'"
    >
    <div class="flex-1 min-w-0 flex flex-wrap items-center gap-1.5">
      <select
        :value="selectedClassId"
        :disabled="lockSelection"
        @change="$emit('update:selectedClassId', ($event.target).value)"
        class="graphics-select flex-1 min-w-0 max-w-[140px] bg-[#151515] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-white focus:border-metric-green/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="" disabled class="text-gray-500">Класс автомобиля</option>
        <option v-for="cls in carClasses" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
      </select>
      <select
        :value="selectedPartId"
        :disabled="lockSelection"
        @change="$emit('update:selectedPartId', ($event.target).value)"
        class="graphics-select flex-1 min-w-0 max-w-[160px] bg-[#151515] border border-[#333] rounded-lg px-2 py-1.5 text-xs text-white focus:border-metric-green/50 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option value="" disabled class="text-gray-500">Элемент кузова</option>
        <option v-for="part in partsList" :key="part.id" :value="part.id">{{ part.name }}</option>
      </select>
    </div>
    <button
      v-if="showReset"
      @click="$emit('reset')"
      class="text-xs text-red-400 px-3 py-2 min-h-[44px] flex items-center hover:text-red-300 shrink-0 touch-manipulation"
    >
      Сброс
    </button>
    <!-- Точки этапов (справа сверху) -->
    <div class="flex items-center gap-1 shrink-0">
      <span
        v-for="s in 4"
        :key="s"
        class="w-1.5 h-1.5 rounded-full transition-colors"
        :class="currentStep >= s ? 'bg-metric-green' : 'bg-white/20'"
      />
    </div>
  </header>
</template>

<script setup>
defineProps({
  selectedClassId: { type: String, required: true },
  selectedPartId: { type: String, required: true },
  carClasses: { type: Array, default: () => [] },
  partsList: { type: Array, default: () => [] },
  lockSelection: { type: Boolean, default: false },
  showReset: { type: Boolean, default: true },
  currentStep: { type: Number, default: 1 }
});

defineEmits(['back', 'update:selectedClassId', 'update:selectedPartId', 'reset']);
</script>

<style scoped>
.graphics-header {
  min-height: 44px;
  padding-left: max(8px, env(safe-area-inset-left));
  padding-right: max(8px, env(safe-area-inset-right));
}
@media (max-width: 380px) {
  .graphics-header-logo {
    display: none;
  }
}
</style>
