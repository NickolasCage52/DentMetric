<template>
  <div ref="graphicsRoot" class="graphics-fullscreen-wrapper">
    <StepHeader
      :selected-class-id="selectedClassId"
      :selected-part-id="selectedPartId"
      :car-classes="carClasses"
      :parts-list="partsList"
      :lock-selection="wizardStep >= 3"
      :show-reset="true"
      :current-step="wizardStep"
      @back="goBack"
      @update:selected-class-id="$emit('update:selectedClassId', $event)"
      @update:selected-part-id="$emit('update:selectedPartId', $event)"
      @reset="resetAll"
    />
    <!-- Stage: матрица width:100vw, flex:1, без max-width -->
    <div
      class="graphics-stage-area flex flex-col"
      :class="wizardStep >= 3 ? 'graphics-stage-preview shrink-0 relative z-0' : 'flex-1 min-h-0'"
    >
      <div
        v-show="wizardStep !== 3"
        id="canvas-wrapper"
        class="canvas-editor-wrap relative overflow-hidden matrix-container"
        :class="wizardStep >= 3 ? 'h-[40vh] min-h-[200px] max-h-[45vh]' : 'flex-1 min-h-0'"
        style="background-color: #0b0f14"
      >
        <div ref="konvaContainer" id="konva-container" class="absolute inset-0 w-full h-full" style="background-color: #0b0f14; padding: 0; margin: 0"></div>
        <!-- На шаге 3 overlay не перехватывает клики — pointer-events: none, чтобы не блокировать панель условий -->
        <div
          v-if="wizardStep >= 3"
          class="step3-preview-overlay absolute inset-0 z-10 cursor-default"
          aria-label="Режим просмотра"
        ></div>
        <!-- Подсказка этапа: компактно, не перекрывает элемент -->
        <div
          v-if="wizardStep <= 2"
          class="step-hint-block absolute top-1.5 left-2 right-2 z-20 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm border pointer-events-none max-h-[20%]"
          :class="wizardStep === 1 ? 'border-metric-green/40' : 'border-metric-green/40'"
        >
          <p class="step-hint-text text-[12px] font-medium leading-tight text-gray-200 mb-1">
            {{ stepHintText }}
          </p>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-gray-400">Предварительно:</span>
            <span :class="basePrice > 0 ? 'text-metric-green font-bold' : 'text-gray-500'">
              {{ basePrice > 0 ? formatCurrency(roundPrice(basePrice)) + ' ₽' : '—' }}
            </span>
          </div>
        </div>
        <!-- Кнопка удаления вмятины на этапах 1–2 (HUD): активна только при выбранной вмятине -->
        <button
          v-if="wizardStep <= 2"
          type="button"
          class="hud-delete-btn"
          :class="{ 'hud-delete-btn--active': selectedDentSize }"
          :disabled="!selectedDentSize"
          :aria-label="selectedDentSize ? 'Удалить вмятину' : 'Выберите вмятину для удаления'"
          @click="selectedDentSize && deleteCurrent()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
    <!-- Controls: z-index выше stage, чтобы селекты всегда были кликабельны -->
    <div
      ref="controlsAreaRef"
      class="graphics-controls-area shrink-0 overflow-y-auto border-t border-white/10 bg-black/80 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom,0px)]"
      :class="wizardStep === 3 ? 'graphics-controls-step3 flex-1 min-h-0 flex flex-col relative z-10' : ''"
      :style="controlsAreaKeyboardStyle"
    >
      <Step1PlacementPanel
        v-if="wizardStep === 1"
        :preview-price="roundPrice(basePrice)"
        :can-next="dents.length >= 1"
        @add-type="openSizeMenu"
        @next="() => goToStep(2)"
      />
      <Step2SizePanel
        v-else-if="wizardStep === 2"
        :selected-dent-size="selectedDentSize"
        :shape-variant="selectedDentSize?.shapeVariant ?? (selectedDentSize?.type === 'circle' ? 'oval' : 'strip')"
        :size-width-mm="sizeWidthMm"
        :size-height-mm="sizeHeightMm"
        :free-stretch="freeStretchMode"
        :preview-price="roundPrice(basePrice)"
        :can-next="dentsValid"
        @update:shape-variant="onShapeVariantChange"
        @update:free-stretch="onFreeStretchChange"
        @update:size-width-mm="sizeWidthMm = $event"
        @update:size-height-mm="sizeHeightMm = $event"
        @dimensions-focus="onDimensionsInputFocus"
        @next="() => goToStep(3)"
      />
      <Step3ConditionsPanel
        v-else-if="wizardStep === 3"
        :model="form"
        :initial-data="initialData"
        :base-price="roundPrice(basePrice)"
        :total-price="totalPrice"
        @back-to-edit="() => goToStep(2)"
        @calculate="() => goToStep(4)"
      />
      <Step4SummaryPanel
        v-else-if="wizardStep === 4"
        :breakdown="breakdown"
        :total-price="totalPrice"
        @back-to-edit="() => goToStep(2)"
        @reset="resetAll"
      />
    </div>
    <!-- Size menu modal -->
    <Teleport :to="sizeMenuPortalTarget" :disabled="!sizeMenuPortalTarget">
      <div
        v-if="showSizeMenu"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click.self="showSizeMenu = false"
      >
        <div class="bg-[#151F2E] w-full max-w-md rounded-2xl p-5 border border-white/10 shadow-2xl space-y-4 pb-8 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 class="text-white font-bold text-lg pl-1">
              Выберите размер ({{ activeToolType === 'circle' ? 'Круг/Овал' : 'Полоса' }})
            </h3>
            <button @click="showSizeMenu = false" class="text-gray-400 p-2 text-xl">✕</button>
          </div>
          <div class="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
            <button
              v-for="s in (activeToolType === 'circle' ? circleSizes : stripSizes)"
              :key="s.code"
              @click="confirmAddShape(s.code)"
              class="card-metallic p-3 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:border-metric-green/50"
            >
              <span class="text-metric-green font-bold text-base">{{ s.code }}</span>
              <span class="text-gray-400 text-xs text-center leading-tight">{{ s.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';

const emit = defineEmits(['update:selectedClassId', 'update:selectedPartId', 'close', 'dents-change']);
import {
  initKonva,
  destroyKonva,
  addDent,
  resetDents,
  deleteSelected,
  scheduleFit,
  setSelectedDentSizeMm,
  setDentShapeVariant,
  setKeepRatio,
  setEditable,
  setHideGridOnMobile
} from '../../graphics/konvaEditor';
import { calcBasePriceFromDents, calcTotalPrice, buildBreakdown, roundPrice } from '../../utils/priceCalc';
import StepHeader from './StepHeader.vue';
import Step1PlacementPanel from './Step1PlacementPanel.vue';
import Step2SizePanel from './Step2SizePanel.vue';
import Step3ConditionsPanel from './Step3ConditionsPanel.vue';
import Step4SummaryPanel from './Step4SummaryPanel.vue';

const props = defineProps({
  form: { type: Object, required: true },
  initialData: { type: Object, required: true },
  userSettings: { type: Object, required: true },
  carClasses: { type: Array, default: () => [] },
  partsList: { type: Array, default: () => [] },
  selectedClassId: { type: String, required: true },
  selectedPartId: { type: String, required: true },
  selectedPart: { type: Object, default: null },
  circleSizes: { type: Array, default: () => [] },
  stripSizes: { type: Array, default: () => [] }
});

const wizardStep = ref(1);
const graphicsRoot = ref(null);
const konvaContainer = ref(null);
const controlsAreaRef = ref(null);
const showSizeMenu = ref(false);
const activeToolType = ref(null);
const selectedDentSize = ref(null);
const sizeWidthMm = ref(0);
const sizeHeightMm = ref(0);
const freeStretchMode = ref(true);
const dents = ref([]);
let sizeApplyTimeout = null;

const keyboardInset = ref(0);
const isKeyboardOpen = computed(() => keyboardInset.value > 0);
let keyboardInsetRaf = null;
function updateKeyboardInset() {
  if (keyboardInsetRaf) return;
  keyboardInsetRaf = requestAnimationFrame(() => {
    keyboardInsetRaf = null;
    const vv = window.visualViewport;
    if (!vv) {
      keyboardInset.value = 0;
      return;
    }
    const inset = window.innerHeight - vv.height - (vv.offsetTop || 0);
    keyboardInset.value = Math.max(0, Math.round(inset));
  });
}
let dimensionsScrollGuard = false;
function onDimensionsInputFocus(event) {
  const el = event?.target;
  if (!el?.scrollIntoView) return;
  if (dimensionsScrollGuard) return;
  dimensionsScrollGuard = true;
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      setTimeout(() => { dimensionsScrollGuard = false; }, 600);
    }, 150);
  });
}

