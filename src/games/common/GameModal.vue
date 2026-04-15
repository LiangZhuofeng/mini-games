<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
      <div class="modal-container">
        <header class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="emit('close')">&times;</button>
        </header>
        <section class="modal-body">
          <slot></slot>
        </section>
        <footer class="modal-footer">
          <button class="confirm-btn" @click="emit('close')">知道了</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modal-in 0.3s ease-out;
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  background: #fcfcfc;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #1a1a1a;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
  color: #444;
  line-height: 1.6;
  font-size: 15px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  background: #fcfcfc;
}

.confirm-btn {
  padding: 10px 32px;
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

@keyframes modal-in {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
