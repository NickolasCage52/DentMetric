<template>
  <div class="step-dots">
    <span
      v-for="s in totalSteps"
      :key="s"
      class="step-dot"
      :class="currentStep >= s ? 'step-dot--active' : 'step-dot--idle'"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 4 }
});
</script>

<style scoped>
.step-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.step-dot--active {
  background: #8aff2a;
  transform: scale(1.2);
}
.step-dot--idle {
  background: rgba(255, 255, 255, 0.25);
}
</style>
