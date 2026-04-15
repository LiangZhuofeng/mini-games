export interface Difficulty {
  id: string
  label: string
  rows: number
  cols: number
  mines: number
}

export interface Cell {
  row: number
  col: number
  hasMine: boolean
  revealed: boolean
  flagged: boolean
  adjacentMines: number
}

export type Board = Cell[][]

export const DIFFICULTIES: Difficulty[] = [
  { id: 'beginner', label: '初级 9x9', rows: 9, cols: 9, mines: 10 },
  { id: 'intermediate', label: '中级 16x16', rows: 16, cols: 16, mines: 40 },
  { id: 'expert', label: '高级 16x30', rows: 16, cols: 30, mines: 99 },
]

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

export function createBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      hasMine: false,
      revealed: false,
      flagged: false,
      adjacentMines: 0,
    })),
  )
}

export function plantMines(
  board: Board,
  mineCount: number,
  safeRow: number,
  safeCol: number,
): void {
  const positions: Array<[number, number]> = []
  const rows = board.length
  const cols = board[0]?.length ?? 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (Math.abs(row - safeRow) <= 1 && Math.abs(col - safeCol) <= 1) {
        continue
      }
      positions.push([row, col])
    }
  }

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }

  positions.slice(0, mineCount).forEach(([row, col]) => {
    board[row][col].hasMine = true
  })

  updateAdjacentCounts(board)
}

export function revealCell(board: Board, row: number, col: number): Cell[] {
  const start = board[row]?.[col]
  if (!start || start.revealed || start.flagged) {
    return []
  }

  const revealed: Cell[] = []
  const stack: Cell[] = [start]

  while (stack.length) {
    const cell = stack.pop()
    if (!cell || cell.revealed || cell.flagged) {
      continue
    }

    cell.revealed = true
    revealed.push(cell)

    if (cell.hasMine || cell.adjacentMines > 0) {
      continue
    }

    for (const [dr, dc] of directions) {
      const next = board[cell.row + dr]?.[cell.col + dc]
      if (next && !next.revealed && !next.flagged && !next.hasMine) {
        stack.push(next)
      }
    }
  }

  return revealed
}

export function revealAllMines(board: Board): void {
  board.flat().forEach((cell) => {
    if (cell.hasMine) {
      cell.revealed = true
    }
  })
}

export function toggleFlag(cell: Cell): boolean {
  if (cell.revealed) {
    return cell.flagged
  }

  cell.flagged = !cell.flagged
  return cell.flagged
}

export function hasWon(board: Board, mineCount: number): boolean {
  const revealedCount = board.flat().filter((cell) => cell.revealed).length
  return revealedCount === board.length * board[0].length - mineCount
}

function updateAdjacentCounts(board: Board): void {
  board.flat().forEach((cell) => {
    cell.adjacentMines = countAdjacentMines(board, cell.row, cell.col)
  })
}

function countAdjacentMines(board: Board, row: number, col: number): number {
  return directions.reduce((count, [dr, dc]) => {
    return count + (board[row + dr]?.[col + dc]?.hasMine ? 1 : 0)
  }, 0)
}
