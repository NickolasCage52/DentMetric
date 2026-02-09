<template>
  <div class="step0-panel flex flex-col min-h-0">
    <div class="graphics-panel-content p-3 space-y-3">
      <div class="flex items-center justify-between">
        <div class="text-[11px] text-gray-300 uppercase tracking-widest">Данные клиента</div>
        <div v-if="clientRequired" class="text-[10px] text-red-400 uppercase tracking-widest">обязательно</div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <input v-model="model.clientName" placeholder="Имя" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
        <input v-model="model.clientCompany" placeholder="Компания" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
        <input v-model="model.clientPhone" placeholder="Тел" inputmode="tel" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
        <input v-model="model.carBrand" placeholder="Марка" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
        <input v-model="model.carModel" placeholder="Модель" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
        <input v-model="model.inspectDate" type="date" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
        <input v-model="model.inspectTime" type="time" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
      </div>
      <p v-if="clientRequired && !canNext" class="text-[10px] text-gray-500 text-center">Заполните имя и телефон</p>
    </div>
    <div class="graphics-action-bar wizard-step-controls space-y-2">
      <div class="flex items-center gap-2 w-full">
        <button
          type="button"
          @click="$emit('back')"
          class="step-nav-back-btn shrink-0 py-2.5 px-3 rounded-xl text-xs font-medium text-gray-400 hover:text-white border border-white/15 hover:border-white/25 transition-all touch-manipulation min-h-[44px]"
        >
          Назад
        </button>
        <button
          type="button"
          @click="$emit('next')"
          :disabled="!canNext"
          :title="canNext ? '' : 'Заполните имя и телефон'"
          class="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 min-h-[44px]"
          :class="canNext ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
        >
          <span>Продолжить → Размещение</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  model: { type: Object, required: true },
  clientRequired: { type: Boolean, default: false },
  canNext: { type: Boolean, default: true }
});

defineEmits(['back', 'next']);
</script>
