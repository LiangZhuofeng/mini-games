<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useGameStore } from '../../stores/game'
import GameRules from '../common/GameRules.vue'
import {
  DIFFICULTIES,
  createBoard,
  hasWon,
  plantMines,
  revealAllMines,
  revealCell,
  toggleFlag,
  type Board,
  type Cell,
  type Difficulty,
} from './logic'

type Status = 'idle' | 'playing' | 'won' | 'lost'

const state = reactive({
  difficulty: DIFFICULTIES[0],
  board: createBoard(DIFFICULTIES[0].rows, DIFFICULTIES[0].cols) as Board,
  started: false,
  status: 'idle' as Status,
  elapsedSeconds: 0,
  flagsUsed: 0,
})

const gameStore = useGameStore()

const showRules = ref(false)
const showDifficultyConfirm = ref(false)
const pendingDifficulty = ref<Difficulty | null>(null)

let timerId: number | null = null

const remainingMines = computed(() => Math.max(state.difficulty.mines - state.flagsUsed, 0))
const statusText = computed(() => {
  if (state.status === 'won') return '排雷成功'
  if (state.status === 'lost') return '踩雷了'
  if (!state.started) return '点击任意格开始'
  return '小心推进，右键插旗'
})

const boardStyle = computed(() => ({
  gridTemplateColumns: `repeat(${state.difficulty.cols}, minmax(0, 1fr))`,
  gap: state.difficulty.id === 'beginner' || state.difficulty.id === 'intermediate' ? '0px' : '4px',
}))

function onDifficultyClick(difficulty: Difficulty) {
  if (state.started && state.status === 'playing') {
    pendingDifficulty.value = difficulty
    showDifficultyConfirm.value = true
  } else {
    setupGame(difficulty)
  }
}

function confirmDifficultyChange() {
  if (pendingDifficulty.value) {
    setupGame(pendingDifficulty.value)
    pendingDifficulty.value = null
  }
  showDifficultyConfirm.value = false
}

function cancelDifficultyChange() {
  pendingDifficulty.value = null
  showDifficultyConfirm.value = false
}

function setupGame(difficulty: Difficulty) {
  clearTimer()
  state.difficulty = difficulty
  state.board = createBoard(difficulty.rows, difficulty.cols)
  state.started = false
  state.status = 'idle'
  state.elapsedSeconds = 0
  state.flagsUsed = 0
}

function startGame(row: number, col: number) {
  plantMines(state.board, state.difficulty.mines, row, col)
  state.started = true
  state.status = 'playing'
  timerId = window.setInterval(() => {
    state.elapsedSeconds += 1
  }, 1000)
}

function clearTimer() {
  if (timerId !== null) {
    window.clearInterval(timerId)
    timerId = null
  }
}

function handleReveal(row: number, col: number) {
  if (state.status === 'won' || state.status === 'lost') {
    return
  }

  const cell = state.board[row][col]
  if (cell.flagged) {
    return
  }

  if (!state.started) {
    startGame(row, col)
  }

  const revealed = revealCell(state.board, row, col)
  if (!revealed.length) {
    return
  }

  if (revealed.some((entry) => entry.hasMine)) {
    state.status = 'lost'
    revealAllMines(state.board)
    clearTimer()

    // Record game
    gameStore.addRecord({
      gameId: 'minesweeper',
      gameName: `扫雷 (${state.difficulty.label})`,
      playerName: '本地玩家',
      winner: '失败',
      duration: state.elapsedSeconds,
      moves: state.board.flat().filter((c) => c.revealed).length,
    })
    return
  }

  if (hasWon(state.board, state.difficulty.mines)) {
    state.status = 'won'
    clearTimer()
    autoFlagMines()

    // Record game
    gameStore.addRecord({
      gameId: 'minesweeper',
      gameName: `扫雷 (${state.difficulty.label})`,
      playerName: '本地玩家',
      winner: '胜利',
      duration: state.elapsedSeconds,
      moves: state.board.flat().filter((c) => c.revealed).length,
    })
  }
}

function handleFlag(cell: Cell) {
  if (state.status === 'won' || state.status === 'lost') {
    return
  }

  if (!cell.flagged && state.flagsUsed >= state.difficulty.mines) {
    return
  }

  const flagged = toggleFlag(cell)
  state.flagsUsed += flagged ? 1 : -1
}

function autoFlagMines() {
  state.board.flat().forEach((cell) => {
    if (cell.hasMine && !cell.flagged) {
      cell.flagged = true
    }
  })
  state.flagsUsed = state.difficulty.mines
}

function getCellLabel(cell: Cell): string {
  if (!cell.revealed) {
    return cell.flagged ? '🚩' : ''
  }

  if (cell.hasMine) {
    return '💣'
  }

  return cell.adjacentMines > 0 ? String(cell.adjacentMines) : ''
}

