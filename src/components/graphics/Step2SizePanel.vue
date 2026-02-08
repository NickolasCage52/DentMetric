<template>
  <div class="step2-panel flex flex-col min-h-0">
    <div class="graphics-panel-content p-2 space-y-1.5">
      <div class="step2-row">
        <!-- Форма вмятины: фиксированная высота, не меняется при выборе вмятины -->
        <div class="step2-block step2-form-block rounded-lg bg-black/35 border border-white/10 p-2">
          <div class="step2-form-head">
            <div class="text-[10px] uppercase font-bold text-metric-green tracking-widest">Форма</div>
            <label class="step2-checkbox">
              <input
                type="checkbox"
                :checked="freeStretch"
                @change="$emit('update:freeStretch', $event.target.checked)"
                class="rounded border-white/20 bg-[#151515] text-metric-green focus:ring-metric-green/50"
              />
              <span>Своб. растяж.</span>
            </label>
          </div>
          <div class="flex items-center min-h-[36px]">
            <template v-if="selectedDentSize">
              <div
                v-if="freeformEnabled"
                class="flex gap-0.5 p-0.5 rounded-lg bg-white/5"
              >
                <button
                  type="button"
                  class="px-2.5 py-1 min-h-[32px] rounded text-[10px] font-medium bg-metric-green text-black"
                >
                  Свободная форма
                </button>
              </div>
              <div
                v-else-if="selectedDentSize.type === 'circle'"
                class="flex gap-0.5 p-0.5 rounded-lg bg-white/5"
              >
                <button
                  type="button"
                  @click="$emit('update:shapeVariant', 'circle')"
                  class="px-2.5 py-1 min-h-[32px] rounded text-[10px] font-medium transition-all touch-manipulation"
                  :class="shapeVariant === 'circle' ? 'bg-metric-green text-black' : 'text-gray-400 hover:text-white'"
                >
                  Круг
                </button>
                <button
                  type="button"
                  @click="$emit('update:shapeVariant', 'oval')"
                  class="px-2.5 py-1 min-h-[32px] rounded text-[10px] font-medium transition-all touch-manipulation"
                  :class="shapeVariant === 'oval' ? 'bg-metric-green text-black' : 'text-gray-400 hover:text-white'"
                >
                  Овал
                </button>
              </div>
              <div
                v-else-if="selectedDentSize.type === 'strip'"
                class="flex gap-0.5 p-0.5 rounded-lg bg-white/5"
              >
                <button
                  type="button"
                  @click="$emit('update:shapeVariant', 'strip')"
                  class="px-2.5 py-1 min-h-[32px] rounded text-[10px] font-medium transition-all touch-manipulation"
                  :class="shapeVariant === 'strip' ? 'bg-metric-green text-black' : 'text-gray-400 hover:text-white'"
                >
                  Полоса
                </button>
                <button
                  type="button"
                  @click="$emit('update:shapeVariant', 'scratch')"
                  class="px-2.5 py-1 min-h-[32px] rounded text-[10px] font-medium transition-all touch-manipulation"
                  :class="shapeVariant === 'scratch' ? 'bg-metric-green text-black' : 'text-gray-400 hover:text-white'"
                >
                  Царапина
                </button>
              </div>
            </template>
            <span v-else class="text-[10px] text-gray-500 leading-[36px]">Выберите вмятину</span>
          </div>
          <label class="step2-checkbox mt-2">
            <input
              type="checkbox"
              :checked="freeformEnabled"
              @change="$emit('update:freeformEnabled', $event.target.checked)"
              class="rounded border-white/20 bg-[#151515] text-metric-green focus:ring-metric-green/50"
              :disabled="!selectedDentSize"
            />
            <span>Свободная форма</span>
          </label>
          <div v-if="freeformEnabled" class="mt-2 space-y-1">
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="$emit('toggle-freeform-edit')"
                class="flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all min-h-[32px]"
                :class="freeformEditMode ? 'bg-metric-green text-black' : 'bg-white/5 text-gray-300'"
              >
                {{ freeformEditMode ? 'Точки: Вкл' : 'Редактировать точки' }}
              </button>
              <button
                type="button"
                @click="$emit('delete-freeform-point')"
                class="px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest min-h-[32px] transition-all"
                :class="activeFreeformPointIndex !== null ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-white/5 text-gray-500 border border-white/10'"
                :disabled="activeFreeformPointIndex === null"
                title="Удалить выбранную точку"
              >
                − Точка
              </button>
            </div>
            <div class="text-[10px] text-gray-500 leading-tight">
              Тап по ребру — добавить точку. Долгое нажатие — удалить.
            </div>
          </div>
        </div>
        <!-- Размеры (мм) -->
        <div ref="sizesPanel" class="step2-block step2-sizes-block rounded-lg bg-black/35 border border-white/10 p-2">
          <div class="text-[10px] uppercase font-bold text-metric-green tracking-widest mb-1.5">Размеры (мм)</div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] text-gray-500 mb-0.5">
                {{ selectedDentSize?.type === 'circle' ? 'Ширина' : 'Длина' }}
              </label>
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
                class="step2-input w-full rounded-lg bg-white/5 border border-white/20 px-2 py-2 min-h-[44px] text-base text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                @focus="selectedDentSize && $emit('dimensions-focus', sizesPanel)"
              />
            </div>
            <div>
              <label class="block text-[10px] text-gray-500 mb-0.5">
                {{ selectedDentSize?.type === 'circle' ? 'Высота' : 'Ширина' }}
              </label>
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
                class="step2-input w-full rounded-lg bg-white/5 border border-white/20 px-2 py-2 min-h-[44px] text-base text-white focus:border-metric-green focus:ring-1 focus:ring-metric-green/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                @focus="selectedDentSize && $emit('dimensions-focus', sizesPanel)"
              />
            </div>
          </div>
          <div v-if="areaMm2" class="mt-1 text-[10px] text-gray-500">
            Площадь: <span class="text-white">{{ formatArea(areaMm2) }}</span> мм²
          </div>
        </div>
      </div>
    <p v-if="!canNext" class="text-[10px] text-gray-500 text-center">Размеры должны быть больше 0</p>
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
          class="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 min-h-[44px]"
          :class="canNext ? 'bg-metric-green text-black shadow-[0_0_15px_rgba(136,229,35,0.4)] hover:opacity-95 active:opacity-90' : 'bg-white/10 text-gray-500 cursor-not-allowed'"
        >
          <span>Продолжить → Условия</span>
        </button>
      </div>
      <button
        type="button"
        class="actionbar-total-btn"
        :class="totalPrice > 0 ? 'actionbar-total-btn--active' : 'actionbar-total-btn--idle'"
        :disabled="totalPrice <= 0"
      >
        <span>ИТОГО: {{ totalPrice > 0 ? formatPrice(totalPrice) + ' ₽' : '—' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  selectedDentSize: { type: Object, default: null },
  shapeVariant: { type: String, default: 'oval' },
  sizeWidthMm: { type: Number, default: 0 },
  sizeHeightMm: { type: Number, default: 0 },
  freeStretch: { type: Boolean, default: false },
  freeformEnabled: { type: Boolean, default: false },
  freeformEditMode: { type: Boolean, default: false },
  activeFreeformPointIndex: { type: Number, default: null },
  freeformPointCount: { type: Number, default: 0 },
  areaMm2: { type: Number, default: null },
  totalPrice: { type: Number, default: 0 },
  canNext: { type: Boolean, default: false }
});

