<template>
  <div ref="appRootRef" class="app-root max-w-md mx-auto relative h-screen flex flex-col text-white pb-[env(safe-area-inset-bottom)]" :class="{ 'app-root--gradient': currentSection === 'home', 'app-root--solid': currentSection !== 'home' }">
    <!-- Home -->
    <div v-if="currentSection === 'home'" class="home-screen flex flex-col h-full pb-24">
      <div class="flex items-start justify-between px-4 pt-5">
        <div class="flex-1"></div>
        <button
          type="button"
          @click="showLockedStub('Раздел в разработке 🔒')"
          class="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-lg hover:bg-white/10 hover:border-metric-green/30 transition-all"
          aria-label="Профиль"
        >
          👤
        </button>
      </div>
      <div class="flex-1 flex flex-col items-center justify-center px-4 py-4 relative">
        <div class="home-logo-wrap absolute top-6 left-1/2 -translate-x-1/2 z-10">
          <img src="/logo.png" alt="DentMetric" class="home-logo w-full max-w-[200px] h-auto object-contain relative z-10" onerror="this.style.display='none'">
        </div>
        <div class="home-buttons-grid relative z-10">
          <button
            data-testid="btn-open-metric"
            @click="openMetricMenu"
            class="home-btn home-btn-primary card-metallic btn-glow pulse-animation rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-metric-green/40 shadow-neon min-h-[110px] w-full"
          >
            <svg class="home-btn-icon w-8 h-8 text-metric-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="text-sm font-bold uppercase tracking-wider">Метрика</span>
            <span class="text-[10px] text-gray-500">Расчёт стоимости</span>
          </button>
          <button
            @click="switchSection('analytics')"
            class="home-btn card-metallic btn-glow rounded-2xl p-5 flex flex-col items-center justify-center gap-2 opacity-75 min-h-[110px] w-full border border-white/10 hover:border-metric-green/30 hover:opacity-100"
          >
            <svg class="home-btn-icon w-8 h-8 text-metric-green/90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="text-sm font-bold uppercase tracking-wider">Аналитика</span>
            <span class="text-[10px] text-gray-500">В разработке 🔒</span>
          </button>
          <button
            data-testid="btn-history"
            @click="switchSection('history')"
            class="home-btn home-btn-primary card-metallic btn-glow pulse-animation rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-metric-green/40 min-h-[110px] w-full hover:border-metric-green/60"
          >
            <svg class="home-btn-icon w-8 h-8 text-metric-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span class="text-sm font-bold uppercase tracking-wider">История оценок</span>
            <span class="text-[10px] text-gray-500">Сохранённые расчёты</span>
          </button>
          <button
            @click="switchSection('journal')"
            class="home-btn card-metallic btn-glow rounded-2xl p-5 flex flex-col items-center justify-center gap-2 opacity-75 min-h-[110px] w-full border border-white/10 hover:border-metric-green/30 hover:opacity-100"
          >
            <svg class="home-btn-icon w-8 h-8 text-metric-green/90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="text-sm font-bold uppercase tracking-wider">Журнал записи</span>
            <span class="text-[10px] text-gray-500">В разработке 🔒</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Section: Metric -->
    <div v-else-if="currentSection === 'metric'" class="flex flex-col h-full">
      <!-- Full-screen mode picker (replaces bottom sheet) -->
      <div v-if="!calcMode" class="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 pb-24">
        <div class="flex-1 flex flex-col justify-center py-8">
          <div class="flex items-center justify-center mb-8">
            <img src="/dm-small.png" alt="DentMetric" class="h-8 w-auto object-contain drop-shadow-2xl" onerror="this.style.display='none'">
          </div>
          <p class="text-[10px] font-bold uppercase text-metric-green tracking-widest text-center mb-6">Выбор режима расчёта</p>
          <div class="metric-menu-grid">
            <button
              data-testid="metric-standard"
              @click="selectMetricMode('standard')"
              class="home-btn home-btn-primary card-metallic btn-glow pulse-animation rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-metric-green/40 shadow-neon min-h-[110px] w-full"
            >
              <svg class="home-btn-icon w-8 h-8 text-metric-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span class="text-sm font-bold uppercase tracking-wider">Быстрый</span>
              <span class="text-[10px] text-gray-500">Короткий расчёт</span>
            </button>
            <button
              data-testid="metric-graphics"
              @click="selectMetricMode('graphics')"
              class="home-btn home-btn-primary card-metallic btn-glow pulse-animation rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border border-metric-green/40 shadow-neon min-h-[110px] w-full"
            >
              <svg class="home-btn-icon w-8 h-8 text-metric-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span class="text-sm font-bold uppercase tracking-wider">Детализация</span>
              <span class="text-[10px] text-gray-500">Графический режим</span>
            </button>
            <button
              @click="selectMetricMode('time')"
              class="home-btn card-metallic btn-glow rounded-2xl p-5 flex flex-col items-center justify-center gap-2 opacity-75 min-h-[110px] w-full border border-white/10 hover:border-metric-green/30 hover:opacity-100"
            >
              <svg class="home-btn-icon w-8 h-8 text-metric-green/90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="text-sm font-bold uppercase tracking-wider">Град</span>
              <span class="text-[10px] text-gray-500">В разработке 🔒</span>
            </button>
            <div class="metric-menu-empty" aria-hidden="true"></div>
          </div>
        </div>
      </div>

      <template v-else>
      <div v-if="calcMode !== 'graphics'" class="p-4 space-y-3 shrink-0 z-20 bg-black">
        <div class="flex items-center justify-center">
          <img src="/dm-small.png" alt="DentMetric" class="h-7 w-auto object-contain drop-shadow-2xl" onerror="this.style.display='none'">
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 pt-0 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]" :class="{ 'overflow-hidden h-0': calcMode === 'graphics' }">
        <!-- Standard mode -->
        <div v-if="calcMode === 'standard'" class="flex flex-col min-h-full">
          <div data-testid="step-dots" class="flex items-center justify-center pb-2">
            <StepDots :current-step="quickLogicalStep" :total-steps="quickTotalSteps" />
          </div>

          <div class="space-y-4 pb-40">
            <div v-if="quickStep === 1 && userSettings.showClientQuick" class="space-y-4">
              <div class="card-metallic rounded-2xl p-5 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Данные клиента</span>
                    <InfoIcon v-if="userSettings.showInfoTooltips" tooltip-text="Заполните контактные данные клиента и информацию об автомобиле. Эти поля можно сделать обязательными в настройках." />
                  </div>
                  <span v-if="userSettings.clientRequired" class="text-[10px] text-red-400 uppercase tracking-widest">обязательно</span>
                  <span v-else class="text-[10px] text-gray-500">опционально</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input v-model="estimateDraft.clientName" @focus="scrollFieldIntoView" placeholder="Имя клиента" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.clientCompany" @focus="scrollFieldIntoView" placeholder="Компания / Юр. лицо" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.clientPhone" @focus="scrollFieldIntoView" placeholder="Телефон" inputmode="tel" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.carBrand" @focus="scrollFieldIntoView" placeholder="Марка автомобиля" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.carModel" @focus="scrollFieldIntoView" placeholder="Модель автомобиля" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.inspectDate" @focus="scrollFieldIntoView" type="date" placeholder="Дата осмотра" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                  <input v-model="estimateDraft.inspectTime" @focus="scrollFieldIntoView" type="time" placeholder="Время осмотра" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
                </div>
                <p v-if="userSettings.clientRequired && !clientDataValid" class="text-[10px] text-gray-500 text-center">Заполните обязательные поля</p>
              </div>
            </div>

            <div v-else-if="quickStep === 2 || (quickStep === 1 && !userSettings.showClientQuick)" class="space-y-4">
              <div class="space-y-3">
                <div
                  v-for="(dent, idx) in estimateDraft.quickDents"
                  :key="dent.id"
                  class="card-metallic rounded-2xl p-5 space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <div class="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Вмятина {{ idx + 1 }}</div>
                    <button
                      type="button"
                      @click="removeQuickDent(dent.id)"
                      class="p-2 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                      aria-label="Удалить"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Сторона</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        @click="setQuickDentSide(dent, 'left')"
                        class="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-all"
                        :class="dent.panelSide === 'left' ? 'bg-metric-green text-black border-metric-green shadow-neon' : 'bg-[#151515] border-white/10 text-gray-400'"
                      >
                        Левая
                      </button>
                      <button
                        type="button"
                        @click="setQuickDentSide(dent, 'right')"
                        class="rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-all"
                        :class="dent.panelSide === 'right' ? 'bg-metric-green text-black border-metric-green shadow-neon' : 'bg-[#151515] border-white/10 text-gray-400'"
                      >
                        Правая
                      </button>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center gap-1.5 mb-2">
                      <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Поврежденный элемент</label>
                      <InfoIcon v-if="userSettings.showInfoTooltips" tooltip-text="Выберите деталь кузова, на которой расположена вмятина (капот, дверь, крыло и т.д.)." />
                    </div>
                    <div class="relative">
                      <select
                        v-model="dent.panelElement"
                        @change="onQuickDentElementChange(dent)"
                        :class="['w-full rounded-xl px-4 py-3 text-base font-medium shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors', dent.panelElement ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                      >
                        <option :value="null" disabled>Select Element</option>
                        <option v-for="part in (dent.panelSide === 'right' ? quickPartsRight : quickPartsLeft)" :key="part" :value="part">{{ part }}</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center gap-1.5 mb-2">
                      <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ГЕОМЕТРИЯ ПОВРЕЖДЕНИЯ</span>
                      <InfoIcon v-if="userSettings.showInfoTooltips" tooltip-text="Круг/Овал — точечные вмятины. Полоса — удлинённые повреждения, царапины. Система автоматически подбирает форму по соотношению сторон (L/H ≥ 2.5 → Полоса)." />
                    </div>
                    <div class="flex space-x-3">
                    <div
                      @click="setQuickDentShape(dent, 'circle')"
                      class="flex-1 relative rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border"
                      :class="dent.shape === 'circle' ? 'bg-[#222] border-metric-green shadow-neon' : 'bg-[#151515] border-white/5 hover:border-white/10'"
                    >
                      <div
                        class="w-4 h-4 rounded-full border-2 mb-2 shadow-[0_0_5px_currentColor]"
                        :class="dent.shape === 'circle' ? 'border-metric-green bg-metric-green' : 'border-gray-500'"
                      ></div>
                      <span class="text-xs font-bold uppercase" :class="dent.shape === 'circle' ? 'text-white' : 'text-gray-400'">Круг/Овал</span>
                    </div>
                    <div
                      @click="setQuickDentShape(dent, 'strip')"
                      class="flex-1 relative rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border"
                      :class="dent.shape === 'strip' ? 'bg-[#222] border-metric-green shadow-neon' : 'bg-[#151515] border-white/5 hover:border-white/10'"
                    >
                      <div
                        class="w-6 h-2 rounded-sm mb-3 shadow-[0_0_5px_currentColor]"
                        :class="dent.shape === 'strip' ? 'bg-metric-green' : 'bg-gray-500'"
                      ></div>
                      <span class="text-xs font-bold uppercase" :class="dent.shape === 'strip' ? 'text-white' : 'text-gray-400'">Полоса</span>
                    </div>
                    </div>
                  </div>

                  <div class="mb-2">
                    <div class="flex items-center gap-1.5 mb-2">
                      <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Размер повреждения</label>
                      <InfoIcon v-if="userSettings.showInfoTooltips" tooltip-text="Выберите шаблонный размер или введите произвольные длину и ширину в мм. Длина — большая сторона, ширина — меньшая." />
                    </div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 tracking-widest">РАЗМЕР ПО ШАБЛОНУ</label>
                    <div class="relative group mb-3">
                      <select
                        v-model="dent.sizeCode"
                        required
                        @change="onQuickDentSizeCodeChange(dent)"
                        :class="['w-full rounded-xl px-4 py-3 text-lg font-semibold shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none appearance-none transition-colors', dent.sizeCode ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                      >
                        <option :value="null" disabled selected>Выберите размер</option>
                        <option v-for="size in getSizeListForShape(dent.shape)" :key="size.code" :value="size.code">{{ size.name }}</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    <div class="mb-1">
                      <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Произвольный размер</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Длина (мм)</label>
                      <input
                        data-testid="dent-size-length"
                        v-model.number="dent.sizeLengthMm"
                        @input="syncQuickDentSizeFromMm(dent)"
                        @blur="syncQuickDentSizeFromMm(dent)"
                        @focus="scrollFieldIntoView"
                        type="number"
                        min="0.1"
                        step="0.5"
                        inputmode="decimal"
                        :class="['w-full rounded-xl px-4 py-3 text-lg font-semibold shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none transition-colors', (dent.sizeLengthMm && dent.sizeLengthMm > 0) ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                      >
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Ширина (мм)</label>
                      <input
                        data-testid="dent-size-width"
                        v-model.number="dent.sizeWidthMm"
                        @input="syncQuickDentSizeFromMm(dent)"
                        @blur="syncQuickDentSizeFromMm(dent)"
                        @focus="scrollFieldIntoView"
                        type="number"
                        min="0.1"
                        step="0.5"
                        inputmode="decimal"
                        :class="['w-full rounded-xl px-4 py-3 text-lg font-semibold shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none transition-colors', (dent.sizeWidthMm && dent.sizeWidthMm > 0) ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                      >
                    </div>
                  </div>
                  </div>

                  <div class="rounded-2xl border border-metric-green/20 bg-[#0d0d0d]/80 p-4">
                    <div class="flex items-center gap-1.5 mb-3">
                      <span class="text-[10px] font-bold text-metric-green uppercase tracking-widest">ПАРАМЕТРЫ РАСЧЁТА</span>
                      <InfoIcon v-if="userSettings.showInfoTooltips" tooltip-text="Технология ремонта, сложность, материал панели и класс авто влияют на итоговую стоимость. Материал ЛКП — тип лакокрасочного покрытия (глянец, мат, плёнка)." />
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Технология ремонта</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.repairCode"
                          required
                          :class="['w-full rounded-xl px-3 py-2.5 text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors', dent.conditions.repairCode ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="r in initialData.repairTypes" :key="r.code" :value="r.code">{{ r.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">EXECUTION COMPLEXITY</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.riskCode"
                          required
                          :class="['w-full rounded-xl px-3 py-2.5 text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors', dent.conditions.riskCode ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="risk in initialData.risks" :key="risk.code" :value="risk.code">{{ risk.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Материал панели</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.materialCode"
                          required
                          :class="['w-full rounded-xl px-3 py-2.5 text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors', dent.conditions.materialCode ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="m in initialData.materials" :key="m.code" :value="m.code">{{ m.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">МАТЕРИАЛ ЛКП</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.paintMaterialCode"
                          :class="['w-full rounded-xl px-3 py-2.5 text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors', dent.conditions.paintMaterialCode ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="p in initialData.paintMaterials" :key="p.code" :value="p.code">{{ p.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                      <p v-if="dent.conditions.paintMaterialCode" class="text-[9px] text-gray-500 mt-1 ml-1">{{ (initialData.paintMaterials.find(p => p.code === dent.conditions.paintMaterialCode))?.desc }}</p>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Класс автомобиля</label>
                      <div class="relative">
                        <select
                          v-model="dent.conditions.carClassCode"
                          required
                          :class="['w-full rounded-xl px-3 py-2.5 text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors', dent.conditions.carClassCode ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                        >
                          <option :value="null" disabled selected>Выберите</option>
                          <option v-for="c in initialData.carClasses" :key="c.code" :value="c.code">{{ c.name }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-span-2">
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Арматурные работы</label>
                    <p class="text-[9px] text-gray-500 mb-2 ml-1">Сначала выберите поврежденный элемент. Работы зависят от элемента.</p>
                    <div class="relative">
                      <select
                        :value="(dent.conditions.disassemblyCodes || ['Z0'])[0]"
                        @change="onArmaturnayaSelect(dent, $event.target.value)"
                        :class="['w-full rounded-xl px-4 py-3 text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors', (dent.conditions.disassemblyCodes || ['Z0'])[0] ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                      >
                        <option
                          v-for="work in getArmaturnayaWorksForElement(dent.panelElement)"
                          :key="work.code"
                          :value="work.code"
                        >
                          {{ work.name }}{{ work.price > 0 ? ' — ' + work.price.toLocaleString('ru-RU') + ' ₽' : '' }}
                        </option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Noise Insulation</label>
                    <div class="relative">
                      <select
                        v-model="dent.conditions.soundInsulationCode"
                        :class="['w-full rounded-xl px-3 py-2.5 text-sm focus:border-metric-green/50 outline-none appearance-none transition-colors', dent.conditions.soundInsulationCode ? 'bg-[#1a1a1a] border border-metric-green/40 text-white' : 'bg-[#151515] border border-[#333] text-gray-400']"
                      >
                        <option :value="null" disabled selected>Выберите</option>
                        <option v-for="s in initialData.soundInsulation" :key="s.code" :value="s.code" :title="s.desc">{{ s.name }}</option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg class="w-3 h-3 text-metric-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    <p v-if="dent.conditions.soundInsulationCode" class="text-[9px] text-gray-500 mt-1 ml-1">{{ (initialData.soundInsulation.find(s => s.code === dent.conditions.soundInsulationCode))?.desc }}</p>
                  </div>
                  </div>

                  <div class="flex justify-between text-[11px] text-gray-400 pt-1">
                    <span>Подитог:</span>
                    <span class="text-white font-medium">{{ formatRoundedPrice(getQuickDentTotal(dent.id)) }} ₽</span>
                  </div>
                </div>

                <button
                  data-testid="btn-add-dent"
                  type="button"
                  @click="addQuickDent"
                  class="w-full py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl transition-all hover:bg-metric-green/10 min-h-[44px]"
                >
                  + Добавить вмятину
                </button>
              </div>
            </div>

            <div v-else-if="quickStep === 3" class="space-y-4">
              <div class="card-metallic rounded-2xl p-5 space-y-3" v-if="quickLineItems.length">
                <div class="text-xs font-bold text-metric-green uppercase tracking-widest">Вмятины</div>
                <div v-for="(item, idx) in quickLineItems" :key="item.dent.id" class="border-b border-white/10 pb-3 mb-3 last:mb-0 last:pb-0 last:border-0">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Вмятина {{ idx + 1 }} · {{ getQuickDentLabel(item.dent) }}</span>
                    <span class="text-white font-semibold text-base">{{ formatRoundedPrice(item.appliedTotal) }} ₽</span>
                  </div>
                  <div class="text-sm text-gray-500">
                    <span class="text-lg font-semibold text-gray-300">Размер повреждения: {{ formatSizeDisplay(item.dent.sizeLengthMm, item.dent.sizeWidthMm) }}</span>
                    <span v-if="item.discount" class="text-sm"> · -50% доп. вмятина</span>
                  </div>
                </div>
                <div class="border-t border-white/10 pt-3 mt-3 flex justify-between items-baseline">
                  <span class="text-metric-green font-bold text-base">Итог:</span>
                  <span data-testid="total-price" class="text-metric-green font-bold text-2xl">{{ formatCurrency(displayTotal) }} ₽</span>
                </div>
                <div class="border-t border-white/10 pt-3 mt-3 flex justify-between items-center">
                  <span class="text-gray-400 text-base">ВРЕМЯ РЕМОНТА:</span>
                  <span class="text-white font-semibold text-lg">{{ estimatedRepairTime }}</span>
                </div>
              </div>

              <div v-if="quickLineItems.length" class="space-y-3">
                <div
                  v-for="(dentItem, idx) in quickLineItems"
                  :key="dentItem.dent.id"
                  class="card-metallic rounded-2xl p-5 space-y-2"
                >
                  <div class="text-xs font-bold text-metric-green uppercase tracking-widest">Расчёт стоимости · Вмятина {{ idx + 1 }}</div>
                  <div v-for="(line, lineIdx) in dentItem.breakdown" :key="lineIdx" class="flex justify-between text-sm">
                    <span class="text-gray-400">{{ line.name }}:</span>
                    <span class="text-white font-medium text-base">{{ line.value }}</span>
                  </div>
                  <div class="border-t border-white/10 pt-2 mt-2 flex justify-between text-sm">
                    <span class="text-gray-400">Итог по вмятине:</span>
                    <span class="text-white font-semibold text-base">{{ formatRoundedPrice(dentItem.total) }} ₽</span>
                  </div>
                  <div v-if="dentItem.discount" class="flex justify-between text-sm">
                    <span class="text-gray-400">Итог с 50%:</span>
                    <span class="text-white font-semibold text-base">{{ formatRoundedPrice(dentItem.appliedTotal) }} ₽</span>
                  </div>
                </div>
              </div>

              <div class="card-metallic rounded-2xl p-5 space-y-2">
                <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Комментарий</div>
                <textarea
                  v-model="estimateDraft.comment"
                  @focus="scrollFieldIntoView"
                  rows="3"
                  placeholder="Комментарий к оценке (необязательно)"
                  class="w-full bg-[#151515] border border-[#333] rounded-xl px-4 py-3 text-white text-sm shadow-inner focus:border-metric-green/50 outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="quick-nav-bar fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] bg-black border-t border-white/10 shrink-0 z-10">
            <div v-if="calcMode === 'standard'" class="flex justify-end mb-1">
              <button
                type="button"
                @click="resetDraftState"
                class="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg px-3 py-1.5 transition-colors"
              >
                СБРОС
              </button>
            </div>
            <div v-if="quickStep < 3" class="quick-nav-buttons flex">
              <button
                type="button"
                @click="goQuickBack"
                class="quick-nav-btn quick-nav-btn-back flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 min-h-[44px]"
              >
                Назад
              </button>
              <button
                data-testid="btn-go-next"
                type="button"
                @click="goQuickNext"
                :disabled="(quickStep === 1 && userSettings.showClientQuick && !clientDataValid) || ((quickStep === 2 || (quickStep === 1 && !userSettings.showClientQuick)) && !quickStep2Valid)"
                class="quick-nav-btn quick-nav-btn-next flex-1 py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 transition-all hover:bg-metric-green/10 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперёд
              </button>
            </div>
            <div v-else class="space-y-2">
              <div class="quick-nav-buttons flex">
                <button
                  type="button"
                  @click="goQuickBack"
                  class="quick-nav-btn quick-nav-btn-back flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 min-h-[44px]"
                >
                  Назад
                </button>
                <button
                  data-testid="btn-save-estimate"
                  type="button"
                  @click="saveCurrentEstimate('quick')"
                  class="quick-nav-btn quick-nav-btn-next flex-1 py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 transition-all hover:bg-metric-green/10 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isSavingHistory || !quickStep3Ready"
                >
                  {{ isSavingHistory ? 'Сохранение...' : 'Сохранить в историю' }}
                </button>
              </div>
              <button
                type="button"
                @click="showLockedStub('Раздел в разработке 🔒')"
                class="cta-primary w-full py-3 text-xs font-bold uppercase tracking-widest text-black bg-metric-green rounded-xl active:opacity-90 shadow-[0_0_15px_rgba(136,229,35,0.4)]"
                :disabled="!quickStep3Ready"
              >
                Записать на ремонт
              </button>
            </div>
          </div>
        </div>

        <!-- Time mode (locked) -->
        <div v-if="calcMode === 'time'" class="space-y-4">
          <div class="card-metallic rounded-2xl p-5 text-center text-gray-400">
            <div class="text-lg mb-2">🔒</div>
            <div class="text-sm">Раздел в разработке</div>
          </div>
        </div>

        <!-- Graphics mode: wizard из 4 шагов -->
      <GraphicsWizard
          v-if="calcMode === 'graphics'"
          v-model:selected-class-id="graphicsSelectedClassId"
          v-model:selected-part-id="graphicsSelectedPartId"
          :form="form"
          :initial-data="initialData"
          :user-settings="userSettings"
          :car-classes="graphicsData.carClasses"
          :parts-list="graphicsPartsList"
          :selected-part="graphicsState.selectedPart"
          :circle-sizes="graphicsCircleSizes"
          :strip-sizes="graphicsStripSizes"
        :estimate-draft="estimateDraft"
        :history-saving="isSavingHistory"
          :client-required="userSettings.clientRequired"
          :client-valid="clientDataValid"
          :show-client-step="userSettings.showClientDetail"
          :auto-save="userSettings.autoSaveHistory"
        @home="goHome"
          @close="closeEditor"
          @dents-change="(d) => graphicsState.dents = d"
        @save-history="saveCurrentEstimate('detail')"
        />
      </div>
      </template>
    </div>

    <!-- Section: Settings -->
    <div v-else-if="currentSection === 'history'" class="p-4 space-y-4 overflow-y-auto pb-24">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <img src="/dm-small.png" alt="DentMetric" class="h-8 w-auto object-contain" onerror="this.style.display='none'">
        <button
          type="button"
          @click="clearHistoryConfirm"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px]"
          :disabled="historyItems.length === 0"
        >
          Очистить
        </button>
      </div>

      <div v-if="selectedHistory" class="space-y-3">
        <div class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-xs text-gray-400 uppercase tracking-widest">Сохранённая оценка</div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Дата:</span>
            <span class="text-white font-medium">{{ formatDateTime(selectedHistory.createdAt) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Режим:</span>
            <span class="text-white font-medium">{{ selectedHistory.mode === 'detail' ? 'Детализация' : 'Быстрый расчёт' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Поврежденный элемент:</span>
            <span class="text-white font-medium">{{ selectedHistory.element || '—' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">Итог:</span>
            <span class="text-metric-green font-bold">{{ formatCurrency(selectedHistory.total || 0) }} ₽</span>
          </div>
        </div>

        <div v-if="!isEditingHistory" class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Клиент</div>
          <div class="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
            <div>Имя: <span class="text-white">{{ selectedHistory.client?.name || '—' }}</span></div>
            <div>Компания: <span class="text-white">{{ selectedHistory.client?.company || '—' }}</span></div>
            <div>Тел: <span class="text-white">{{ selectedHistory.client?.phone || '—' }}</span></div>
            <div>Марка: <span class="text-white">{{ selectedHistory.client?.brand || '—' }}</span></div>
            <div>Модель: <span class="text-white">{{ selectedHistory.client?.model || '—' }}</span></div>
            <div>Дата: <span class="text-white">{{ selectedHistory.client?.date || '—' }}</span></div>
            <div>Время: <span class="text-white">{{ selectedHistory.client?.time || '—' }}</span></div>
          </div>
        </div>

        <div v-else class="card-metallic rounded-2xl p-4 space-y-3">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Редактирование</div>
          <div class="grid grid-cols-2 gap-2">
            <input v-model="historyEditDraft.clientName" placeholder="Имя" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.clientCompany" placeholder="Компания" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.clientPhone" placeholder="Тел" inputmode="tel" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.carBrand" placeholder="Марка" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.carModel" placeholder="Модель" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.inspectDate" type="date" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
            <input v-model="historyEditDraft.inspectTime" type="time" class="bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm focus:border-metric-green/50 outline-none">
          </div>
          <textarea
            v-model="historyEditDraft.comment"
            rows="3"
            placeholder="Комментарий (необязательно)"
            class="w-full bg-[#151515] border border-[#333] rounded-xl px-3 py-2.5 text-white text-sm shadow-inner focus:border-metric-green/50 outline-none resize-none"
          ></textarea>
          <div class="flex gap-2">
            <button
              type="button"
              @click="cancelHistoryEdit"
              class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 rounded-xl min-h-[44px]"
            >
              Отмена
            </button>
            <button
              type="button"
              @click="saveHistoryEdit"
              class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isUpdatingHistory"
            >
              {{ isUpdatingHistory ? 'Сохранение...' : 'Сохранить' }}
            </button>
          </div>
        </div>

        <div v-if="selectedHistory.dents?.items?.length" class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Вмятины</div>
          <div v-for="dent in selectedHistory.dents.items" :key="dent.id" class="text-[11px] text-gray-400 flex justify-between">
            <span>
              {{ dent.type }} · {{ dent.bboxMm?.width?.toFixed?.(1) || '—' }}×{{ dent.bboxMm?.height?.toFixed?.(1) || '—' }} мм
              <span v-if="dent.panelElement">· {{ (dent.panelSide || 'left') + ':' }}{{ dent.panelElement }}</span>
            </span>
            <span v-if="dent.areaMm2" class="text-white">{{ Math.round(dent.areaMm2) }} мм²</span>
          </div>
        </div>

        <div v-if="selectedHistory.breakdown?.length" class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Расчёт</div>
          <div v-for="(item, idx) in selectedHistory.breakdown" :key="idx" class="flex justify-between text-[11px]">
            <span class="text-gray-400">{{ item.name }}:</span>
            <span class="text-white font-medium">{{ item.value }}</span>
          </div>
        </div>

        <div v-if="selectedHistory.comment && !isEditingHistory" class="card-metallic rounded-2xl p-4 space-y-2">
          <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Комментарий</div>
          <div class="text-sm text-gray-300">{{ selectedHistory.comment }}</div>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            @click="selectedHistoryId = null"
            class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 border border-white/10 rounded-xl min-h-[44px]"
          >
            Назад к списку
          </button>
          <button
            v-if="!isEditingHistory"
            type="button"
            @click="startHistoryEdit"
            class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-metric-green border border-metric-green/40 rounded-xl min-h-[44px]"
          >
            Редактировать
          </button>
          <button
            type="button"
            @click="deleteHistoryConfirm(selectedHistory.id)"
            class="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-red-400 border border-red-500/40 rounded-xl min-h-[44px]"
          >
            Удалить
          </button>
        </div>
      </div>

      <div v-else class="space-y-3">
        <div v-if="historyItems.length === 0" class="card-metallic rounded-2xl p-6 text-center text-gray-400 w-full">
          <div class="text-2xl mb-2">🗂️</div>
          <div class="text-sm">История пуста</div>
        </div>
        <button
          v-for="item in historyItems"
          :key="item.id"
          :data-testid="`history-item-${item.id}`"
          @click="selectedHistoryId = item.id"
          class="card-metallic rounded-2xl p-4 text-left border border-white/10 hover:border-metric-green/40 transition-colors w-full"
        >
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm font-bold text-white">{{ item.element || 'Без элемента' }}</div>
              <div class="text-[10px] text-gray-500">
                {{ formatDateTime(item.createdAt) }} · {{ item.mode === 'detail' ? 'Детализация' : 'Быстрый' }}
              </div>
            </div>
            <div class="text-metric-green font-bold">{{ formatCurrency(item.total || 0) }} ₽</div>
          </div>
          <div class="mt-2 text-[11px] text-gray-400">
            {{ item.client?.phone || item.client?.name || 'Без клиента' }}
          </div>
        </button>
      </div>
    </div>

    <!-- Section: Settings -->
    <div v-else-if="currentSection === 'settings'" class="p-4 space-y-4 overflow-y-auto pb-24">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <img src="/dm-small.png" alt="DentMetric" class="h-7 w-auto object-contain" onerror="this.style.display='none'">
        <div class="w-[70px]"></div>
      </div>
      <div class="card-metallic rounded-2xl p-5">
        <h2 class="text-xl font-bold mb-1 text-white">Настройки</h2>
      </div>
      <div class="card-metallic rounded-2xl p-5 space-y-4">
        <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Настройки режимов расчёта</div>
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm text-gray-300">Показывать ввод данных клиента (Быстрый)</div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input v-model="userSettings.showClientQuick" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm text-gray-300">Показывать ввод данных клиента (Детализация)</div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input v-model="userSettings.showClientDetail" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm text-gray-300">Данные клиента обязательны</div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input v-model="userSettings.clientRequired" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm text-gray-300">Автосохранение в историю</div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input v-model="userSettings.autoSaveHistory" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
          <div class="flex items-center justify-between gap-2">
            <div class="text-sm text-gray-300">Показывать подсказки (i)</div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input v-model="userSettings.showInfoTooltips" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
              <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>
        <div class="border-t border-white/10 pt-3 mt-2">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Обязательные поля (при включении выше)</div>
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm text-gray-300">Телефон обязателен</div>
              <label class="relative inline-flex items-center cursor-pointer shrink-0" :class="{ 'opacity-60 cursor-not-allowed': !userSettings.clientRequired }">
                <input v-model="userSettings.requirePhone" type="checkbox" class="sr-only peer" :disabled="!userSettings.clientRequired">
                <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
                <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm text-gray-300">Имя обязательно</div>
              <label class="relative inline-flex items-center cursor-pointer shrink-0" :class="{ 'opacity-60 cursor-not-allowed': !userSettings.clientRequired }">
                <input v-model="userSettings.requireName" type="checkbox" class="sr-only peer" :disabled="!userSettings.clientRequired">
                <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
                <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm text-gray-300">Марка/Модель обязательны</div>
              <label class="relative inline-flex items-center cursor-pointer shrink-0" :class="{ 'opacity-60 cursor-not-allowed': !userSettings.clientRequired }">
                <input v-model="userSettings.requireCarBrandModel" type="checkbox" class="sr-only peer" :disabled="!userSettings.clientRequired">
                <div class="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-metric-green transition-colors"></div>
                <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>
        <div class="text-[10px] text-gray-500">При выключении экрана клиента шаг пропускается автоматически.</div>
      </div>
      <div class="card-metallic rounded-2xl p-5 space-y-4">
        <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Округление цены</div>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="opt in PRICE_ROUND_OPTIONS"
            :key="opt.value"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all"
            :class="userSettings.priceRoundStep === opt.value ? 'bg-metric-green/20 border-metric-green text-white' : 'border-white/10 hover:border-white/20 text-gray-400'"
          >
            <input v-model="userSettings.priceRoundStep" type="radio" :value="opt.value" class="sr-only">
            <span class="text-sm">{{ opt.label }}</span>
          </label>
        </div>
        <p class="text-[10px] text-gray-500">Округление применяется к итоговой сумме (вверх до шага).</p>
      </div>
      <div class="card-metallic rounded-2xl p-5 space-y-4">
        <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest mb-2">Единицы размеров</div>
        <div class="flex gap-2">
          <label
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all min-h-[44px]"
            :class="userSettings.sizeUnit === 'mm' ? 'bg-metric-green/20 border-metric-green text-white' : 'border-white/10 hover:border-white/20 text-gray-400'"
          >
            <input v-model="userSettings.sizeUnit" type="radio" value="mm" class="sr-only">
            <span class="text-sm font-medium">мм</span>
          </label>
          <label
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all min-h-[44px]"
            :class="userSettings.sizeUnit === 'cm' ? 'bg-metric-green/20 border-metric-green text-white' : 'border-white/10 hover:border-white/20 text-gray-400'"
          >
            <input v-model="userSettings.sizeUnit" type="radio" value="cm" class="sr-only">
            <span class="text-sm font-medium">см</span>
          </label>
        </div>
        <p class="text-[10px] text-gray-500">Отображение размеров в списках и сводках. Ввод всегда в мм.</p>
      </div>
      <div class="card-metallic rounded-2xl p-5 space-y-3">
        <div class="flex justify-between items-center mb-4">
          <div class="text-[10px] font-bold text-metric-green uppercase tracking-widest">Мастера</div>
          <button @click="addMaster" class="text-xs text-metric-green border border-metric-green px-2 py-1 rounded hover:bg-metric-green hover:text-black transition-colors">+ Добавить</button>
        </div>
        <div class="space-y-3">
          <div v-for="(m, idx) in userSettings.masters" :key="idx" class="flex gap-2 items-center">
            <input v-model="m.name" placeholder="Имя" class="flex-1 bg-[#151515] border border-[#333] rounded-lg p-2 text-sm text-white focus:border-metric-green outline-none">
            <input type="number" v-model.number="m.rate" placeholder="₽/час" class="w-20 bg-[#151515] border border-[#333] rounded-lg p-2 text-sm text-right text-white focus:border-metric-green outline-none">
            <button @click="removeMaster(idx)" class="text-red-500 p-2 hover:bg-red-900/20 rounded">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="card-metallic rounded-2xl p-5">
        <div class="text-[10px] font-bold text-metric-green uppercase mb-4 tracking-widest">Круг/Овал (База)</div>
        <div v-for="size in initialData.circleSizes" :key="size.code" class="flex items-center justify-between mb-3 last:mb-0 border-b border-white/5 pb-2 last:border-0 last:pb-0">
          <div class="flex flex-col">
            <span class="font-bold text-sm text-gray-300">{{ size.code }}</span>
            <span class="text-xs text-gray-500">{{ size.name }}</span>
          </div>
          <input type="number" v-model.number="userSettings.prices[size.code]" inputmode="numeric" class="w-28 bg-[#151515] border border-[#333] rounded-lg p-2 text-right font-medium text-white shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none">
        </div>
      </div>
      <div class="card-metallic rounded-2xl p-5">
        <div class="text-[10px] font-bold text-metric-green uppercase mb-4 tracking-widest">Полосы (База)</div>
        <div v-for="size in initialData.stripSizes" :key="size.code" class="flex items-center justify-between mb-3 last:mb-0 border-b border-white/5 pb-2 last:border-0 last:pb-0">
          <div class="flex flex-col">
            <span class="font-bold text-sm text-gray-300">{{ size.code }}</span>
            <span class="text-xs text-gray-500">{{ size.name }}</span>
          </div>
          <input type="number" v-model.number="userSettings.prices[size.code]" inputmode="numeric" class="w-28 bg-[#151515] border border-[#333] rounded-lg p-2 text-right font-medium text-white shadow-inner focus:border-metric-green/50 focus:ring-1 focus:ring-metric-green/50 outline-none">
        </div>
      </div>
      <div class="flex flex-col space-y-3 pt-4">
        <button @click="saveSettings" class="cta-primary w-full bg-metric-green text-black font-bold py-3.5 rounded-xl active:opacity-90 shadow-[0_0_15px_rgba(136,229,35,0.4)]">Сохранить настройки</button>
        <button @click="resetDefaults" class="w-full text-gray-400 text-sm font-medium py-3 hover:text-white transition-colors">Сбросить к стандартным</button>
      </div>
    </div>

    <!-- Section: Info -->
    <div v-else-if="currentSection === 'info'" class="p-4 space-y-3 overflow-y-auto pb-24">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <img src="/dm-small.png" alt="DentMetric" class="h-7 w-auto object-contain" onerror="this.style.display='none'">
        <div class="w-[70px]"></div>
      </div>
      <div class="flex items-center justify-center pb-4">
        <div class="px-5 py-1.5 rounded-full border border-white/10 bg-[#1a1a1a] shadow-lg">
          <span class="text-[10px] font-bold uppercase text-metric-green tracking-widest">Инструкция & FAQ</span>
        </div>
      </div>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">ℹ️</span>
            <span class="font-bold text-sm text-white">О приложении</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <ul class="space-y-2 list-disc pl-4 marker:text-metric-green">
            <li>Калькулятор считает стоимость ремонта одной вмятины.</li>
            <li>Поддерживает режимы: <span class="text-white font-bold">Быстрый расчёт</span> и <span class="text-white font-bold">Детализация</span>.</li>
            <li>Одна строка расчёта = одно повреждение. Пакетные скидки не учитываются.</li>
          </ul>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">🛠️</span>
            <span class="font-bold text-sm text-white">Как пользоваться</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <ol class="space-y-3 list-decimal pl-4 marker:text-metric-green marker:font-bold">
            <li>Выберите режим расчета в меню «Метрика».</li>
            <li>Укажите тип повреждения (Круг/Овал или Полоса).</li>
            <li>Выберите размер или укажите длину/ширину в мм.</li>
            <li>Настройте коэффициенты (Сложность, Материал, Класс, Разборка).</li>
            <li>Итоговая цена обновится автоматически.</li>
          </ol>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">📖</span>
            <span class="font-bold text-sm text-white">Расшифровка параметров</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4 space-y-5">
          <div>
            <div class="font-bold text-metric-green text-[10px] uppercase mb-1 tracking-widest">РАЗМЕР</div>
            <div class="text-gray-400 leading-snug">S (Круг) и LS (Полоса). Является основой базовой цены.</div>
          </div>
          <div>
            <div class="font-bold text-metric-green text-[10px] uppercase mb-2 tracking-widest">СЛОЖНОСТЬ ВЫПОЛНЕНИЯ (K)</div>
            <div class="space-y-1.5">
              <div class="flex space-x-2"><span class="text-white font-bold w-6">K1:</span><span>Лёгкая</span></div>
              <div class="flex space-x-2"><span class="text-white font-bold w-6">K2:</span><span>Средняя</span></div>
              <div class="flex space-x-2"><span class="text-white font-bold w-6">K3:</span><span>Сложная — заломы, плохой доступ.</span></div>
              <div class="flex space-x-2"><span class="text-white font-bold w-6">K4:</span><span>Экстра — острые складки, ребра.</span></div>
            </div>
          </div>
          <div>
            <div class="font-bold text-metric-green text-[10px] uppercase mb-1 tracking-widest">КЛАСС АВТО</div>
            <div class="text-gray-400 leading-snug">Стандарт (x1.0), Премиум/Новый (x1.2).</div>
          </div>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">⏱️</span>
            <span class="font-bold text-sm text-white">Режим «Град»</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <p class="leading-snug">Раздел в разработке 🔒</p>
        </div>
      </details>
      <details class="group card-metallic rounded-2xl overflow-hidden transition-all">
        <summary class="flex items-center justify-between p-4 cursor-pointer select-none">
          <div class="flex items-center space-x-3">
            <span class="text-lg opacity-80">🎨</span>
            <span class="font-bold text-sm text-white">Детализация (Графика)</span>
          </div>
          <svg class="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </summary>
        <div class="px-5 pb-5 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2 pt-4">
          <p class="mb-2">Расчет на основе площади и расположения повреждения.</p>
          <ol class="space-y-2 list-decimal pl-4 marker:text-metric-green marker:font-bold">
            <li>Выберите класс авто и деталь.</li>
            <li>Добавьте вмятину (Круг) или полосу.</li>
            <li>Перетаскивайте и меняйте размер фигуры.</li>
            <li><b class="text-white">Сложные зоны:</b> Если фигура пересекает красную зону (ребро), цена автоматически увеличивается.</li>
          </ol>
        </div>
      </details>
      <div class="border border-red-500/30 bg-red-900/10 rounded-2xl p-4 flex gap-4 items-start mt-4">
        <div class="text-2xl pt-1">⚠️</div>
        <div>
          <div class="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">Важно</div>
          <div class="text-sm text-gray-300 leading-relaxed">
            Цена является ориентировочной. Окончательная стоимость может меняться после живого осмотра и дефектовки мастером.
          </div>
        </div>
      </div>
    </div>

    <!-- Locked sections -->
    <div v-else class="p-4 flex flex-col h-full pb-24">
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="goHome"
          class="text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg px-2.5 py-2 min-h-[40px] flex items-center gap-1"
        >
          <span>←</span>
          <span>Домой</span>
        </button>
        <img src="/dm-small.png" alt="DentMetric" class="h-7 w-auto object-contain" onerror="this.style.display='none'">
        <div class="w-[70px]"></div>
      </div>
      <div class="card-metallic rounded-2xl p-6 text-center text-gray-400 mt-6">
        <div class="text-2xl mb-2">🔒</div>
        <div class="text-sm">Раздел в разработке</div>
      </div>
    </div>

    <!-- Bottom tabs - Part C: consistent spacing, glow on active -->
    <div ref="bottomNavRef" class="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-[#222] flex justify-around items-center gap-1 py-2 pb-[env(safe-area-inset-bottom)] z-[200] shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
      <button
        @click="switchSection('history')"
        class="flex-1 min-w-0 py-3 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 rounded-lg"
        :class="currentSection === 'history' ? 'text-metric-green scale-105 drop-shadow-[0_0_8px_rgba(136,229,35,0.4)]' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl">🗂️</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">История</span>
      </button>
      <button
        @click="switchSection('settings')"
        class="flex-1 min-w-0 py-3 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 rounded-lg"
        :class="currentSection === 'settings' ? 'text-metric-green scale-105 drop-shadow-[0_0_8px_rgba(136,229,35,0.4)]' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl">⚙️</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">Настройки</span>
      </button>
      <button
        data-testid="nav-metric"
        @click="openMetricMenu"
        class="flex-1 min-w-0 py-3 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 rounded-lg"
        :class="currentSection === 'metric' ? 'text-metric-green scale-105 drop-shadow-[0_0_8px_rgba(136,229,35,0.4)]' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl">🧮</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">Метрика</span>
      </button>
      <button
        @click="switchSection('info')"
        class="flex-1 min-w-0 py-3 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 rounded-lg"
        :class="currentSection === 'info' ? 'text-metric-green scale-105 drop-shadow-[0_0_8px_rgba(136,229,35,0.4)]' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl">ℹ️</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">Инфо</span>
      </button>
      <button
        @click="goHome"
        class="flex-1 min-w-0 py-3 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 rounded-lg"
        :class="currentSection === 'home' ? 'text-metric-green scale-105 drop-shadow-[0_0_8px_rgba(136,229,35,0.4)]' : 'text-gray-600 hover:text-gray-400'"
      >
        <span class="text-2xl">🏠</span>
        <span class="text-[9px] font-bold uppercase tracking-widest">Домой</span>
      </button>
    </div>
    <Transition name="toast">
      <div
        v-if="toast.visible"
        class="fixed left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl backdrop-blur-sm"
        :class="toast.type === 'error' ? 'toast-error' : 'toast-success'"
        style="bottom: calc(16px + env(safe-area-inset-bottom, 0px));"
      >
        {{ toast.text }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { deleteSelected } from './graphics/konvaEditor';
import { initialData } from './data/initialData';
import { getArmaturnayaWorksForElement, getArmaturnayaTotalPrice } from './data/armaturnayaWorks';
import { CAR_PARTS } from './data/carParts';
import { getPartsByClass } from './data/partsCatalog';
import { circleSizesMm, stripSizesMm, circleSizesWithArea, stripSizesWithArea } from './data/dentSizes';
import { calcBasePriceFromDents, calcTotalPrice, buildBreakdown } from './utils/priceCalc';
import { calculateDentPrice as calcDentViaAdapter, normalizeGraphicsDentsForPricing, normalizeDimensions } from './features/pricing/pricingAdapter';
import { applyPriceRoundingCeil, PRICE_ROUND_OPTIONS } from './utils/priceRounding';
import { classifyShapeByRatio } from './utils/shapeClassification';
import GraphicsWizard from './components/graphics/GraphicsWizard.vue';
import StepDots from './components/graphics/StepDots.vue';
import InfoIcon from './components/InfoIcon.vue';
import { getElementIconPath } from './utils/elementIcons';
import { useHistoryStore } from './features/history/historyStore';

// Sections & mode
const currentSection = ref('home');
const calcMode = ref('');
const quickStep = ref(1);

const quickTotalSteps = computed(() => userSettings.showClientQuick ? 3 : 2);
const quickLogicalStep = computed(() => userSettings.showClientQuick ? quickStep.value : Math.max(1, quickStep.value - 1));
const appRootRef = ref(null);
const bottomNavRef = ref(null);
let footerResizeObserver = null;
const updateFooterHeight = () => {
  const root = appRootRef.value;
  const nav = bottomNavRef.value;
  if (!root || !nav) return;
  const h = Math.round(nav.getBoundingClientRect().height || 0);
  if (h > 0) root.style.setProperty('--app-footer-height', `${h}px`);
};

// Form (standard)
const form = reactive({
  shape: 'circle',
  sizeCode: null,
  repairCode: null,
  riskCode: null,
  materialCode: null,
  carClassCode: null,
  disassemblyCode: null,
  paintMaterialCode: null,
  soundInsulationCode: null
});

const estimateDraft = reactive({
  clientName: '',
  clientCompany: '',
  clientPhone: '',
  carBrand: '',
  carModel: '',
  inspectDate: '',
  inspectTime: '',
  element: null,
  sizeLengthMm: null,
  sizeWidthMm: null,
  comment: '',
  breakdown: [],
  quickDents: []
});

const { historyItems, loadHistory, saveEstimate, updateEstimate, deleteEstimate, clearHistory } = useHistoryStore();
const selectedHistoryId = ref(null);
const selectedHistory = computed(() => historyItems.value.find((item) => item.id === selectedHistoryId.value) || null);
const isSavingHistory = ref(false);
const toast = reactive({ visible: false, text: '', type: 'success', timeoutId: null });
const skipNextAutoFill = ref(false);
const isEditingHistory = ref(false);
const isUpdatingHistory = ref(false);
const historyEditDraft = reactive({
  clientName: '',
  clientCompany: '',
  clientPhone: '',
  carBrand: '',
  carModel: '',
  inspectDate: '',
  inspectTime: '',
  comment: ''
});

const quickPartsLeft = [
  'Капот',
  'Крышка багажника',
  'Крыша',
  'Переднее крыло',
  'Передняя дверь',
  'Задняя дверь',
  'Заднее крыло',
  'Стойка крыши',
  'Порог',
  'Бампер'
];
const quickPartsRight = [...quickPartsLeft];

const clientDataValid = computed(() => {
  if (!userSettings.clientRequired) return true;
  const name = String(estimateDraft.clientName || '').trim();
  const phone = String(estimateDraft.clientPhone || '').trim();
  const brand = String(estimateDraft.carBrand || '').trim();
  const model = String(estimateDraft.carModel || '').trim();
  if (userSettings.requireName && !name) return false;
  if (userSettings.requirePhone && !phone) return false;
  if (userSettings.requireCarBrandModel && (!brand || !model)) return false;
  return true;
});

function normalizePanelElement(value) {
  if (!value) return null;
  if (typeof value === 'string' && value.includes(':')) {
    const [side, ...rest] = value.split(':');
    return { side: side === 'right' ? 'right' : 'left', element: rest.join(':') };
  }
  return { side: 'left', element: String(value) };
}

function createQuickDent(panelElement = null) {
  const normalized = normalizePanelElement(panelElement);
  return {
    id: `quick_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    shape: 'circle',
    sizeCode: null,
    sizeLengthMm: null,
    sizeWidthMm: null,
    panelSide: normalized?.side || 'left',
    panelElement: normalized?.element || null,
    conditions: {
      repairCode: null,
      riskCode: null,
      materialCode: null,
      carClassCode: null,
      disassemblyCodes: ['Z0'],
      paintMaterialCode: null,
      soundInsulationCode: null
    }
  };
}

function addQuickDent() {
  const panel = getQuickDefaultPanel();
  estimateDraft.quickDents.push(createQuickDent(panel?.element ? `${panel.side}:${panel.element}` : null));
  haptic('selection');
}

function removeQuickDent(id) {
  estimateDraft.quickDents = estimateDraft.quickDents.filter((d) => d.id !== id);
  haptic('selection');
}

function setQuickDentShape(dent, shape) {
  dent.shape = shape;
  dent.sizeCode = null;
  dent.sizeLengthMm = null;
  dent.sizeWidthMm = null;
  haptic('selection');
}

function getQuickDefaultPanel() {
  const last = estimateDraft.quickDents[estimateDraft.quickDents.length - 1];
  if (last?.panelElement) return { side: last.panelSide || 'left', element: last.panelElement };
  return { side: 'left', element: quickPartsLeft.length ? quickPartsLeft[0] : null };
}

function onQuickDentElementChange(dent) {
  if (dent?.panelElement && !dent.panelSide) dent.panelSide = 'left';
  if (dent?.conditions?.disassemblyCodes && dent.panelElement) {
    const works = getArmaturnayaWorksForElement(dent.panelElement);
    const validCodes = new Set(works.map((w) => w.code));
    const current = (dent.conditions.disassemblyCodes || ['Z0'])[0];
    dent.conditions.disassemblyCodes = validCodes.has(current) ? [current] : ['Z0'];
  }
  haptic('selection');
}

function onArmaturnayaSelect(dent, code) {
  dent.conditions.disassemblyCodes = code ? [code] : ['Z0'];
  haptic('selection');
}

function setQuickDentSide(dent, side) {
  if (!dent) return;
  dent.panelSide = side === 'right' ? 'right' : 'left';
  haptic('selection');
}

function normalizeQuickDentPanel(dent) {
  if (!dent) return;
  if (dent.panelElement && typeof dent.panelElement === 'string' && dent.panelElement.includes(':')) {
    const parsed = normalizePanelElement(dent.panelElement);
    dent.panelSide = parsed?.side || dent.panelSide || 'left';
    dent.panelElement = parsed?.element || null;
  }
  if (!dent.panelSide) dent.panelSide = 'left';
}

function getSizeListForShape(shape) {
  return shape === 'circle' ? initialData.circleSizes : initialData.stripSizes;
}

function syncQuickDentMmFromSizeCode(dent) {
  if (!dent.sizeCode) return;
  const sizes = dent.shape === 'circle' ? circleSizesMm : stripSizesMm;
  const size = sizes.find((s) => s.code === dent.sizeCode);
  if (!size?.mm) return;
  dent.sizeLengthMm = size.mm.w;
  dent.sizeWidthMm = size.mm.h;
}

function onQuickDentSizeCodeChange(dent) {
  syncQuickDentMmFromSizeCode(dent);
  syncQuickDentSizeFromMm(dent);
  haptic('selection');
}

function syncQuickDentSizeFromMm(dent) {
  const l = Number(dent.sizeLengthMm) || 0;
  const w = Number(dent.sizeWidthMm) || 0;
  if (l > 0 && w > 0) {
    const classified = classifyShapeByRatio({ widthMm: l, heightMm: w });
    const targetShape = classified === 'stripe' ? 'strip' : 'circle';
    if (dent.shape !== targetShape) dent.shape = targetShape;
  }
  const sizeCode = getSizeCodeFromMm(dent.shape, dent.sizeLengthMm, dent.sizeWidthMm);
  if (sizeCode) dent.sizeCode = sizeCode;
}

function ensureInspectDateTime() {
  if (skipNextAutoFill.value) {
    skipNextAutoFill.value = false;
    return;
  }
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  if (!estimateDraft.inspectDate) {
    estimateDraft.inspectDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
  if (!estimateDraft.inspectTime) {
    estimateDraft.inspectTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }
}
ensureInspectDateTime();

// User settings
const buildDefaultPrices = () => {
  const p = {};
  initialData.circleSizes.forEach(s => { p[s.code] = s.basePrice; });
  initialData.stripSizes.forEach(s => { p[s.code] = s.basePrice; });
  return p;
};

const userSettings = reactive({
  prices: buildDefaultPrices(),
  masters: JSON.parse(JSON.stringify(initialData.defaultMasters)),
  hourlyRate: 0,
  clientRequired: false,
  showClientQuick: true,
  showClientDetail: true,
  requirePhone: true,
  requireName: true,
  requireCarBrandModel: false,
  autoSaveHistory: false,
  showInfoTooltips: true,
  priceRoundStep: 0,
  sizeUnit: 'mm'
});

function loadUserSettings() {
  const v6 = localStorage.getItem('dentRepairSettings_v6');
  const v5 = localStorage.getItem('dentRepairSettings_v5');
  try {
    const p = (v6 ? JSON.parse(v6) : null) || (v5 ? JSON.parse(v5) : null) || {};
    if (p.prices) Object.assign(userSettings.prices, p.prices);
    if (p.masters) userSettings.masters = p.masters;
    if (typeof p.clientRequired === 'boolean') userSettings.clientRequired = p.clientRequired;
    if (typeof p.showClientQuick === 'boolean') userSettings.showClientQuick = p.showClientQuick;
    if (typeof p.showClientDetail === 'boolean') userSettings.showClientDetail = p.showClientDetail;
    if (typeof p.requirePhone === 'boolean') userSettings.requirePhone = p.requirePhone;
    if (typeof p.requireName === 'boolean') userSettings.requireName = p.requireName;
    if (typeof p.requireCarBrandModel === 'boolean') userSettings.requireCarBrandModel = p.requireCarBrandModel;
    if (typeof p.autoSaveHistory === 'boolean') userSettings.autoSaveHistory = p.autoSaveHistory;
    if (typeof p.showInfoTooltips === 'boolean') userSettings.showInfoTooltips = p.showInfoTooltips;
    if (typeof p.priceRoundStep === 'number' && PRICE_ROUND_OPTIONS.some((o) => o.value === p.priceRoundStep)) userSettings.priceRoundStep = p.priceRoundStep;
    if (p.sizeUnit === 'cm' || p.sizeUnit === 'mm') userSettings.sizeUnit = p.sizeUnit;
  } catch (e) {
    if (import.meta.env?.DEV) console.error('Failed to load settings', e);
  }
}
loadUserSettings();

// Graphics state
const graphicsState = reactive({
  selectedClass: null,
  selectedPart: null,
  dents: []
});

const graphicsData = {
  carClasses: [
    { id: 'sedan', name: 'Седан', icon: '🚗' },
    { id: 'crossover', name: 'Кроссовер', icon: '🚙' },
    { id: 'suv', name: 'Внедорожник', icon: '🚜' }
  ]
};

/** Список деталей для выбранного класса (для dropdown). */
const graphicsPartsList = computed(() => {
  if (graphicsState.selectedClass?.id === 'crossover') {
    return getPartsByClass('crossover');
  }
  return Object.values(CAR_PARTS);
});

const graphicsSelectedClassId = ref('crossover');
const graphicsSelectedPartId = ref('hood');

watch(
  () => [graphicsState.selectedClass, graphicsState.selectedPart],
  () => {
    if (graphicsState.selectedClass) graphicsSelectedClassId.value = graphicsState.selectedClass.id;
    if (graphicsState.selectedPart) graphicsSelectedPartId.value = graphicsState.selectedPart.id;
  },
  { immediate: true }
);

watch([graphicsSelectedClassId, graphicsSelectedPartId], () => {
  ensureGraphicsSelection();
}, { immediate: true });

watch(
  () => graphicsState.selectedPart,
  (part) => {
    if (part?.name) estimateDraft.element = part.name;
  },
  { immediate: true }
);

function ensureGraphicsSelection() {
  const classId = graphicsSelectedClassId.value || graphicsData.carClasses[0]?.id;
  const cls = graphicsData.carClasses.find((c) => c.id === classId) || graphicsData.carClasses[0];
  graphicsState.selectedClass = cls || null;
  const list = cls?.id === 'crossover' ? getPartsByClass('crossover') : Object.values(CAR_PARTS);
  const partId = graphicsSelectedPartId.value;
  let part = list.find((p) => p.id === partId);
  if (!part) part = list[0] || null;
  graphicsState.selectedPart = part;
  if (part) graphicsSelectedPartId.value = part.id;
  if (cls) graphicsSelectedClassId.value = cls.id;
}

// Computed

/** В графике для круга: мм-размеры для кроссовера (капот, двери, крыло), иначе legacy */
const graphicsCircleSizes = computed(() => {
  const part = graphicsState.selectedPart;
  if (part?.realSizeMm && part?.asset?.type === 'image') {
    return circleSizesWithArea;
  }
  return initialData.circleSizes;
});

/** В графике для полосы: мм-размеры для кроссовера — единая механика как на капоте */
const graphicsStripSizes = computed(() => {
  const part = graphicsState.selectedPart;
  if (part?.realSizeMm && part?.asset?.type === 'image') {
    return stripSizesWithArea;
  }
  return initialData.stripSizes;
});

const quickDentTotals = computed(() => estimateDraft.quickDents.map((dent) => {
  const w = Number(dent.sizeLengthMm) || 0;
  const h = Number(dent.sizeWidthMm) || 0;
  const shape = dent.shape === 'circle' ? 'circle' : 'strip';
  const sizes = shape === 'circle' ? circleSizesWithArea : stripSizesWithArea;
  const ctx = { sizesWithArea: sizes, prices: userSettings.prices, initialData, roundStep: userSettings.priceRoundStep ?? 0 };
  const result = calcDentViaAdapter(
    { shape, widthMm: w, heightMm: h, conditions: dent.conditions, panelElement: dent.panelElement },
    ctx
  );
  return { dent, sizeCode: result.sizeCode, base: result.base, total: result.total, breakdown: result.breakdown };
}));

const quickLineItems = computed(() => {
  const list = quickDentTotals.value.filter((d) => d.total > 0).sort((a, b) => b.total - a.total);
  const roundStep = userSettings.priceRoundStep;
  return list.map((item, idx) => {
    const rawApplied = idx === 0 ? item.total : item.total * 0.5;
    const applied = roundStep > 0
      ? applyPriceRoundingCeil(rawApplied, roundStep)
      : Math.round(rawApplied);
    return { ...item, appliedTotal: applied, discount: idx > 0 };
  });
});

const quickTotal = computed(() => {
  if (quickLineItems.value.length === 0) return 0;
  return quickLineItems.value.reduce((acc, item, idx) => acc + (idx === 0 ? item.total : item.total * 0.5), 0);
});

/** Нормализованные вмятины для расчёта (устраняет расхождения Quick vs Detail). */
const graphicsDentsForPricing = computed(() => {
  const ctx = {
    circleSizes: graphicsCircleSizes.value,
    stripSizes: graphicsStripSizes.value,
    prices: userSettings.prices,
    initialData
  };
  return normalizeGraphicsDentsForPricing(graphicsState.dents || [], ctx);
});

/** База от вмятин: сумма базовых цен (каждая вмятина отдельно). Единый источник: priceCalc.calcBasePriceFromDents. */
const graphicsBasePrice = computed(() => calcBasePriceFromDents(graphicsDentsForPricing.value));

/** Итоговая цена в Графике: каждая вмятина отдельно, затем сумма. Единый источник: priceCalc.calcTotalPrice. */
const graphicsPrice = computed(() =>
  calcTotalPrice(graphicsDentsForPricing.value, form, initialData, userSettings.priceRoundStep ?? 0)
);

const totalPrice = computed(() => {
  if (currentSection.value !== 'metric') return 0;
  if (calcMode.value === 'standard') return quickTotal.value;
  if (calcMode.value === 'graphics') return graphicsPrice.value;
  return 0;
});

/** Display total with optional rounding (presentation layer). */
const displayTotal = computed(() =>
  applyPriceRoundingCeil(totalPrice.value, userSettings.priceRoundStep)
);

/** Estimated repair time in hours, updates in real-time from total price and hourly rate. */
const estimatedRepairTime = computed(() => {
  const total = displayTotal.value;
  const rate = userSettings.hourlyRate > 0 ? userSettings.hourlyRate : 4000;
  if (total <= 0 || rate <= 0) return '—';
  const hours = total / rate;
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} мин`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
});

const quickBreakdownItems = computed(() => {
  const items = quickLineItems.value.map((item, idx) => ({
    name: `Вмятина ${idx + 1}${item.discount ? ' (50%)' : ''}`,
    value: `${formatCurrency(item.appliedTotal)} ₽`
  }));
  return items;
});

const quickStep2Valid = computed(() => {
  if (estimateDraft.quickDents.length === 0) return false;
  return estimateDraft.quickDents.every((d) =>
    d.sizeCode &&
    d.conditions?.repairCode &&
    d.conditions?.riskCode &&
    d.conditions?.materialCode &&
    d.conditions?.carClassCode &&
    (d.conditions?.disassemblyCodes?.length ?? 0) > 0
  );
});

const quickStep3Ready = computed(() => quickTotal.value > 0);

const getQuickDentTotal = (dentId) => {
  const item = quickDentTotals.value.find((d) => d.dent.id === dentId);
  return item?.total || 0;
};

const getQuickDentLabel = (dent) => (dent.shape === 'circle' ? 'Круг/Овал' : 'Полоса');

// Helpers
const formatCurrency = (v) => new Intl.NumberFormat('ru-RU').format(v);
const formatRoundedPrice = (raw) =>
  formatCurrency(applyPriceRoundingCeil(raw, userSettings.priceRoundStep));
const formatSizeDisplay = (lengthMm, widthMm) => {
  const l = Number(lengthMm) || 0;
  const w = Number(widthMm) || 0;
  if (userSettings.sizeUnit === 'cm') {
    return `${(l / 10).toFixed(1)}×${(w / 10).toFixed(1)} см`;
  }
  return `${l.toFixed(1)}×${w.toFixed(1)} мм`;
};
const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
};

if (import.meta.env?.DEV) {
  window.__comparePricing = (shape, widthMm, heightMm, conditions) => {
    const sizes = shape === 'circle' ? circleSizesWithArea : stripSizesWithArea;
    const ctx = { sizesWithArea: sizes, prices: userSettings.prices, initialData, roundStep: 100 };
    const r = calcDentViaAdapter({ shape, widthMm, heightMm, conditions }, ctx);
    console.log('[pricingAdapter] Same input => single result:', r.total, '₽', r.breakdown);
    return r.total;
  };
}

watch([quickBreakdownItems, calcMode], () => {
  if (calcMode.value !== 'standard') return;
  estimateDraft.breakdown = quickBreakdownItems.value;
});

const haptic = (type) => {
  const tg = window.Telegram?.WebApp;
  if (!tg?.HapticFeedback) return;
  if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
    if (type === 'selection') tg.HapticFeedback.selectionChanged();
    if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
  }
};

const showLockedStub = (message = 'Раздел в разработке 🔒') => {
  const tg = window.Telegram?.WebApp;
  if (tg?.showPopup && tg?.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
    tg.showPopup({ title: 'В разработке', message, buttons: [{ type: 'ok' }] });
  } else {
    alert(message);
  }
  haptic('selection');
};

function showToast(text, type = 'success', duration = 1800) {
  if (toast.timeoutId) clearTimeout(toast.timeoutId);
  toast.text = text;
  toast.type = type;
  toast.visible = true;
  toast.timeoutId = setTimeout(() => {
    toast.visible = false;
    toast.timeoutId = null;
  }, duration);
}

function startHistoryEdit() {
  if (!selectedHistory.value) return;
  const client = selectedHistory.value.client || {};
  historyEditDraft.clientName = client.name || '';
  historyEditDraft.clientCompany = client.company || '';
  historyEditDraft.clientPhone = client.phone || '';
  historyEditDraft.carBrand = client.brand || '';
  historyEditDraft.carModel = client.model || '';
  historyEditDraft.inspectDate = client.date || '';
  historyEditDraft.inspectTime = client.time || '';
  historyEditDraft.comment = selectedHistory.value.comment || '';
  isEditingHistory.value = true;
}

function cancelHistoryEdit() {
  isEditingHistory.value = false;
}

async function saveHistoryEdit() {
  if (!selectedHistory.value || isUpdatingHistory.value) return;
  isUpdatingHistory.value = true;
  try {
    updateEstimate(selectedHistory.value.id, {
      client: {
        name: historyEditDraft.clientName,
        company: historyEditDraft.clientCompany,
        phone: historyEditDraft.clientPhone,
        brand: historyEditDraft.carBrand,
        model: historyEditDraft.carModel,
        date: historyEditDraft.inspectDate,
        time: historyEditDraft.inspectTime
      },
      comment: historyEditDraft.comment
    });
    isEditingHistory.value = false;
    showToast('История обновлена ✅', 'success', 1800);
  } catch (e) {
    showToast('Не удалось обновить историю', 'error', 2200);
  } finally {
    isUpdatingHistory.value = false;
  }
}

function resetDraftState() {
  form.shape = 'circle';
  form.sizeCode = null;
  form.repairCode = null;
  form.riskCode = null;
  form.materialCode = null;
  form.carClassCode = null;
  form.disassemblyCode = null;
  form.paintMaterialCode = null;
  form.soundInsulationCode = null;

  estimateDraft.clientName = '';
  estimateDraft.clientCompany = '';
  estimateDraft.clientPhone = '';
  estimateDraft.carBrand = '';
  estimateDraft.carModel = '';
  estimateDraft.inspectDate = '';
  estimateDraft.inspectTime = '';
  estimateDraft.element = null;
  estimateDraft.sizeLengthMm = null;
  estimateDraft.sizeWidthMm = null;
  estimateDraft.comment = '';
  estimateDraft.breakdown = [];
  estimateDraft.quickDents = [];
  quickStep.value = userSettings.showClientQuick ? 1 : 2;

  graphicsState.dents = [];
  graphicsState.selectedClass = null;
  graphicsState.selectedPart = null;
  graphicsSelectedClassId.value = graphicsData.carClasses[0]?.id || null;
  graphicsSelectedPartId.value = graphicsPartsList.value?.[0]?.id || null;
  skipNextAutoFill.value = true;
}

function buildEstimatePayload(mode) {
  const client = {
    name: estimateDraft.clientName,
    company: estimateDraft.clientCompany,
    phone: estimateDraft.clientPhone,
    brand: estimateDraft.carBrand,
    model: estimateDraft.carModel,
    date: estimateDraft.inspectDate,
    time: estimateDraft.inspectTime
  };
  const conditions = {
    repairCode: form.repairCode,
    riskCode: form.riskCode,
    materialCode: form.materialCode,
    carClassCode: form.carClassCode,
    disassemblyCode: form.disassemblyCode,
    paintMaterialCode: form.paintMaterialCode,
    soundInsulationCode: form.soundInsulationCode
  };
  const firstQuick = estimateDraft.quickDents?.[0];
  const quickElement = firstQuick?.panelElement ? `${firstQuick.panelSide || 'left'}:${firstQuick.panelElement}` : null;
  const element = quickElement || graphicsState.selectedPart?.name || null;
  const vehicleClass = graphicsState.selectedClass?.name || null;
  if (mode === 'detail') {
    const normDents = graphicsDentsForPricing.value;
    const dentItems = (graphicsState.dents || []).map((d, i) => {
      const norm = normDents[i];
      const bbox = d.bboxMm || {};
      const { widthMm: w, heightMm: h } = normalizeDimensions(bbox.width, bbox.height);
      return {
        id: d.id,
        type: d.type,
        bboxMm: { width: w, height: h },
        areaMm2: d.areaMm2,
        sizeCode: norm?.sizeCode ?? d.sizeCode,
        conditions
      };
    });
    return {
      mode: 'detail',
      client,
      vehicleClass,
      element,
      dents: { count: dentItems.length, items: dentItems },
      breakdown: estimateDraft.breakdown || [],
      total: displayTotal.value,
      rawTotal: totalPrice.value,
      comment: estimateDraft.comment || ''
    };
  }
  const dentItems = (estimateDraft.quickDents || []).map((d) => {
    const { widthMm: w, heightMm: h } = normalizeDimensions(d.sizeLengthMm, d.sizeWidthMm);
    return {
      id: d.id,
      type: d.shape,
      sizeCode: quickDentTotals.value.find((t) => t.dent.id === d.id)?.sizeCode ?? d.sizeCode,
      bboxMm: { width: w, height: h },
      panelSide: d.panelSide || 'left',
      panelElement: d.panelElement || null,
      conditions: d.conditions
    };
  });
  return {
    mode: 'quick',
    client,
    vehicleClass: null,
    element,
    dents: { count: dentItems.length, items: dentItems },
    breakdown: estimateDraft.breakdown || [],
    total: displayTotal.value,
    rawTotal: totalPrice.value,
    comment: estimateDraft.comment || ''
  };
}

async function saveCurrentEstimate(modeOverride) {
  if (isSavingHistory.value) return;
  const mode = modeOverride || (calcMode.value === 'graphics' ? 'detail' : 'quick');
  if (totalPrice.value <= 0) return;
  isSavingHistory.value = true;
  try {
    const payload = buildEstimatePayload(mode);
    saveEstimate(payload);
    showToast('Сохранено в историю ✅', 'success', 1800);
    resetDraftState();
    if (calcMode.value === 'graphics') closeEditor();
    setTimeout(() => {
      currentSection.value = 'history';
    }, 400);
  } catch (e) {
    showToast('Не удалось сохранить в историю', 'error', 2200);
  } finally {
    isSavingHistory.value = false;
  }
}

function clearHistoryConfirm() {
  if (historyItems.value.length === 0) return;
  if (confirm('Очистить всю историю?')) clearHistory();
}

function deleteHistoryConfirm(id) {
  if (!id) return;
  if (confirm('Удалить оценку из истории?')) {
    deleteEstimate(id);
    if (selectedHistoryId.value === id) selectedHistoryId.value = null;
  }
}

const setMode = (mode) => {
  if (mode === 'time') {
    showLockedStub('Раздел в разработке 🔒');
    return;
  }
  calcMode.value = mode;
  if (mode === 'standard') quickStep.value = userSettings.showClientQuick ? 1 : 2;
  haptic('selection');
  if (mode === 'graphics') {
    if (window.Telegram?.WebApp?.expand) window.Telegram.WebApp.expand();
    ensureGraphicsSelection();
  }
};

const openMetricMenu = () => {
  if (calcMode.value === 'graphics') closeEditor();
  currentSection.value = 'metric';
  calcMode.value = '';
  ensureInspectDateTime();
  haptic('selection');
};

const selectMetricMode = (mode) => {
  if (mode === 'time') {
    showLockedStub('Раздел в разработке 🔒');
    return;
  }
  if (currentSection.value !== 'metric') {
    currentSection.value = 'metric';
    ensureInspectDateTime();
  }
  if (calcMode.value === 'graphics' && mode !== 'graphics') {
    closeEditor();
  }
  setMode(mode);
};

const switchSection = (section) => {
  if (section === 'analytics' || section === 'journal') {
    currentSection.value = section;
    showLockedStub('Раздел в разработке 🔒');
    return;
  }
  if (section !== 'metric' && calcMode.value === 'graphics') closeEditor();
  currentSection.value = section;
  haptic('selection');
  if (section === 'metric') {
    ensureInspectDateTime();
  }
};

const goQuickBack = () => {
  if (quickStep.value <= 1) {
    calcMode.value = '';
    return;
  }
  if (quickStep.value === 2 && !userSettings.showClientQuick) {
    calcMode.value = '';
    return;
  }
  quickStep.value -= 1;
};

const goQuickNext = () => {
  if (quickStep.value === 1 && userSettings.showClientQuick && !clientDataValid.value) return;
  if ((quickStep.value === 2 || (quickStep.value === 1 && !userSettings.showClientQuick)) && !quickStep2Valid.value) return;
  if (quickStep.value < 3) quickStep.value += 1;
};

const goHome = () => {
  if (calcMode.value === 'graphics') closeEditor();
  currentSection.value = 'home';
  haptic('selection');
};

const addMaster = () => userSettings.masters.push({ name: '', rate: 0 });
const removeMaster = (i) => userSettings.masters.splice(i, 1);

const saveSettings = () => {
  const dataToSave = {
    prices: userSettings.prices,
    masters: userSettings.masters,
    clientRequired: userSettings.clientRequired,
    showClientQuick: userSettings.showClientQuick,
    showClientDetail: userSettings.showClientDetail,
    requirePhone: userSettings.requirePhone,
    requireName: userSettings.requireName,
    requireCarBrandModel: userSettings.requireCarBrandModel,
    autoSaveHistory: userSettings.autoSaveHistory,
    showInfoTooltips: userSettings.showInfoTooltips,
    priceRoundStep: userSettings.priceRoundStep,
    sizeUnit: userSettings.sizeUnit
  };
  localStorage.setItem('dentRepairSettings_v6', JSON.stringify(dataToSave));
  const tg = window.Telegram?.WebApp;
  if (tg?.showPopup && tg?.isVersionAtLeast && tg.isVersionAtLeast('6.2')) {
    tg.showPopup({ title: 'Готово', message: 'Настройки сохранены', buttons: [{ type: 'ok' }] });
  } else {
    alert('Настройки сохранены');
  }
  haptic('success');
};

const resetDefaults = () => {
  if (confirm('Сбросить цены к стандартным?')) {
    Object.assign(userSettings.prices, buildDefaultPrices());
    userSettings.clientRequired = false;
    userSettings.showClientQuick = true;
    userSettings.showClientDetail = true;
    userSettings.requirePhone = true;
    userSettings.requireName = true;
    userSettings.requireCarBrandModel = false;
    userSettings.autoSaveHistory = false;
    userSettings.showInfoTooltips = true;
    userSettings.priceRoundStep = 0;
    userSettings.sizeUnit = 'mm';
    saveSettings();
  }
};

function scrollFieldIntoView(e) {
  const el = e?.target || e;
  if (!el?.scrollIntoView) return;
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  });
}

function getSizeCodeFromMm(shape, lengthMm, widthMm) {
  const l = Number(lengthMm);
  const w = Number(widthMm);
  if (!Number.isFinite(l) || !Number.isFinite(w) || l <= 0 || w <= 0) return null;
  const sizes = shape === 'circle' ? circleSizesMm : stripSizesMm;
  const area = shape === 'circle'
    ? Math.PI * (l / 2) * (w / 2)
    : l * w;
  let closest = sizes[0];
  let minDist = Math.abs((closest?.mm?.w || 0) * (closest?.mm?.h || 0) - area);
  sizes.forEach((s) => {
    const sArea = (s.mm?.w || 0) * (s.mm?.h || 0);
    const dist = Math.abs(sArea - area);
    if (dist < minDist) {
      minDist = dist;
      closest = s;
    }
  });
  return closest?.code || null;
}


// Graphics
const closeEditor = () => {
  calcMode.value = 'standard';
  graphicsState.dents = [];
  haptic('selection');
};

// Telegram Main Button
watch(displayTotal, (val) => {
  const btn = window.Telegram?.WebApp?.MainButton;
  if (!btn) return;
  if (calcMode.value === 'graphics') {
    btn.hide();
    return;
  }
  if (val > 0) {
    btn.setText(`ИТОГО: ${formatCurrency(val)} ₽`);
    btn.show();
  } else {
    btn.hide();
  }
});

watch(selectedHistoryId, () => {
  isEditingHistory.value = false;
});

watch(
  () => ({
    showClientQuick: userSettings.showClientQuick,
    showClientDetail: userSettings.showClientDetail,
    clientRequired: userSettings.clientRequired,
    requirePhone: userSettings.requirePhone,
    requireName: userSettings.requireName,
    requireCarBrandModel: userSettings.requireCarBrandModel,
    autoSaveHistory: userSettings.autoSaveHistory,
    showInfoTooltips: userSettings.showInfoTooltips,
    priceRoundStep: userSettings.priceRoundStep,
    sizeUnit: userSettings.sizeUnit
  }),
  (val) => {
    const data = {
      prices: userSettings.prices,
      masters: userSettings.masters,
      ...val
    };
    localStorage.setItem('dentRepairSettings_v6', JSON.stringify(data));
  },
  { deep: true }
);

watch(quickStep, (step) => {
  const onDentsStep = step === 2 || (step === 1 && !userSettings.showClientQuick);
  if (onDentsStep && estimateDraft.quickDents.length === 0) {
    addQuickDent();
  }
  if (onDentsStep && estimateDraft.quickDents.length > 0) {
    estimateDraft.quickDents.forEach((dent) => normalizeQuickDentPanel(dent));
  }
});

watch(quickStep, (step, prev) => {
  if (userSettings.autoSaveHistory && calcMode.value === 'standard' && step === 3 && prev === 2 && quickTotal.value > 0 && !isSavingHistory.value) {
    nextTick(() => saveCurrentEstimate('quick'));
  }
});

const handleKeyDown = (e) => {
  if (calcMode.value !== 'graphics') return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const active = document.activeElement;
    const isEditable = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (typeof active.isContentEditable === 'boolean' && active.isContentEditable));
    if (isEditable) return;
    e.preventDefault();
    deleteSelected();
  }
};

onMounted(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.MainButton.setParams({ color: '#88E523', text_color: '#000000' });
  }
  window.addEventListener('keydown', handleKeyDown);
  updateFooterHeight();
  footerResizeObserver = new ResizeObserver(() => updateFooterHeight());
  if (bottomNavRef.value) footerResizeObserver.observe(bottomNavRef.value);
  window.addEventListener('resize', updateFooterHeight);
  ensureInspectDateTime();
  loadHistory();
});

