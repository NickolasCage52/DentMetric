<template>
  <div class="p-2 space-y-2">
    <!-- Форма вмятины: компактная плашка -->
    <div v-if="selectedDentSize" class="flex items-center gap-2">
      <span class="text-[10px] uppercase font-bold text-metric-green tracking-widest shrink-0">Форма:</span>
      <div
        v-if="selectedDentSize.type === 'circle'"
        class="flex gap-0.5 p-0.5 rounded-md bg-black/35 border border-white/10"
      >
        <button
          type="button"
          @click="$emit('update:shapeVariant', 'circle')"
          class="px-3 py-1.5 min-h-[36px] rounded text-[10px] font-medium transition-all touch-manipulation"
          :class="shapeVariant === 'circle' ? 'bg-metric-green text-black' : 'text-gray-400 hover:text-white'"
        >
          Круг
        </button>
        <button
          type="button"
          @click="$emit('update:shapeVariant', 'oval')"
          class="px-3 py-1.5 min-h-[36px] rounded text-[10px] font-medium transition-all touch-manipulation"
          :class="shapeVariant === 'oval' ? 'bg-metric-green text-black' : 'text-gray-400 hover:text-white'"
        >
          Овал
        </button>
      </div>
      <div
        v-else
        class="flex gap-0.5 p-0.5 rounded-md bg-black/35 border border-white/10"
      >
        <button
          type="button"
          @click="$emit('update:shapeVariant', 'strip')"
          class="px-3 py-1.5 min-h-[36px] rounded text-[10px] font-medium transition-all touch-manipulation"
          :class="shapeVariant === 'strip' ? 'bg-metric-green text-black' : 'text-gray-400 hover:text-white'"
        >
          Полоса
        </button>
        <button
          type="button"
          @click="$emit('update:shapeVariant', 'scratch')"
          class="px-3 py-1.5 min-h-[36px] rounded text-[10px] font-medium transition-all touch-manipulation"
          :class="shapeVariant === 'scratch' ? 'bg-metric-green text-black' : 'text-gray-400 hover:text-white'"
        >
          Царапина
        </button>
      </div>
    </div>
    <!-- Свободное растяжение -->
    <div class="flex items-center gap-2">
      <label class="flex items-center gap-2 cursor-pointer text-[10px] text-gray-400 min-h-[36px] touch-manipulation">
        <input
          type="checkbox"
          :checked="freeStretch"
          @change="$emit('update:freeStretch', $event.target.checked)"
          class="rounded border-white/20 bg-[#151515] text-metric-green focus:ring-metric-green/50"
        />
        <span>Свободное растяжение (неправильная форма)</span>
      </label>
    </div>
    <!-- Размеры (мм) — всегда виден на этапе 2 -->
    <div class="rounded-xl bg-black/35 border border-white/10 p-2.5">
      <div class="text-[10px] uppercase font-bold text-metric-green tracking-widest mb-2">Размеры (мм)</div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-[10px] text-gray-500 mb-1">{{ selectedDentSize?.type === 'circle' ? 'Ширина' : 'Длина' }}</label>
          <input
            :value="displayWidthVal"
            @input="onWidthInput"
            type="number"
            min="0.1"
            max="2000"
            step="0.5"
            inputmode="decimal"
            :placeholder="selectedDentSize ? '' : '—'"
            :disabled="!selectedDentSize"
            class="w-full rounded-lg bg-white/5 border border-white/20 px-2 py-2.5 min-h-[44px] text-sm text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
            @focus="selectedDentSize && $emit('dimensions-focus')"
          />
        </div>
        <div>
          <label class="block text-[10px] text-gray-500 mb-1">{{ selectedDentSize?.type === 'circle' ? 'Высота' : 'Ширина' }}</label>
          <input
            :value="displayHeightVal"
            @input="onHeightInput"
            type="number"
            min="0.1"
            max="2000"
            step="0.5"
            inputmode="decimal"
            :placeholder="selectedDentSize ? '' : '—'"
            :disabled="!selectedDentSize"
            class="w-full rounded-lg bg-white/5 border border-white/20 px-2 py-2.5 min-h-[44px] text-sm text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
            @focus="selectedDentSize && $emit('dimensions-focus')"
          />
        </div>
      </div>
    </div>
    <!-- Предварительная цена -->
    <div class="text-center text-[11px] text-gray-400">
      Предварительно: {{ previewPrice > 0 ? '~ ' + formatPrice(previewPrice) + ' ₽' : '—' }}
    </div>
    <!-- Кнопка перехода -->
    <button
      type="button"
      @click="$emit('next')"
      :disabled="!canNext"
      class="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
      :class="canNext ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
    >
      <span>Продолжить → Условия</span>
    </button>
    <p v-if="!canNext" class="text-[10px] text-gray-500 text-center">Размеры должны быть больше 0</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  selectedDentSize: { type: Object, default: null },
  shapeVariant: { type: String, default: 'oval' },
  sizeWidthMm: { type: Number, default: 0 },
  sizeHeightMm: { type: Number, default: 0 },
  freeStretch: { type: Boolean, default: false },
  previewPrice: { type: Number, default: 0 },
  canNext: { type: Boolean, default: false }
});

const emit = defineEmits(['update:shapeVariant', 'update:freeStretch', 'update:sizeWidthMm', 'update:sizeHeightMm', 'dimensions-focus', 'next']);

/** Отображаемое значение: NaN/undefined/0 → пустая строка. */
const displayWidthVal = computed(() => {
  const n = Number(props.sizeWidthMm);
  return Number.isFinite(n) && n > 0 ? props.sizeWidthMm : '';
});
const displayHeightVal = computed(() => {
  const n = Number(props.sizeHeightMm);
  return Number.isFinite(n) && n > 0 ? props.sizeHeightMm : '';
});

function sanitizeInput(val) {
  const n = parseFloat(String(val || '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function onWidthInput(e) {
  emit('update:sizeWidthMm', sanitizeInput(e?.target?.value));
}
function onHeightInput(e) {
  emit('update:sizeHeightMm', sanitizeInput(e?.target?.value));
}

const formatPrice = (v) => new Intl.NumberFormat('ru-RU').format(v);
</script>