function getCellClass(cell: Cell): string[] {
  const classes = ['mine-cell']

  if (cell.revealed) classes.push('revealed')
  if (cell.flagged) classes.push('flagged')
  if (cell.hasMine && cell.revealed) classes.push('mine')
  if (cell.revealed && cell.adjacentMines > 0) classes.push(`count-${cell.adjacentMines}`)

  return classes
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <div class="minesweeper-shell">
    <section class="minesweeper-panel">
      <div class="panel-top">
        <div>
          <p class="eyebrow">经典小游戏</p>
          <h2>扫雷</h2>
          <p class="status-copy">{{ statusText }}</p>
        </div>
        <div class="header-actions">
          <button class="rule-btn" @click="showRules = true">规则</button>
          <button class="reset-btn" @click="setupGame(state.difficulty)">重新开局</button>
        </div>
      </div>

      <div class="difficulty-row">
        <button
          v-for="difficulty in DIFFICULTIES"
          :key="difficulty.id"
          class="difficulty-btn"
          :class="{ active: state.difficulty.id === difficulty.id }"
          @click="onDifficultyClick(difficulty)"
        >
          {{ difficulty.label }}
        </button>
      </div>

      <div class="scoreboard">
        <div class="score-card">
          <span>剩余地雷</span>
          <strong>{{ remainingMines }}</strong>
        </div>
        <div class="score-card">
          <span>用时</span>
          <strong>{{ state.elapsedSeconds }}s</strong>
        </div>
        <div class="score-card">
          <span>状态</span>
          <strong>{{
            state.status === 'idle'
              ? '待开始'
              : state.status === 'playing'
                ? '进行中'
                : state.status === 'won'
                  ? '胜利'
                  : '失败'
          }}</strong>
        </div>
      </div>

      <div class="board-scroll">
        <div class="mine-grid" :style="boardStyle">
          <button
            v-for="cell in state.board.flat()"
            :key="`${cell.row}-${cell.col}`"
            type="button"
            :class="getCellClass(cell)"
            @click="handleReveal(cell.row, cell.col)"
            @contextmenu.prevent="handleFlag(cell)"
          >
            {{ getCellLabel(cell) }}
          </button>
        </div>
      </div>

      <p class="hint">操作提示：左键翻开格子，右键标记地雷。首击安全，周围九宫格不会布雷。</p>
    </section>

    <!-- Rules Modal -->
    <GameRules :show="showRules" title="扫雷" @close="showRules = false">
      <p>1. 棋盘上随机分布着一定数量的地雷。</p>
      <p>2. 点击格子可以翻开它：</p>
      <ul>
        <li>如果是数字，表示该格子周围 8 个方向相邻格子的地雷总数。</li>
        <li>如果是空白（0），会自动翻开周围相邻的空格。</li>
        <li>如果是地雷，则游戏失败。</li>
      </ul>
      <p>3. 鼠标右键可以标记旗帜，表示你认为该处有雷。</p>
      <p>4. 找出所有非地雷格子即为胜利。</p>
    </GameRules>

    <!-- Difficulty Change Confirmation -->
    <Transition name="fade">
      <div v-if="showDifficultyConfirm" class="confirm-overlay">
        <div class="confirm-modal">
          <h3>切换难度</h3>
          <p>当前游戏正在进行中，切换难度将重置当前进度。确定要继续吗？</p>
          <div class="confirm-footer">
            <button class="cancel-btn" @click="cancelDifficultyChange">取消</button>
            <button class="confirm-btn" @click="confirmDifficultyChange">确定切换</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.minesweeper-shell {
  width: 100%;
  display: flex;
  justify-content: center;
}

.minesweeper-panel {
  width: min(100%, 1120px);
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.7), transparent 28%),
    linear-gradient(135deg, rgba(24, 35, 55, 0.92), rgba(17, 24, 39, 0.98));
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  color: #f8fafc;
}

.panel-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.rule-btn {
  padding: 12px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.rule-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #93c5fd;
}

h2 {
  margin: 0;
  font-size: 38px;
  color: #ffffff;
}

.status-copy {
  margin: 10px 0 0;
  color: #cbd5e1;
}

.reset-btn,
.difficulty-btn {
  border: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.reset-btn {
  padding: 12px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f97316, #fb7185);
  color: #fff7ed;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.28);
}

.reset-btn:hover,
.difficulty-btn:hover,
.mine-cell:hover {
  transform: translateY(-1px);
}

.difficulty-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.difficulty-btn {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
  font-weight: 600;
}

.difficulty-btn.active {
  background: linear-gradient(135deg, #22c55e, #14b8a6);
  color: #052e16;
}

.scoreboard {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.score-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.score-card span {
  display: block;
  font-size: 13px;
  color: #94a3b8;
}

.score-card strong {
  display: block;
  margin-top: 8px;
  font-size: 26px;
  color: #ffffff;
}

.board-scroll {
  overflow: auto;
  padding: 8px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(15, 23, 42, 0.14)), #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.mine-grid {
  display: grid;
  gap: 4px;
  min-width: fit-content;
}

.mine-cell {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(180deg, #cbd5e1, #94a3b8);
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.55);
}

.mine-cell.revealed {
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.mine-cell.flagged {
  background: linear-gradient(180deg, #fef3c7, #f59e0b);
}

.mine-cell.mine {
  background: linear-gradient(180deg, #fecaca, #ef4444);
}

.mine-cell.count-1 {
  color: #2563eb;
}
.mine-cell.count-2 {
  color: #16a34a;
}
.mine-cell.count-3 {
  color: #dc2626;
}
.mine-cell.count-4 {
  color: #1d4ed8;
}
.mine-cell.count-5 {
  color: #7c2d12;
}
.mine-cell.count-6 {
  color: #0f766e;
}
.mine-cell.count-7 {
  color: #111827;
}
.mine-cell.count-8 {
  color: #6b21a8;
}

.hint {
  margin: 0;
  color: #cbd5e1;
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
}

.confirm-modal {
  background: white;
  padding: 32px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.confirm-modal h3 {
  margin: 0 0 16px;
  color: #1e293b;
  font-size: 22px;
}

.confirm-modal p {
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
}

.confirm-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.confirm-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  background: #f43f5e;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.confirm-btn:hover {
  background: #e11d48;
}

@media (max-width: 900px) {
  .panel-top {
    flex-direction: column;
  }

  .scoreboard {
    grid-template-columns: 1fr;
  }

  .minesweeper-panel {
    padding: 18px;
  }
}
</style>
