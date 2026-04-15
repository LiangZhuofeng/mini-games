<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { Player, PieceType, type Piece } from './types'
import { initBoard, ROWS, COLS, isValidMove, isRiver, isTrap, isDen } from './logic'

const state = reactive({
  board: initBoard(),
  turn: Player.BLUE as Player,
  selectedPiece: null as Piece | null,
  winner: null as Player | null,
})

const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const updateScale = () => {
  if (!containerRef.value) return
  const parent = containerRef.value.parentElement
  if (!parent) return

  const boardSizeW = 490
  const boardSizeH = 630
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

const getPieceName = (type: PieceType) => {
  switch (type) {
    case PieceType.ELEPHANT:
      return '象'
    case PieceType.LION:
      return '狮'
    case PieceType.TIGER:
      return '虎'
    case PieceType.LEOPARD:
      return '豹'
    case PieceType.WOLF:
      return '狼'
    case PieceType.DOG:
      return '狗'
    case PieceType.CAT:
      return '猫'
    case PieceType.RAT:
      return '鼠'
  }
}

const handleCellClick = (r: number, c: number) => {
  if (state.winner) return

  const target = state.board[r][c]

  if (state.selectedPiece) {
    if (target && target.player === state.turn) {
      state.selectedPiece = target
      return
    }

    if (isValidMove(state.selectedPiece, r, c, state.board)) {
      const [fromR, fromC] = state.selectedPiece.position

      // Update board
      state.board[r][c] = { ...state.selectedPiece, position: [r, c] }
      state.board[fromR][fromC] = null

      // Check win condition (entering den)
      if (isDen(r, c, state.selectedPiece.player)) {
        state.winner = state.selectedPiece.player
      }

      state.selectedPiece = null
      state.turn = state.turn === Player.BLUE ? Player.RED : Player.BLUE
    } else {
      state.selectedPiece = null
    }
  } else {
    if (target && target.player === state.turn) {
      state.selectedPiece = target
    }
  }
}

const resetGame = () => {
  state.board = initBoard()
  state.turn = Player.BLUE
  state.selectedPiece = null
  state.winner = null
}
</script>

<template>
  <div ref="containerRef" class="jungle-container">
    <div class="game-header">
      <div class="turn-indicator" :class="state.turn">
        {{
          state.winner
            ? `获胜者: ${state.winner === Player.BLUE ? '蓝方' : '红方'}`
            : `当前回合: ${state.turn === Player.BLUE ? '蓝方' : '红方'}`
        }}
      </div>
      <button class="reset-btn" @click="resetGame">重新开始</button>
    </div>

    <div class="board-wrapper" :style="{ transform: `scale(${scale})` }">
      <div class="board">
        <div v-for="r in ROWS" :key="`row-${r}`" class="row">
          <div
            v-for="c in COLS"
            :key="`cell-${r}-${c}`"
            class="cell"
            :class="{
              river: isRiver(r - 1, c - 1),
              trap: isTrap(r - 1, c - 1, state.turn),
              den: (r - 1 === 0 && c - 1 === 3) || (r - 1 === 8 && c - 1 === 3),
            }"
            @click="handleCellClick(r - 1, c - 1)"
          >
            <div v-if="r - 1 === 0 && c - 1 === 3" class="den-text">蓝穴</div>
            <div v-if="r - 1 === 8 && c - 1 === 3" class="den-text">红穴</div>

            <div
              v-if="state.board[r - 1][c - 1]"
              class="piece"
              :class="[
                state.board[r - 1][c - 1]?.player,
                { selected: state.selectedPiece?.id === state.board[r - 1][c - 1]?.id },
              ]"
            >
              {{ getPieceName(state.board[r - 1][c - 1]!.type) }}
            </div>
            <div
              v-if="
                state.selectedPiece && isValidMove(state.selectedPiece, r - 1, c - 1, state.board)
              "
              class="move-hint"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jungle-container {
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
  max-width: 490px;
  align-items: center;
}
.turn-indicator {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
}
.turn-indicator.blue {
  background: #3498db;
}
.turn-indicator.red {
  background: #e74c3c;
}

.reset-btn {
  padding: 8px 16px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.board-wrapper {
  padding: 10px;
  background: #8b4513;
  border: 5px solid #5d4037;
  border-radius: 8px;
}
.board {
  display: flex;
  flex-direction: column;
  width: 490px;
  height: 630px;
  background: #7cb342;
  border: 2px solid #333;
}

.row {
  display: flex;
  flex: 1;
}
.cell {
  flex: 1;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.cell.river {
  background: #4fc3f7;
}
.cell.trap {
  background: #fbc02d;
}
.cell.den {
  background: #7e57c2;
  color: white;
}
.den-text {
  font-size: 10px;
  position: absolute;
  top: 2px;
}

.piece {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.piece.blue {
  background: #3498db;
  color: white;
  border: 3px solid #2980b9;
}
.piece.red {
  background: #e74c3c;
  color: white;
  border: 3px solid #c0392b;
}
.piece.selected {
  transform: scale(1.1);
  box-shadow: 0 0 15px #fff;
}

.move-hint {
  width: 15px;
  height: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  z-index: 1;
}
</style>
