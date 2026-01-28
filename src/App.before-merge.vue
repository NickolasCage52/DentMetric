<template>
  <div id="app" class="max-w-md mx-auto relative h-screen flex flex-col bg-black text-white">
    <!-- Graphics Mode -->
    <div v-if="calcMode === 'graphics'" class="h-full flex flex-col">
      <!-- Step 1: Select Class -->
      <div v-if="graphicsStep === 1" class="space-y-4 animate-fade-in pt-4 p-4">
        <h2 class="text-xl font-bold text-center mb-4 text-white">Выберите класс</h2>
        <button
          v-for="cls in graphicsData.carClasses"
          :key="cls.id"
          @click="selectGraphicsClass(cls)"
          class="w-full card-metallic p-6 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-transform border border-white/5 hover:border-metric-green/50"
        >
          <span class="text-4xl">{{ cls.icon }}</span>
          <span class="font-bold text-lg tracking-wide">{{ cls.name }}</span>
        </button>
      </div>

      <!-- Step 2: Select Part -->
      <div v-if="graphicsStep === 2" class="animate-fade-in h-full flex flex-col pt-4 p-4">
        <div class="flex items-center justify-between mb-4">
          <button @click="graphicsStep = 1" class="text-sm text-metric-silver hover:text-white px-2">
            ← Назад
          </button>
          <h2 class="text-xl font-bold text-white">Выберите деталь</h2>
          <div class="w-8"></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="part in graphicsData.partsList"
            :key="part.id"
            @click="selectGraphicsPart(part)"
            class="aspect-square card-metallic border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/5 hover:border-metric-green/30"
          >
            <div class="text-metric-green text-opacity-80 font-black text-2xl">
              <span v-if="part.icon === 'door'">🚪</span>
              <span v-else-if="part.icon === 'hood'">🚘</span>
              <span v-else-if="part.icon === 'fender'">🚙</span>
              <span v-else-if="part.icon === 'trunk'">📦</span>
              <span v-else>🔧</span>
            </div>
            <span class="font-medium text-sm">{{ part.name }}</span>
          </button>
        </div>
      </div>

      <!-- Step 3: Canvas Editor -->
      <div v-if="graphicsStep === 3" class="flex flex-col h-full animate-fade-in pt-2 p-4">
        <div class="flex justify-between items-center mb-2">
          <button @click="closeEditor" class="text-xs text-metric-silver px-2 py-1 rounded border border-white/10 hover:text-white">
            ← Назад
          </button>
          <span class="text-xs text-metric-green font-bold uppercase tracking-widest">
            {{ graphicsState.selectedPart?.name }} • {{ graphicsState.selectedClass?.name }}
          </span>
          <button @click="resetGraphics" class="text-xs text-red-400 px-2 py-1 hover:text-red-300">
            Сброс
          </button>
        </div>

        <div class="flex-1 relative border border-white/10 rounded-xl overflow-hidden shadow-2xl konva-bg w-full min-h-[300px]" id="canvas-wrapper">
          <div ref="konvaContainer" id="konva-container" class="absolute inset-0 w-full h-full"></div>
          <div v-if="graphicsState.dents.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
            <div class="text-center">
              <div class="text-2xl mb-1">👆</div>
              <span class="text-xs uppercase font-bold tracking-widest">Нарисуйте вмятину</span>
            </div>
          </div>
        </div>

        <!-- Transform controls -->
        <div class="mt-3 grid grid-cols-3 gap-2 text-[11px]">
          <button
            type="button"
            class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 hover:border-metric-green/30 transition-all"
            @click="rotateLeft"
          >
            <span class="text-base">⟲ -15°</span>
            <span class="text-[9px] text-gray-500">Повернуть</span>
          </button>
          <button
            type="button"
            class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 hover:border-metric-green/30 transition-all"
            @click="rotateRight"
          >
            <span class="text-base">⟳ +15°</span>
            <span class="text-[9px] text-gray-500">Повернуть</span>
          </button>
          <button
            type="button"
            class="card-metallic px-2 py-2 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 hover:border-red-400/60 transition-all"
            @click="deleteCurrent"
          >
            <span class="text-base text-red-400">✕</span>
            <span class="text-[9px] text-gray-500">Удалить</span>
          </button>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-3">
          <button
            @click="openSizeMenu('circle')"
            class="card-metallic p-3 rounded-xl flex items-center gap-3 active:scale-95 hover:border-metric-green/30 transition-all"
          >
            <div class="w-6 h-6 rounded-full border-2 border-metric-green bg-metric-green/20"></div>
            <div class="text-left">
              <div class="font-bold text-xs text-white">Вмятина</div>
              <div class="text-[9px] text-gray-500">Круг/Овал</div>
            </div>
          </button>

          <button
            @click="openSizeMenu('strip')"
            class="card-metallic p-3 rounded-xl flex items-center gap-3 active:scale-95 hover:border-metric-green/30 transition-all"
          >
            <div class="w-6 h-2 bg-metric-silver rotate-45 rounded-sm"></div>
            <div class="text-left">
              <div class="font-bold text-xs text-white">Полоса</div>
              <div class="text-[9px] text-gray-500">Царапина</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Size Menu Modal -->
      <div
        v-if="showSizeMenu"
        class="absolute inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
        @click.self="showSizeMenu = false"
      >
        <div class="bg-[#151F2E] w-full rounded-t-2xl p-5 border-t border-white/10 shadow-2xl space-y-4 pb-8">
          <div class="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 class="text-white font-bold text-lg pl-1">
              Выберите размер ({{ activeToolType === 'circle' ? 'Круг/Овал' : 'Полоса' }})
            </h3>
            <button @click="showSizeMenu = false" class="text-gray-400 p-2 text-xl">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
            <button
              v-for="s in (activeToolType === 'circle' ? initialData.circleSizes : initialData.stripSizes)"
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
    </div>

    <!-- Total Price Display -->
    <div v-if="graphicsStep === 3" class="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 card-metallic rounded-2xl p-4 relative overflow-hidden text-center max-w-[90%]">
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      <div class="text-[11px] uppercase font-bold text-gray-400 tracking-widest mb-1">Итоговая оценка</div>
      <div
        class="text-5xl font-black transition-all duration-300"
        :class="totalPrice > 0 ? 'text-metric-green drop-shadow-[0_0_15px_rgba(136,229,35,0.3)]' : 'text-gray-600'"
      >
        {{ totalPrice > 0 ? formatCurrency(totalPrice) : '---' }}
        <span v-if="totalPrice > 0" class="text-2xl align-top">₽</span>
      </div>
      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-4 blur-xl transition-all duration-300"
        :class="totalPrice > 0 ? 'bg-metric-green/10' : 'bg-transparent'"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { initKonva, destroyKonva, addDent, resetDents, rotateSelected, deleteSelected } from './graphics/konvaEditor';