const emit = defineEmits([
  'update:shapeVariant',
  'update:freeStretch',
  'update:freeformEnabled',
  'update:sizeWidthMm',
  'update:sizeHeightMm',
  'dimensions-focus',
  'toggle-freeform-edit',
  'delete-freeform-point',
  'next',
  'back'
]);
const sizesPanel = ref(null);

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
const formatArea = (v) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(v));

</script>

<style scoped>
@media (max-width: 480px) {
  .wizard-step-controls {
    transform: translateY(-5px);
  }
}
.step2-row {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
  flex-wrap: nowrap;
}
.step2-form-block {
  flex: 0 0 34%;
  min-width: 34%;
}
.step2-sizes-block {
  flex: 1 1 auto;
  min-width: 0;
}
.step2-form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
}
.step2-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 10px;
  color: #9aa3ad;
  cursor: pointer;
  user-select: none;
}
.step2-checkbox input {
  width: 16px;
  height: 16px;
}
/* Мобильная версия: компактные плашки */
@media (max-width: 480px) {
  .step2-panel {
    padding: 0.25rem !important;
  }
  .step2-panel > * + * {
    margin-top: 0.25rem !important;
  }
  .step2-block {
    padding: 0.4rem 0.5rem !important;
  }
  .step2-form-block > div:first-child {
    margin-bottom: 0.25rem !important;
  }
  .step2-form-block > div:last-child {
    min-height: 32px !important;
  }
  .step2-input {
    min-height: 36px !important;
    padding: 0.35rem 0.5rem !important;
  }
}
</style>
