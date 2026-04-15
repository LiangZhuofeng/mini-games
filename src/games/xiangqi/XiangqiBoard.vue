<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { PieceColor, PieceType } from './types'
import type { GameState, Move } from './types'
import { initBoard, isValidMove, isKingFacing, isCheck } from './logic'
import XiangqiPiece from './XiangqiPiece.vue'
import { useGameStore } from '../../stores/game'
import GameModal from '../common/GameModal.vue'

const gameStore = useGameStore()
const startTime = ref(Date.now())

const isCheckActive = ref(false)
const showRules = ref(false)
const showCheckMessage = ref('')

// Sound effects
const moveSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3') // Simple click/move sound
const captureSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3') // Different sound for capture
const checkSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3') // Alert for check

const playSound = (type: 'move' | 'capture' | 'check') => {
  const sound = type === 'move' ? moveSound : type === 'capture' ? captureSound : checkSound
  sound.currentTime = 0
  sound.play().catch(() => {}) // Ignore errors if browser blocks autoplay
}

const formatMove = (move: Move) => {
  const { piece, from, to } = move
  const color = piece.color === PieceColor.RED ? '红' : '黑'
  const typeMap: Record<string, string> = {
    [PieceType.KING]: piece.color === PieceColor.RED ? '帅' : '将',
    [PieceType.ADVISOR]: piece.color === PieceColor.RED ? '仕' : '士',
    [PieceType.ELEPHANT]: piece.color === PieceColor.RED ? '相' : '象',
    [PieceType.HORSE]: piece.color === PieceColor.RED ? '傌' : '馬',
    [PieceType.ROOK]: piece.color === PieceColor.RED ? '俥' : '車',
    [PieceType.CANNON]: piece.color === PieceColor.RED ? '炮' : '砲',
    [PieceType.PAWN]: piece.color === PieceColor.RED ? '兵' : '卒',
  }
  return `${color} ${typeMap[piece.type]} (${from[0]},${from[1]}) -> (${to[0]},${to[1]})`
}

const state = reactive<GameState>({
  board: initBoard(),
  turn: PieceColor.RED,
  selectedPiece: null,
  history: [],
  winner: null,
})

const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const updateScale = () => {
  if (!containerRef.value) return
  const parent = containerRef.value.parentElement
  if (!parent) return

  const boardSizeW = 450
  const boardSizeH = 500
  const availableWidth = parent.clientWidth - 40
  const availableHeight = parent.clientHeight - 100

  scale.value = Math.min(availableWidth / boardSizeW, availableHeight / boardSizeH, 1)
}

onMounted(() => {
  window.addEventListener('resize', updateScale)
  updateScale()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})

const handleCellClick = (row: number, col: number) => {
  if (state.winner) return

  const targetPiece = state.board[row][col]

  // If already selected a piece, try to move
  if (state.selectedPiece) {
    // If clicking own piece, switch selection
    if (targetPiece && targetPiece.color === state.turn) {
      state.selectedPiece = targetPiece
      return
    }

    // Try move
    if (isValidMove(state.selectedPiece, [row, col], state.board)) {
      const from = state.selectedPiece.position
      const to: [number, number] = [row, col]

      // Simulate move to check if kings would face each other
      const originalToPiece = state.board[to[0]][to[1]]
      state.board[to[0]][to[1]] = { ...state.selectedPiece, position: to }
      state.board[from[0]][from[1]] = null

      if (isKingFacing(state.board) || isCheck(state.turn, state.board)) {
        // Rollback
        state.board[from[0]][from[1]] = state.selectedPiece
        state.board[to[0]][to[1]] = originalToPiece
        return
      }

      // Play sound
      if (targetPiece) {
        playSound('capture')
      } else {
        playSound('move')
      }

      // Check win condition (capture King)
      if (targetPiece?.type === PieceType.KING) {
        state.winner = state.turn

        // Record game
        gameStore.addRecord({
          gameId: 'xiangqi',
          gameName: '中国象棋',
          playerName: '本地玩家',
          winner: state.turn === PieceColor.RED ? '红方' : '黑方',
          duration: Math.floor((Date.now() - startTime.value) / 1000),
          moves: state.history.length,
        })
      }

      // History
      state.history.push({
        from,
        to,
        piece: { ...state.selectedPiece },
        capturedPiece: targetPiece ? { ...targetPiece } : undefined,
      })

      // Next turn
      state.turn = state.turn === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED
      state.selectedPiece = null

      // Check if opponent is in check
      if (isCheck(state.turn, state.board)) {
        isCheckActive.value = true
        showCheckMessage.value = '将军！'
        playSound('check')
        setTimeout(() => {
          isCheckActive.value = false
        }, 2000)
      }
    } else {
      // Invalid move, clear selection if not clicking another of own piece
      if (!targetPiece || targetPiece.color !== state.turn) {
        state.selectedPiece = null
      }
    }
  } else {
    // Select piece if it belongs to current turn
    if (targetPiece && targetPiece.color === state.turn) {
      state.selectedPiece = targetPiece
    }
  }
}

