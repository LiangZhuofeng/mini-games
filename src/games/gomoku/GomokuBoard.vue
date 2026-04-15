<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { Player, type Move } from './types'
import { initBoard, checkWinner, BOARD_SIZE } from './logic'
import { useGameStore } from '../../stores/game'
import GameRules from '../common/GameRules.vue'

const gameStore = useGameStore()
const startTime = ref(Date.now())
const showRules = ref(false)

const state = reactive({
  board: initBoard(),
  turn: Player.BLACK as Player,
  history: [] as Move[],
  winner: null as Player | null,
  lastMove: null as Move | null,
})

const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const updateScale = () => {
  if (!containerRef.value) return
  const parent = containerRef.value.parentElement
  if (!parent) return

  const boardSize = 600 // Original width/height
  const availableWidth = parent.clientWidth - 40
  const availableHeight = parent.clientHeight - 100 // Leave space for UI

  scale.value = Math.min(availableWidth / boardSize, availableHeight / boardSize, 1)
}

onMounted(() => {
  window.addEventListener('resize', updateScale)
  updateScale()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})

const handleCellClick = (r: number, c: number) => {
  if (state.winner || state.board[r][c]) return

  state.board[r][c] = state.turn
  state.lastMove = { row: r, col: c, player: state.turn }
  state.history.push({ ...state.lastMove })

  const winner = checkWinner(r, c, state.board)
  if (winner) {
    state.winner = winner

    // Record game
    gameStore.addRecord({
      gameId: 'gomoku',
      gameName: '五子棋',
      playerName: '本地玩家',
      winner: winner === Player.BLACK ? '黑棋' : '白棋',
      duration: Math.floor((Date.now() - startTime.value) / 1000),
      moves: state.history.length,
    })
    return
  }

  state.turn = state.turn === Player.BLACK ? Player.WHITE : Player.BLACK
}

const resetGame = () => {
  state.board = initBoard()
  state.turn = Player.BLACK
  state.history = []
  state.winner = null
  state.lastMove = null
  startTime.value = Date.now()
}
</script>

<template>
  <div ref="containerRef" class="gomoku-container">
    <div class="game-header">
      <div class="turn-indicator" :class="state.turn">
        {{
          state.winner
            ? `获胜者: ${state.winner === Player.BLACK ? '黑棋' : '白棋'}`
            : `当前回合: ${state.turn === Player.BLACK ? '黑棋' : '白棋'}`
        }}
      </div>
      <div class="header-actions">
        <button class="rule-btn" @click="showRules = true">规则</button>
        <button class="reset-btn" @click="resetGame">重新开始</button>
      </div>
    </div>

    <div class="board-wrapper" :style="{ transform: `scale(${scale})` }">
      <div class="board">
        <!-- Board Lines -->
        <div class="grid">
          <div
            v-for="i in BOARD_SIZE - 1"
            :key="`h-${i}`"
            class="line-h"
            :style="{ top: `${i * 40}px` }"
          ></div>
          <div
            v-for="i in BOARD_SIZE - 1"
            :key="`v-${i}`"
            class="line-v"
            :style="{ left: `${i * 40}px` }"
          ></div>
        </div>

        <!-- Stars (optional standard points) -->
        <div class="star" style="top: 120px; left: 120px"></div>
        <div class="star" style="top: 120px; left: 440px"></div>
        <div class="star" style="top: 280px; left: 280px"></div>
        <div class="star" style="top: 440px; left: 120px"></div>
        <div class="star" style="top: 440px; left: 440px"></div>

        <!-- Cells for Interaction -->
        <div class="cells">
          <div v-for="r in BOARD_SIZE" :key="`row-${r}`" class="row">
            <div
              v-for="c in BOARD_SIZE"
              :key="`cell-${r}-${c}`"
              class="cell"
              @click="handleCellClick(r - 1, c - 1)"
            >
              <div
                v-if="state.board[r - 1][c - 1]"
                class="piece"
                :class="state.board[r - 1][c - 1]"
              >
                <div
                  v-if="state.lastMove?.row === r - 1 && state.lastMove?.col === c - 1"
                  class="last-move-dot"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="state.winner" class="victory-overlay">
      <div class="victory-content">
        <h2>{{ state.winner === Player.BLACK ? '黑棋' : '白棋' }} 胜利！</h2>
        <button class="reset-btn-large" @click="resetGame">再来一局</button>
      </div>
    </div>

    <!-- Rules Modal -->
    <GameRules :show="showRules" title="五子棋" @close="showRules = false">
      <p>1. 五子棋是一种两人对弈的纯策略型棋类游戏。</p>
      <p>2. 对弈双方各执一色棋子（黑白两色）。</p>
      <p>3. 空位落子：黑先、白后，交替下子，每次只能下一子。</p>
      <p>4. 胜利条件：在棋盘的竖线、横线或斜线上形成连续的五个棋子（即五子连珠）的一方为胜。</p>
    </GameRules>
  </div>
</template>

<style scoped>
.gomoku-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  height: 100%;
}

.game-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 560px;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.rule-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.rule-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.turn-indicator {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
}

.turn-indicator.black {
  background: #333;
}

.turn-indicator.white {
  background: #eee;
  color: #333;
  border: 1px solid #ccc;
}

.reset-btn {
  padding: 8px 16px;
  background: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.board-wrapper {
  padding: 20px;
  background: #d2b48c;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  transition: transform 0.2s;
}

.board {
  position: relative;
  width: 560px;
  height: 560px;
  background: #f0d9b5;
  border: 2px solid #333;
}

.grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.line-h,
.line-v {
  position: absolute;
  background: #444;
}

.line-h {
  width: 100%;
  height: 1px;
}

.line-v {
  height: 100%;
  width: 1px;
}

.star {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.cells {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 600px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  flex: 1;
}

.cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.piece {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.piece.black {
  background: radial-gradient(circle at 30% 30%, #555, #000);
}

.piece.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ccc);
}

.last-move-dot {
  width: 8px;
  height: 8px;
  background: red;
  border-radius: 50%;
}

.victory-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.victory-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
}

.reset-btn-large {
  margin-top: 20px;
  padding: 12px 30px;
  background: #646cff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}
</style>
