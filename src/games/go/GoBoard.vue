<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { Player, type Move } from './types'
import { initBoard, BOARD_SIZE, getCapturedPieces, isSuicide } from './logic'

const state = reactive({
  board: initBoard(),
  turn: Player.BLACK as Player,
  history: [] as Move[],
  capturedBlack: 0,
  capturedWhite: 0,
  lastMove: null as Move | null,
})

const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const updateScale = () => {
  if (!containerRef.value) return
  const parent = containerRef.value.parentElement
  if (!parent) return

  const boardSize = 720 // Original width/height
  const availableWidth = parent.clientWidth - 40
  const availableHeight = parent.clientHeight - 120

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
  if (state.board[r][c]) return

  // Simple rule check (no suicide for now, basic capture logic)
  if (isSuicide(r, c, state.turn, state.board)) {
    // Check if it captures opponent pieces
    const tempBoard = state.board.map((row) => [...row])
    tempBoard[r][c] = state.turn
    const captured = getCapturedPieces(r, c, state.turn, tempBoard)
    if (captured.length === 0) {
      alert('不能落子：禁止自杀手')
      return
    }
  }

  // Place stone
  state.board[r][c] = state.turn
  state.lastMove = { row: r, col: c, player: state.turn }

  // Capture logic
  const captured = getCapturedPieces(r, c, state.turn, state.board)
  if (captured.length > 0) {
    for (const [cr, cc] of captured) {
      state.board[cr][cc] = null
    }
    if (state.turn === Player.BLACK) {
      state.capturedWhite += captured.length
    } else {
      state.capturedBlack += captured.length
    }
  }

  state.history.push({ ...state.lastMove })
  state.turn = state.turn === Player.BLACK ? Player.WHITE : Player.BLACK
}

const resetGame = () => {
  state.board = initBoard()
  state.turn = Player.BLACK
  state.history = []
  state.capturedBlack = 0
  state.capturedWhite = 0
  state.lastMove = null
}
</script>

<template>
  <div ref="containerRef" class="go-container">
    <div class="game-header">
      <div class="score-board">
        <div class="score-item black">
          <span>黑棋提子: {{ state.capturedWhite }}</span>
        </div>
        <div class="score-item white">
          <span>白棋提子: {{ state.capturedBlack }}</span>
        </div>
      </div>
      <div class="turn-indicator" :class="state.turn">
        当前回合: {{ state.turn === Player.BLACK ? '黑棋' : '白棋' }}
      </div>
      <button class="reset-btn" @click="resetGame">重新开始</button>
    </div>

    <div class="board-wrapper" :style="{ transform: `scale(${scale})` }">
      <div class="board">
        <div class="grid">
          <div
            v-for="i in BOARD_SIZE"
            :key="`h-${i}`"
            class="line-h"
            :style="{ top: `${(i - 1) * 36 + 18}px` }"
          ></div>
          <div
            v-for="i in BOARD_SIZE"
            :key="`v-${i}`"
            class="line-v"
            :style="{ left: `${(i - 1) * 36 + 18}px` }"
          ></div>
        </div>

        <!-- Stars -->
        <div class="star" style="top: 126px; left: 126px"></div>
        <div class="star" style="top: 126px; left: 342px"></div>
        <div class="star" style="top: 126px; left: 558px"></div>
        <div class="star" style="top: 342px; left: 126px"></div>
        <div class="star" style="top: 342px; left: 342px"></div>
        <div class="star" style="top: 342px; left: 558px"></div>
        <div class="star" style="top: 558px; left: 126px"></div>
        <div class="star" style="top: 558px; left: 342px"></div>
        <div class="star" style="top: 558px; left: 558px"></div>

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
                class="stone"
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
  </div>
</template>

<style scoped>
.go-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  height: 100%;
}

.game-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 684px;
  align-items: center;
}

.score-board {
  display: flex;
  gap: 10px;
}
.score-item {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
}
.score-item.black {
  background: #333;
  color: white;
}
.score-item.white {
  background: #eee;
  color: #333;
  border: 1px solid #ccc;
}

.turn-indicator {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
}

.turn-indicator.black {
  background: #333;
  color: white;
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  border-radius: 4px;
}

.board {
  position: relative;
  width: 684px;
  height: 684px;
  background: #f0d9b5;
  border: 1px solid #333;
}

.grid {
  position: absolute;
  width: 100%;
  height: 100%;
}
.line-h,
.line-v {
  position: absolute;
  background: #333;
}
.line-h {
  width: 648px;
  left: 18px;
  height: 1px;
}
.line-v {
  height: 648px;
  top: 18px;
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

.stone {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stone.black {
  background: radial-gradient(circle at 30% 30%, #555, #000);
}

.stone.white {
  background: radial-gradient(circle at 30% 30%, #fff, #ccc);
}

.last-move-dot {
  width: 6px;
  height: 6px;
  background: #ff4d4f;
  border-radius: 50%;
}
</style>