const controlsAreaKeyboardStyle = computed(() => {
  if (!isKeyboardOpen.value) return undefined;
  return { paddingBottom: `calc(12px + env(safe-area-inset-bottom, 0px) + ${keyboardInset.value}px)` };
});

const sizeMenuPortalTarget = computed(() => {
  if (graphicsRoot.value) return graphicsRoot.value;
  return typeof document !== 'undefined' ? document.body : null;
});

const basePrice = computed(() => calcBasePriceFromDents(dents.value));
const totalPrice = computed(() =>
  calcTotalPrice(dents.value, props.form, props.initialData, 100)
);
const breakdown = computed(() => {
  const sizeCode = dents.value?.[0]?.sizeCode ?? 'STRIP_DEFAULT';
  return buildBreakdown(basePrice.value, props.form, props.initialData, sizeCode);
});
const dentsValid = computed(() => {
  if (dents.value.length === 0) return false;
  if (!selectedDentSize.value) return true;
  const w = Number(sizeWidthMm.value);
  const h = Number(sizeHeightMm.value);
  return Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
});

const stepHintText = computed(() => {
  switch (wizardStep.value) {
    case 1:
      return 'Выберите деталь. Добавьте вмятины и перетащите на место.';
    case 2:
      return 'Размеры в мм. Форма: круг/овал или полоса/царапина.';
    default:
      return '';
  }
});

