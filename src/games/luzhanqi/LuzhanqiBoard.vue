<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { Player, PieceType, type Piece } from './types'
import { initBoard, ROWS, COLS, isValidMove, isCamp, isRailroad, resolveCombat } from './logic'

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

  const boardSizeW = 400
  const boardSizeH = 720
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
    case PieceType.MARSHAL:
      return '司令'
    case PieceType.GENERAL:
      return '军长'
    case PieceType.MAJOR_GENERAL:
      return '师长'
    case PieceType.BRIGADIER:
      return '旅长'
    case PieceType.COLONEL:
      return '团长'
    case PieceType.MAJOR:
      return '营长'
    case PieceType.CAPTAIN:
      return '连长'
    case PieceType.LIEUTENANT:
      return '排长'
    case PieceType.PLATOON:
      return '工兵'
    case PieceType.ENGINEER:
      return '工兵'
    case PieceType.MINE:
      return '地雷'
    case PieceType.BOMB:
      return '炸弹'
    case PieceType.FLAG:
      return '军旗'
    default:
      return ''
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

      let combatResult: Piece | null = state.selectedPiece
      if (target) {
        combatResult = resolveCombat(state.selectedPiece, target)
        if (target.type === PieceType.FLAG && combatResult === state.selectedPiece) {
          state.winner = state.selectedPiece.player
        }
      }

      state.board[r][c] = combatResult
        ? { ...combatResult, position: [r, c], isRevealed: true }
        : null
      state.board[fromR][fromC] = null
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
  <div ref="containerRef" class="luzhanqi-container">
    <div class="game-header">
      <div class="turn-indicator" :class="state.turn">
        {{
          state.winner
            ? `获胜者: ${state.winner === Player.BLUE ? '蓝军' : '红军'}`
            : `当前回合: ${state.turn === Player.BLUE ? '蓝军' : '红军'}`
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
              camp: isCamp(r - 1, c - 1),
              railroad: isRailroad(r - 1, c - 1),
              river: r === 6 && r - 1 === 5, // simplified river line
            }"
            @click="handleCellClick(r - 1, c - 1)"
          >
            <div
              v-if="state.board[r - 1][c - 1]"
              class="piece"
              :class="[
                state.board[r - 1][c - 1]?.player,
                {
                  selected: state.selectedPiece?.id === state.board[r - 1][c - 1]?.id,
                  hidden:
                    !state.board[r - 1][c - 1]?.isRevealed &&
                    state.board[r - 1][c - 1]?.player !== state.turn,
                },
              ]"
            >
              {{
                state.board[r - 1][c - 1]?.isRevealed ||
                state.board[r - 1][c - 1]?.player === state.turn
                  ? getPieceName(state.board[r - 1][c - 1]!.type)
                  : '?'
              }}
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
.luzhanqi-container {
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
  max-width: 400px;
  align-items: center;
}
.turn-indicator {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  color: white;
}
.turn-indicator.blue {
  background: #1e3a8a;
}
.turn-indicator.red {
  background: #b91c1c;
}

.reset-btn {
  padding: 8px 16px;
  background: #065f46;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.board-wrapper {
  padding: 10px;
  background: #374151;
  border: 5px solid #111827;
  border-radius: 8px;
}
.board {
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 720px;
  background: #064e3b;
  border: 2px solid #111;
}

.row {
  display: flex;
  flex: 1;
}
.cell {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.cell.camp {
  background: #065f46;
  border-radius: 50%;
  border: 2px solid #fff;
  margin: 2px;
}
.cell.railroad {
  background: #1f2937;
}
.cell.river {
  border-top: 4px solid #fff;
}

.piece {
  width: 70px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  z-index: 2;
  text-align: center;
  color: white;
  border: 2px solid #fff;
}

.piece.blue {
  background: #1e3a8a;
}
.piece.red {
  background: #b91c1c;
}
.piece.selected {
  transform: scale(1.1);
  box-shadow: 0 0 15px #fff;
  border-color: #fbbf24;
}
.piece.hidden {
  background: #4b5563;
  color: transparent;
  border-color: #9ca3af;
}

.move-hint {
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  z-index: 1;
}
</style>
