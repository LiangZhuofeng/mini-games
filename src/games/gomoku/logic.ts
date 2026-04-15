import { Player } from './types'

export const BOARD_SIZE = 15

export function initBoard(): (Player | null)[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
}

export function checkWinner(row: number, col: number, board: (Player | null)[][]): Player | null {
  const player = board[row][col]
  if (!player) return null

  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal
    [1, -1], // anti-diagonal
  ]

  for (const [dr, dc] of directions) {
    let count = 1

    // Check one side
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++
      r += dr
      c += dc
    }

    // Check other side
    r = row - dr
    c = col - dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++
      r -= dr
      c -= dc
    }

    if (count >= 5) return player
  }

  return null
}
