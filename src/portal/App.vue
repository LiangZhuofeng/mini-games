<script setup lang="ts">
import { ref, defineAsyncComponent, computed } from 'vue'

const games = [
  {
    id: 'xiangqi',
    name: '中国象棋',
    icon: '♟️',
    description: '经典国粹，博弈千古',
    component: defineAsyncComponent(() => import('../games/xiangqi/XiangqiBoard.vue')),
  },
  {
    id: 'gomoku',
    name: '五子棋',
    icon: '⚫',
    description: '五子连珠，智慧博弈',
    component: defineAsyncComponent(() => import('../games/gomoku/GomokuBoard.vue')),
  },
  {
    id: 'go',
    name: '围棋',
    icon: '⚪',
    description: '黑白纵横，乾坤之妙',
    component: defineAsyncComponent(() => import('../games/go/GoBoard.vue')),
  },
  {
    id: 'jungle',
    name: '斗兽棋',
    icon: '🦁',
    description: '弱肉强食，森林之王',
    component: defineAsyncComponent(() => import('../games/jungle/JungleBoard.vue')),
  },
  {
    id: 'luzhanqi',
    name: '军棋',
    icon: '🎖️',
    description: '排兵布阵，决胜千里',
    component: defineAsyncComponent(() => import('../games/luzhanqi/LuzhanqiBoard.vue')),
  },
  {
    id: 'minesweeper',
    name: '扫雷',
    icon: '💣',
    description: '步步惊心，旗开得胜',
    component: defineAsyncComponent(() => import('../games/minesweeper/MinesweeperBoard.vue')),
  },
]

const currentGameId = ref<string | null>(null)

const currentGame = computed(() => {
  return games.find((g) => g.id === currentGameId.value) || null
})

const selectGame = (id: string | null) => {
  currentGameId.value = id
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1 style="cursor: pointer" @click="selectGame(null)">小游戏合集</h1>
      <nav class="game-nav">
        <button v-if="currentGameId" class="home-btn" @click="selectGame(null)">返回大厅</button>
        <button
          v-for="game in games.filter((g) => g.component)"
          :key="game.id"
          :class="{ active: currentGameId === game.id }"
          @click="selectGame(game.id)"
        >
          {{ game.name }}
        </button>
        <a href="/admin.html" class="admin-link-btn">管理后台</a>
      </nav>
    </header>

    <main class="game-main">
      <div v-if="currentGame && currentGame.component" class="game-wrapper">
        <component :is="currentGame.component" />
      </div>
      <div v-else class="portal-screen">
        <div class="portal-grid">
          <div
            v-for="game in games"
            :key="game.id"
            class="game-card"
            :class="{ disabled: !game.component }"
            @click="game.component && selectGame(game.id)"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <h3>{{ game.name }}</h3>
            <p>{{ game.description }}</p>
            <button v-if="game.component" class="play-btn">立即开始</button>
            <button v-else class="coming-soon-btn" disabled>敬请期待</button>
          </div>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>&copy; 2026 Mini-Games Collection</p>
    </footer>
  </div>
</template>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#app {
  width: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-header {
  padding: 20px 40px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  color: #646cff;
  font-size: 28px;
}

.game-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.game-nav button {
  padding: 8px 16px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  background-color: #333;
  color: white;
  cursor: pointer;
  transition: all 0.25s;
}

.game-nav button:hover {
  border-color: #646cff;
}

.game-nav button.active {
  background-color: #646cff;
  font-weight: bold;
}

.game-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #d2b48c;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.07) 50%, transparent 50%),
    linear-gradient(rgba(255, 255, 255, 0.13) 50%, transparent 50%),
    linear-gradient(rgba(255, 255, 255, 0.06) 50%, transparent 50%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 50%, transparent 50%);
  background-size:
    80px 80px,
    60px 60px,
    40px 40px,
    20px 20px;
  color: #333;
  overflow: auto;
}

.game-wrapper {
  transform-origin: center center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 100vw;
  max-height: 100vh;
}

.portal-screen {
  width: 100%;
  max-width: 1200px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  justify-items: center;
}

.game-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.game-card.disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.game-card.disabled:hover {
  transform: none;
}

.game-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.game-card h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #1a1a1a;
}

.game-card p {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}

.play-btn {
  background: #646cff;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.play-btn:hover {
  background: #535bf2;
}

.coming-soon-btn {
  background: #eee;
  color: #999;
  border: none;
  padding: 10px 25px;
  border-radius: 8px;
  cursor: not-allowed;
}

.home-btn {
  background-color: #f0f2f5 !important;
  color: #333 !important;
  border: 1px solid #ddd !important;
}

.home-btn:hover {
  background-color: #e4e6e9 !important;
}

.admin-link-btn {
  padding: 8px 16px;
  font-size: 16px;
  border-radius: 8px;
  background-color: #333;
  color: white;
  text-decoration: none;
  transition: all 0.25s;
  display: flex;
  align-items: center;
}

.admin-link-btn:hover {
  background-color: #444;
  border-color: #646cff;
}

.app-footer {
  padding: 20px;
  text-align: center;
  background-color: #1a1a1a;
  color: #666;
}
</style>