watch(
  () => calcMode.value === 'graphics',
  (isGraphics) => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('graphics-fullscreen-active', isGraphics);
    if (isGraphics && window.Telegram?.WebApp?.expand) window.Telegram.WebApp.expand();
    const btn = window.Telegram?.WebApp?.MainButton;
    if (isGraphics && btn) btn.hide();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', updateFooterHeight);
  if (footerResizeObserver && bottomNavRef.value) footerResizeObserver.unobserve(bottomNavRef.value);
  if (footerResizeObserver) footerResizeObserver.disconnect();
});
</script>

<style scoped>
.text-metric-green { color: #88e523; }
.text-metric-silver { color: #a0aec0; }
.bg-metric-green { background-color: #88e523; }
.border-metric-green { border-color: #88e523; }
.app-root {
  --app-footer-height: calc(64px + env(safe-area-inset-bottom, 0px));
}
.app-root--gradient {
  background: #000000;
}
.app-root--solid {
  background: #000000;
}

/* Logo: seamless black background, no frames or borders */
.home-logo-wrap {
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  /* no border, no box-shadow, no outline - seamless blend with page */
}
.home-logo {
  display: block;
}

/* Home screen: pure black background */
.home-screen { position: relative; overflow: hidden; background: #000000; }

/* 2×2 grid: square cards with spacing, as in reference design */
.home-buttons-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 1rem;
  width: 100%;
  max-width: min(92vw, 380px);
  margin-left: auto;
  margin-right: auto;
  padding: 0 0.5rem;
  box-sizing: border-box;
}

/* Shared menu card style: main screen + metric mode picker (dark charcoal, rounded, square) — single source of truth */
.menu-card-btn {
  aspect-ratio: 1;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  background-color: #2C2C2C;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.menu-card-btn--active {
  border: 2px solid #88e523;
  box-shadow: 0 0 18px rgba(136, 229, 35, 0.3), 0 0 32px rgba(136, 229, 35, 0.1);
}
.menu-card-btn--active:hover,
.menu-card-btn--active:focus {
  border-color: #88e523;
  box-shadow: 0 0 22px rgba(136, 229, 35, 0.4), 0 0 40px rgba(136, 229, 35, 0.15);
}
.menu-card-btn--inactive {
  border: 1px solid rgba(60, 60, 60, 0.9);
}
.menu-card-btn--inactive:hover,
.menu-card-btn--inactive:focus {
  border-color: rgba(255, 255, 255, 0.12);
}
@media (prefers-reduced-motion: reduce) {
  .menu-card-btn--active:hover,
  .menu-card-btn--active:focus {
    box-shadow: 0 0 18px rgba(136, 229, 35, 0.3), 0 0 32px rgba(136, 229, 35, 0.1);
  }
}
.menu-card-btn:focus-visible {
  outline: 2px solid rgba(136, 229, 35, 0.6);
  outline-offset: 2px;
}
.menu-card-btn-icon--active { color: #88e523; }
.menu-card-btn-icon--inactive { color: rgba(255, 255, 255, 0.55); }
.menu-card-btn--active .menu-card-btn-label,
.menu-card-btn--active .menu-card-btn-sublabel { color: #88e523; }
.menu-card-btn--inactive .menu-card-btn-label,
.menu-card-btn--inactive .menu-card-btn-sublabel { color: rgba(255, 255, 255, 0.7); }
.menu-card-btn-sublabel .menu-card-lock { color: #C9A227; }
.menu-card-btn-label { line-height: 1.2; }
.menu-card-btn-sublabel { line-height: 1.25; }

/* Metric mode picker: same 2×2 grid and card style */
.metric-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 1.25rem;
  max-width: min(92vw, 380px);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
}
.metric-menu-empty {
  aspect-ratio: 1;
  min-width: 0;
  background: transparent;
  border: none;
  pointer-events: none;
}
@media (min-width: 480px) {
  .home-buttons-grid { max-width: min(90vw, 360px); gap: 1.25rem; }
  .metric-menu-grid { max-width: min(90vw, 360px); gap: 1.25rem; }
}
@media (min-width: 768px) {
  .home-buttons-grid { max-width: 380px; }
  .metric-menu-grid { max-width: 380px; }
}

/* Quick Calculation: Back/Next bar — mobile: no gap, attached; desktop: gap and separate rounding */
.quick-nav-bar {
  margin-bottom: 0;
}
.quick-nav-buttons {
  gap: 0;
  min-width: 0;
}
.quick-nav-btn-back {
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: 0.75rem;
  border-bottom-left-radius: 0.75rem;
}
.quick-nav-btn-next {
  border-left-width: 1px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}
@media (min-width: 641px) {
  .quick-nav-buttons {
    gap: 0.5rem;
  }
  .quick-nav-btn-back {
    border-right-width: 1px;
    border-top-right-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }
  .quick-nav-btn-next {
    border-left-width: 1px;
    border-top-left-radius: 0.75rem;
    border-bottom-left-radius: 0.75rem;
  }
}

/* A) Тёмный фон редактора: перебить любые bg-white/konva-bg (Konva bgRect — страховка в konvaEditor.js) */
/* Матрица без отступов: padding 0, margin 0, width/height 100% */
.canvas-editor-wrap,
#canvas-wrapper,
#konva-container {
  background-color: #0b0f14 !important;
  background-image: none !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
}
.canvas-editor-wrap.konva-bg { background-image: none !important; }

/* Fullscreen: контейнер графики занимает весь экран (fixed), 100dvh, без прокрутки body */
/* Safe area только на header и controls, НЕ на matrixArea */
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
  max-width: 100vw;
  overflow: hidden;
  padding: 0 0 var(--app-footer-height) 0;
  margin: 0;
  border-radius: 0;
  background: #000;
}

.graphics-header {
  flex-shrink: 0;
  padding-top: env(safe-area-inset-top, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

.graphics-stage-area {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
}

.graphics-controls-area {
  flex-shrink: 0;
  max-height: 45vh;
  overflow-y: auto;
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

/* Body без прокрутки при активной графике */
body.graphics-fullscreen-active {
  overflow: hidden;
  height: 100dvh;
}

/* Fullscreen pseudo (кнопка «полноэкранный») */
.graphics-fullscreen-wrapper.graphics-fullscreen-pseudo {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
</style>

<!-- build test -->