import { initialData } from './data/initialData';
import { CAR_PARTS } from './data/carParts';

// State
const calcMode = ref('graphics');
const graphicsStep = ref(1); // 1=Class, 2=Part, 3=Canvas

const graphicsState = reactive({
  selectedClass: null,
  selectedPart: null,
  dents: []
});

const showSizeMenu = ref(false);
const activeToolType = ref(null);
const konvaContainer = ref(null);

// Graphics Data
const graphicsData = {
  carClasses: [
    { id: 'sedan', name: 'Седан', icon: '🚗' },
    { id: 'crossover', name: 'Кроссовер', icon: '🚙' },
    { id: 'suv', name: 'Внедорожник', icon: '🚜' }
  ],
  partsList: Object.values(CAR_PARTS)
};

// User settings (simplified - prices)
const userSettings = reactive({
  prices: {}
});

// Build default prices
const buildDefaultPrices = () => {
  const p = {};
  initialData.circleSizes.forEach(s => p[s.code] = s.basePrice);
  initialData.stripSizes.forEach(s => p[s.code] = s.basePrice);
  return p;
};

// Initialize prices
Object.assign(userSettings.prices, buildDefaultPrices());

// Load from localStorage if available
const saved = localStorage.getItem('dentRepairSettings_v5');
if (saved) {
  try {
    const p = JSON.parse(saved);
    if (p.prices) {
      Object.assign(userSettings.prices, p.prices);
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
}

// Methods
const formatCurrency = (v) => new Intl.NumberFormat('ru-RU').format(v);

const haptic = (type) => {
  const tg = window.Telegram?.WebApp;
  if (!tg?.HapticFeedback) return;
  if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
    if (type === 'selection') tg.HapticFeedback.selectionChanged();
    if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
  }
};

const selectGraphicsClass = (cls) => {
  graphicsState.selectedClass = cls;
  graphicsStep.value = 2;
  haptic('selection');
};

const selectGraphicsPart = (part) => {
  graphicsState.selectedPart = part;
  graphicsStep.value = 3;
  haptic('selection');
  nextTick(() => {
    setTimeout(() => {
      initKonvaEditor();
    }, 100);
  });
};

const closeEditor = () => {
  graphicsStep.value = 2;
  graphicsState.dents = [];
  resetDents();
  haptic('selection');
};

const resetGraphics = () => {
  resetDents();
  graphicsState.dents = [];
  haptic('selection');
};

const initKonvaEditor = () => {
  if (!konvaContainer.value || !graphicsState.selectedPart) return;
  
  initKonva(
    konvaContainer.value,
    graphicsState.selectedPart,
    userSettings.prices,
    (dents) => {
      graphicsState.dents = dents;
    }
  );
};

const openSizeMenu = (type) => {
  haptic('selection');
  activeToolType.value = type;
  showSizeMenu.value = true;
};

const confirmAddShape = (sizeCode) => {
  if (!graphicsState.selectedPart) return;
  
  haptic('selection');
  showSizeMenu.value = false;

  const type = activeToolType.value;
  const sizes = type === 'circle' ? initialData.circleSizes : initialData.stripSizes;
  
  addDent(type, sizeCode, sizes);
};

// Rotation & delete controls
const rotateLeft = () => {
  rotateSelected(-15);
};

const rotateRight = () => {
  rotateSelected(15);
};

const deleteCurrent = () => {
  deleteSelected();
};

// Graphics Price Logic
const graphicsPrice = computed(() => {
  if (graphicsState.dents.length === 0) return 0;
  const sorted = [...graphicsState.dents].sort((a, b) => b.price - a.price);
  let total = sorted[0].price;
  for (let i = 1; i < sorted.length; i++) {
    total += sorted[i].price * 0.5; // 50% discount for additional dents
  }
  return Math.round(total / 100) * 100;
});

const totalPrice = computed(() => {
  if (graphicsStep.value === 3) {
    return graphicsPrice.value;
  }
  return 0;
});

// Telegram Main Button Sync
watch(totalPrice, (val) => {
  if (window.Telegram?.WebApp?.MainButton) {
    const btn = window.Telegram.WebApp.MainButton;
    if (val > 0) {
      btn.setText(`ИТОГО: ${formatCurrency(val)} ₽`);
      btn.show();
    } else {
      btn.hide();
    }
  }
});

const handleKeyDown = (e) => {
  if (graphicsStep.value !== 3) return;
  // delete current dent by keyboard
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    deleteSelected();
  }
};

onMounted(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.MainButton.setParams({
      color: '#88E523',
      text_color: '#000000'
    });
  }
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  destroyKonva();
});
</script>

<style scoped>
.card-metallic {
  background: linear-gradient(180deg, #2b2b2b 0%, #121212 100%);
  border: 1px solid #333;
  border-top-color: #404040;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.konva-bg {
  background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 25px 25px;
}

.text-metric-green {
  color: #88e523;
}

.text-metric-silver {
  color: #a0aec0;
}

.bg-metric-green {
  background-color: #88e523;
}

.border-metric-green {
  border-color: #88e523;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