const resetGame = () => {
  state.board = initBoard()
  state.turn = PieceColor.RED
  state.selectedPiece = null
  state.history = []
  state.winner = null
  startTime.value = Date.now()
}
</script>

<template>
  <div ref="containerRef" class="game-container">
    <div class="game-main-content">
      <div class="game-info">
        <div class="turn-indicator" :class="`turn-${state.turn}`">
          {{
            state.winner
              ? `获胜者: ${state.winner === PieceColor.RED ? '红方' : '黑方'}`
              : `当前回合: ${state.turn === PieceColor.RED ? '红方' : '黑方'}`
          }}
        </div>
        <div class="header-actions">
          <button class="rules-btn" @click="showRules = true">规则</button>
          <button class="reset-btn" @click="resetGame">重新开始</button>
        </div>
      </div>

      <div class="board-wrapper" :style="{ transform: `scale(${scale})` }">
        <div class="board" role="grid" aria-label="象棋棋盘">
          <!-- Vertical Lines -->
          <div
            v-for="i in 9"
            :key="`v-${i}`"
            class="line-v"
            :class="{ 'river-skip': i > 1 && i < 9 }"
            :style="{ left: `${(i - 1) * 50 + 25}px` }"
          ></div>
          <!-- Horizontal Lines -->
          <div
            v-for="i in 10"
            :key="`h-${i}`"
            class="line-h"
            :style="{ top: `${(i - 1) * 50 + 25}px` }"
          ></div>

          <!-- River -->
          <div class="river">
            <span>楚 河</span>
            <span>漢 界</span>
          </div>

          <!-- Palace Diagonals -->
          <div class="palace-black"></div>
          <div class="palace-red"></div>

          <!-- Cells for Interaction -->
          <div class="cells-grid">
            <div v-for="r in 10" :key="`r-${r}`" class="row">
              <div
                v-for="c in 9"
                :key="`c-${r}-${c}`"
                class="cell"
                role="gridcell"
                :aria-label="`第${r}行, 第${c}列`"
                @click="handleCellClick(r - 1, c - 1)"
              >
                <XiangqiPiece
                  v-if="state.board[r - 1][c - 1]"
                  :piece="state.board[r - 1][c - 1]!"
                  :is-selected="state.selectedPiece?.id === state.board[r - 1][c - 1]?.id"
                />
                <div
                  v-if="
                    state.selectedPiece &&
                    isValidMove(state.selectedPiece, [r - 1, c - 1], state.board)
                  "
                  class="move-hint"
                ></div>
              </div>
            </div>
          </div>

          <!-- Check Message Overlay -->
          <transition name="fade">
            <div v-if="isCheckActive" class="check-overlay">
              {{ showCheckMessage }}
            </div>
          </transition>

          <!-- Victory Overlay -->
          <div v-if="state.winner" class="victory-overlay">
            <div class="victory-content">
              <h2>
                {{ state.winner === PieceColor.RED ? '红方' : '黑方' }}
                获得胜利！
              </h2>
              <button class="reset-btn-large" @click="resetGame">再来一局</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History Panel -->
    <div class="history-panel">
      <h3>对战记录</h3>
      <div class="history-list">
        <div v-for="(move, index) in state.history" :key="index" class="history-item">
          <span class="step-num">{{ index + 1 }}.</span>
          <span class="move-text">{{ formatMove(move) }}</span>
        </div>
        <div v-if="state.history.length === 0" class="no-history">暂无对战记录</div>
      </div>
    </div>

    <GameModal :show="showRules" title="中国象棋 规则" @close="showRules = false">
      <p>1. <b>马</b>：走“日”字，若中间有棋子则“蹩马腿”。</p>
      <p>2. <b>象/相</b>：走“田”字，不能过河，若中间有棋子则“塞象眼”。</p>
      <p>3. <b>车/俥</b>：直线行走，步数不限。</p>
      <p>4. <b>炮/砲</b>：移动同车，吃子需跳过一个棋子（炮台）。</p>
      <p>5. <b>士/仕</b>：在九宫格内沿对角线走一步。</p>
      <p>6. <b>将/帅</b>：在九宫格内直线走一步，不能与对方将帅直接对面（白脸将）。</p>
      <p>7. <b>兵/卒</b>：过河前只能前行，过河后可左右移动，不可后退。</p>
    </GameModal>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 30px;
  padding: 30px;
  background: #fdfdfd;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.game-main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.history-panel {
  width: 280px;
  height: 560px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.history-panel h3 {
  padding: 15px;
  margin: 0;
  background: #f8f8f8;
  border-bottom: 1px solid #eee;
  border-radius: 8px 8px 0 0;
  text-align: center;
  color: #333;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.history-item {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.history-item:last-child {
  border-bottom: none;
  background-color: #fff9c4;
}