watch(selectedDentSize, (info, oldInfo) => {
  if (info) {
    const w = Number(info.widthMm);
    const h = Number(info.heightMm);
    sizeWidthMm.value = Number.isFinite(w) && w > 0 ? Math.round(w * 10) / 10 : 0;
    sizeHeightMm.value = Number.isFinite(h) && h > 0 ? Math.round(h * 10) / 10 : 0;
  }
  const panelToggled = (info && !oldInfo) || (!info && oldInfo);
  if (panelToggled) nextTick(() => setTimeout(() => scheduleFit('controls-resize'), 50));
}, { immediate: true });

watch([sizeWidthMm, sizeHeightMm], () => {
  if (!selectedDentSize.value) return;
  if (sizeApplyTimeout) clearTimeout(sizeApplyTimeout);
  sizeApplyTimeout = setTimeout(() => {
    const w = Number(sizeWidthMm.value);
    const h = Number(sizeHeightMm.value);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      sizeApplyTimeout = null;
      return;
    }
    const cur = selectedDentSize.value;
    if (cur && Math.abs(cur.widthMm - w) < 0.01 && Math.abs(cur.heightMm - h) < 0.01) {
      sizeApplyTimeout = null;
      return;
    }
    setSelectedDentSizeMm(w, h);
    sizeApplyTimeout = null;
  }, 150);
});

watch(dents, (val) => {
  emit('dents-change', val);
  if (wizardStep.value === 2 && val.length === 0) {
    goToStep(1);
  }
}, { deep: true });

/**
 * Кнопка "Назад" в шапке.
 * Step 1: закрыть графический режим.
 * Step 2: → Step 1 (вмятины остаются, editable остаётся).
 * Step 3: → Step 2 (условия не сбрасывать, editable=true).
 * Step 4: → Step 3.
 */
function goBack() {
  switch (wizardStep.value) {
    case 1:
      emit('close');
      break;
    case 2:
      goToStep(1);
      break;
    case 3:
      goToStep(2);
      break;
    case 4:
      goToStep(3);
      break;
    default:
      goToStep(1);
  }
}

/**
 * Переход на шаг. Step 1–2: editable=true, Step 3–4: editable=false.
 * Контроль editable — в watch(wizardStep).
 */
function goToStep(step) {
  wizardStep.value = step;
}

/**
 * Полный сброс: wizardStep=1, все вмятины, условия, цены, UI-флаги.
 * Состояние как при первом заходе в графический режим.
 */
function resetAll() {
  if (sizeApplyTimeout) {
    clearTimeout(sizeApplyTimeout);
    sizeApplyTimeout = null;
  }
  resetDents();
  dents.value = [];
  selectedDentSize.value = null;
  sizeWidthMm.value = 0;
  sizeHeightMm.value = 0;
  dimensionsScrollGuard = false;
  activeToolType.value = null;
  freeStretchMode.value = true;
  setKeepRatio(false);
  showSizeMenu.value = false;
  props.form.repairCode = null;
  props.form.riskCode = null;
  props.form.materialCode = null;
  props.form.carClassCode = null;
  props.form.disassemblyCode = null;
  goToStep(1);
  emit('dents-change', []);
}

function openSizeMenu(type) {
  activeToolType.value = type;
  showSizeMenu.value = true;
}

function confirmAddShape(sizeCode) {
  if (!props.selectedPart) return;
  showSizeMenu.value = false;
  const type = activeToolType.value;
  const sizes = type === 'circle' ? props.circleSizes : props.stripSizes;
  addDent(type, sizeCode, sizes);
}

function deleteCurrent() {
  deleteSelected();
}

function onShapeVariantChange(variant) {
  setDentShapeVariant(variant);
}

function onFreeStretchChange(checked) {
  setKeepRatio(!checked);
}

const formatCurrency = (v) => new Intl.NumberFormat('ru-RU').format(v);

