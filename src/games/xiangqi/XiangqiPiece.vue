<script setup lang="ts">
import { PieceColor, PieceType } from './types'
import type { Piece } from './types'
import { computed } from 'vue'

const props = defineProps<{
  piece: Piece
  isSelected?: boolean
}>()

const pieceText = computed(() => {
  const { type, color } = props.piece
  if (color === PieceColor.RED) {
    switch (type) {
      case PieceType.KING:
        return '帅'
      case PieceType.ADVISOR:
        return '仕'
      case PieceType.ELEPHANT:
        return '相'
      case PieceType.HORSE:
        return '傌'
      case PieceType.ROOK:
        return '俥'
      case PieceType.CANNON:
        return '炮'
      case PieceType.PAWN:
        return '兵'
    }
  } else {
    switch (type) {
      case PieceType.KING:
        return '将'
      case PieceType.ADVISOR:
        return '士'
      case PieceType.ELEPHANT:
        return '象'
      case PieceType.HORSE:
        return '馬'
      case PieceType.ROOK:
        return '車'
      case PieceType.CANNON:
        return '砲'
      case PieceType.PAWN:
        return '卒'
    }
  }
  return ''
})

const pieceClass = computed(() => ({
  'piece-red': props.piece.color === PieceColor.RED,
  'piece-black': props.piece.color === PieceColor.BLACK,
  'piece-selected': props.isSelected,
}))
</script>

<template>
  <div class="piece" :class="pieceClass">
    <div class="piece-inner">
      {{ pieceText }}
    </div>
  </div>
</template>

<style scoped>
.piece {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f0d9b5;
  border: 2px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: transform 0.1s;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
}

.piece-inner {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.piece-red {
  color: #d32f2f;
}

.piece-black {
  color: #212121;
}

.piece-selected {
  transform: scale(1.1);
  box-shadow:
    0 0 10px #ffeb3b,
    2px 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.piece:hover {
  transform: scale(1.05);
}
</style>
