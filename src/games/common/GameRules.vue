<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="rules-overlay" @click.self="$emit('close')">
      <div class="rules-modal">
        <div class="rules-header">
          <h3>{{ title }} - 游戏规则</h3>
          <button class="close-btn" @click="$emit('close')">&times;</button>
        </div>
        <div class="rules-content">
          <slot></slot>
        </div>
        <div class="rules-footer">
          <button class="confirm-btn" @click="$emit('close')">我明白了</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.rules-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.rules-modal {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  animation: slide-up 0.3s ease-out;
}

.rules-header {
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rules-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.rules-content {
  padding: 24px;
  overflow-y: auto;
  color: #666;
  line-height: 1.6;
  font-size: 15px;
}

.rules-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 10px 24px;
  background: #646cff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.confirm-btn:hover {
  background: #535bf2;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