const initKonvaEditor = async () => {
  if (!konvaContainer.value || !props.selectedPart) return;
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '';
  await initKonva(
    konvaContainer.value,
    props.selectedPart,
    props.userSettings.prices,
    (newDents) => {
      dents.value = newDents;
      emit('dents-change', newDents);
    },
    baseUrl,
    (info) => { selectedDentSize.value = info; }
  );
  /* Применить текущий шаг (draggable формы vs handle) после init */
  setEditable(wizardStep.value <= 2, wizardStep.value);
  updateMobileGrid();
  /* Повторный fit после layout: контейнер мог иметь 0 размер при init */
  nextTick(() => setTimeout(() => scheduleFit('init-layout'), 150));
};

function updateMobileGrid() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
  setHideGridOnMobile(isMobile);
}

watch(
  () => wizardStep.value,
  (step) => {
    nextTick(() => {
      setEditable(step <= 2, step);
      updateMobileGrid();
      if (step === 2) {
        setKeepRatio(!freeStretchMode.value);
        setTimeout(() => scheduleFit('step2-show'), 200);
      }
      if (step >= 3) setTimeout(() => scheduleFit('resize'), 150);
    });
  },
  { immediate: true }
);

watch(
  () => [props.selectedClassId, props.selectedPartId, props.selectedPart],
  () => {
    nextTick(() => setTimeout(initKonvaEditor, 50));
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => setTimeout(initKonvaEditor, 100));
  updateMobileGrid();
  window.addEventListener('resize', updateMobileGrid);
  const vv = window.visualViewport;
  if (vv) {
    vv.addEventListener('resize', updateKeyboardInset);
    vv.addEventListener('scroll', updateKeyboardInset);
    updateKeyboardInset();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobileGrid);
  const vv = window.visualViewport;
  if (vv) {
    vv.removeEventListener('resize', updateKeyboardInset);
    vv.removeEventListener('scroll', updateKeyboardInset);
  }
  destroyKonva();
});
</script>

<style scoped>
/* Layout графики: fullscreen overlay, матрица занимает максимум */
.graphics-fullscreen-wrapper {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100dvh;
  max-height: 100dvh;
  width: 100vw;
  max-width: none;
  overflow: hidden;
  padding: 0;
  margin: 0;
  background: #000;
}

/* Верхняя панель: flex 0 0 auto, safe area */
.graphics-header {
  flex: 0 0 auto;
  padding-top: env(safe-area-inset-top, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

/* Матрица: flex 1 1 auto, min-height: 0 обязательно */
.graphics-stage-area {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: none;
  padding: 0;
  margin: 0;
}

/* Контейнер Konva: width 100vw, без max-width, padding 0 */
.matrix-container {
  width: 100vw;
  max-width: none;
  padding: 0;
  margin: 0;
}

.graphics-stage-area .canvas-editor-wrap {
  flex: 1 1 auto;
  min-height: 120px;
}

.graphics-stage-area.graphics-stage-preview .canvas-editor-wrap {
  flex: none;
}

/* Нижняя панель: flex 0 0 auto */
.graphics-controls-area {
  flex: 0 0 auto;
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Кнопка удаления вмятины на HUD (этап 1) */
.hud-delete-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: rgba(20, 20, 20, 0.85);
  color: #88e523;
  opacity: 0.35;
  filter: grayscale(1);
  cursor: default;
  pointer-events: none;
  transition: opacity 0.2s, filter 0.2s, background 0.2s;
}

@media (max-width: 480px) {
  .hud-delete-btn {
    right: 8px;
    bottom: 8px;
  }
  /* Этап 3: скрываем превью (матрица скрыта) — панель условий на весь экран */
  .graphics-stage-area.graphics-stage-preview {
    flex: 0 0 0 !important;
    min-height: 0 !important;
    height: 0 !important;
    overflow: hidden;
  }
  /* Overlay и Konva не перехватывают клики — панель условий кликабельна */
  .graphics-stage-area.graphics-stage-preview .step3-preview-overlay,
  .graphics-stage-area.graphics-stage-preview #konva-container {
    pointer-events: none;
  }
  /* Stage area: overflow чтобы превью не вылезало */
  .graphics-stage-area.graphics-stage-preview {
    overflow: hidden;
  }
  /* Controls area: flex-контейнер, Step3 заполняет и скроллит params */
  .graphics-controls-step3 {
    overflow: hidden;
  }
  .graphics-controls-step3 > * {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.hud-delete-btn--active {
  opacity: 1;
  filter: none;
  cursor: pointer;
  pointer-events: auto;
}

.hud-delete-btn--active:hover {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(136, 229, 35, 0.4);
}

.hud-delete-btn--active:active {
  transform: scale(0.96);
}

/* Подсказка этапа: читабельный шрифт, без наложения */
.step-hint-block {
  max-width: calc(100% - 1rem);
}
.step-hint-text {
  word-wrap: break-word;
  hyphens: auto;
}
</style>
