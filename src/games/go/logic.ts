import { Player } from './types'

export const BOARD_SIZE = 19

export function initBoard(): (Player | null)[][] {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
}

// Check liberties and return captured pieces
export function getCapturedPieces(
  row: number,
  col: number,
  player: Player,
  board: (Player | null)[][],
): [number, number][] {
  const opponent = player === Player.BLACK ? Player.WHITE : Player.BLACK
  const captured: [number, number][] = []
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]

  for (const [dr, dc] of directions) {
    const r = row + dr
    const c = col + dc
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      const group = findGroup(r, c, opponent, board)
      if (!hasLiberties(group, board)) {
        captured.push(...group)
      }
    }
  }

  return captured
}

function findGroup(
  r: number,
  c: number,
  player: Player,
  board: (Player | null)[][],
): [number, number][] {
  const group: [number, number][] = []
  const visited = new Set<string>()
  const queue: [number, number][] = [[r, c]]
  visited.add(`${r},${c}`)

  while (queue.length > 0) {
    const [currR, currC] = queue.shift()!
    group.push([currR, currC])

    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]
    for (const [dr, dc] of directions) {
      const nextR = currR + dr
      const nextC = currC + dc
      const key = `${nextR},${nextC}`
      if (
        nextR >= 0 &&
        nextR < BOARD_SIZE &&
        nextC >= 0 &&
        nextC < BOARD_SIZE &&
        board[nextR][nextC] === player &&
        !visited.has(key)
      ) {
        visited.add(key)
        queue.push([nextR, nextC])
      }
    }
  }
  return group
}

function hasLiberties(group: [number, number][], board: (Player | null)[][]): boolean {
  for (const [r, c] of group) {
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]
    for (const [dr, dc] of directions) {
      const nextR = r + dr
      const nextC = c + dc
      if (
        nextR >= 0 &&
        nextR < BOARD_SIZE &&
        nextC >= 0 &&
        nextC < BOARD_SIZE &&
        board[nextR][nextC] === null
      ) {
        return true
      }
    }
  }
  return false
}

// Suicide check: a move that leaves own group with no liberties (unless it captures opponent)
export function isSuicide(
  row: number,
  col: number,
  player: Player,
  board: (Player | null)[][],
): boolean {
  // Temporary place the stone
  const tempBoard = board.map((row) => [...row])
  tempBoard[row][col] = player

  // If this move captures opponent pieces, it's not suicide
  const captured = getCapturedPieces(row, col, player, tempBoard)
  if (captured.length > 0) return false

  const group = findGroup(row, col, player, tempBoard)
  return !hasLiberties(group, tempBoard)
}