.step-num {
  color: #999;
  font-weight: bold;
  min-width: 25px;
}

.move-text {
  color: #444;
}

.no-history {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.check-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  font-weight: 900;
  color: #d32f2f;
  text-shadow:
    0 0 20px rgba(255, 255, 255, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 100;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.victory-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  border-radius: 4px;
}

.victory-content {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.victory-content h2 {
  margin: 0 0 30px 0;
  color: #333;
  font-size: 32px;
}

.reset-btn-large {
  padding: 12px 30px;
  font-size: 20px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.reset-btn-large:hover {
  transform: scale(1.05);
  background: #b71c1c;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s,
    transform 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}

.game-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 450px;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.rules-btn {
  padding: 8px 16px;
  font-size: 16px;
  background: rgba(0, 0, 0, 0.05);
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.rules-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.turn-indicator {
  font-size: 20px;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
}

.turn-red {
  background-color: #d32f2f;
}

.turn-black {
  background-color: #212121;
}

.reset-btn {
  padding: 8px 16px;
  font-size: 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #45a049;
}

.board-wrapper {
  padding: 10px;
  background: #d2b48c;
  border: 4px solid #8b4513;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.board {
  position: relative;
  width: 450px;
  height: 500px;
  background: #f0d9b5;
}

.line-v {
  position: absolute;
  width: 2px;
  height: 450px;
  background: #333;
  top: 25px;
}

.line-v.river-skip {
  height: 200px;
}
.line-v.river-skip::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 200px;
  background: #333;
  top: 250px;
  left: 0;
}

.line-h {
  position: absolute;
  height: 2px;
  width: 400px;
  background: #333;
  left: 25px;
}

.river {
  position: absolute;
  top: 225px;
  left: 25px;
  width: 400px;
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 32px;
  font-weight: bold;
  color: #333;
  font-family: 'KaiTi', 'STKaiti', serif;
}

.river span {
  transform: rotate(0deg);
}

.river span:first-child {
  transform: rotate(180deg);
}

.palace-black,
.palace-red {
  position: absolute;
  width: 100px;
  height: 100px;
  left: 175px;
  pointer-events: none;
}

.palace-black {
  top: 25px;
  background:
    linear-gradient(45deg, transparent 49%, #333 49%, #333 51%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, #333 49%, #333 51%, transparent 51%);
}

.palace-red {
  top: 375px;
  background:
    linear-gradient(45deg, transparent 49%, #333 49%, #333 51%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, #333 49%, #333 51%, transparent 51%);
}

.cells-grid {
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
  height: 50px;
}

.cell {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.move-hint {
  width: 12px;
  height: 12px;
  background: rgba(0, 255, 0, 0.4);
  border-radius: 50%;
  pointer-events: none;
}
</style>
