import { PieceColor, PieceType } from './types'
import type { Piece } from './types'

export function createPiece(type: PieceType, color: PieceColor, position: [number, number]): Piece {
  return {
    id: `${color}-${type}-${position[0]}-${position[1]}`,
    type,
    color,
    position,
  }
}

export function initBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 10 }, () => Array(9).fill(null))

  // Initialize Red Pieces (Bottom, Rows 9-5)
  // Rooks
  board[9][0] = createPiece(PieceType.ROOK, PieceColor.RED, [9, 0])
  board[9][8] = createPiece(PieceType.ROOK, PieceColor.RED, [9, 8])
  // Horses
  board[9][1] = createPiece(PieceType.HORSE, PieceColor.RED, [9, 1])
  board[9][7] = createPiece(PieceType.HORSE, PieceColor.RED, [9, 7])
  // Elephants
  board[9][2] = createPiece(PieceType.ELEPHANT, PieceColor.RED, [9, 2])
  board[9][6] = createPiece(PieceType.ELEPHANT, PieceColor.RED, [9, 6])
  // Advisors
  board[9][3] = createPiece(PieceType.ADVISOR, PieceColor.RED, [9, 3])
  board[9][5] = createPiece(PieceType.ADVISOR, PieceColor.RED, [9, 5])
  // King
  board[9][4] = createPiece(PieceType.KING, PieceColor.RED, [9, 4])
  // Cannons
  board[7][1] = createPiece(PieceType.CANNON, PieceColor.RED, [7, 1])
  board[7][7] = createPiece(PieceType.CANNON, PieceColor.RED, [7, 7])
  // Pawns
  for (let i = 0; i < 9; i += 2) {
    board[6][i] = createPiece(PieceType.PAWN, PieceColor.RED, [6, i])
  }

  // Initialize Black Pieces (Top, Rows 0-4)
  // Rooks
  board[0][0] = createPiece(PieceType.ROOK, PieceColor.BLACK, [0, 0])
  board[0][8] = createPiece(PieceType.ROOK, PieceColor.BLACK, [0, 8])
  // Horses
  board[0][1] = createPiece(PieceType.HORSE, PieceColor.BLACK, [0, 1])
  board[0][7] = createPiece(PieceType.HORSE, PieceColor.BLACK, [0, 7])
  // Elephants
  board[0][2] = createPiece(PieceType.ELEPHANT, PieceColor.BLACK, [0, 2])
  board[0][6] = createPiece(PieceType.ELEPHANT, PieceColor.BLACK, [0, 6])
  // Advisors
  board[0][3] = createPiece(PieceType.ADVISOR, PieceColor.BLACK, [0, 3])
  board[0][5] = createPiece(PieceType.ADVISOR, PieceColor.BLACK, [0, 5])
  // King
  board[0][4] = createPiece(PieceType.KING, PieceColor.BLACK, [0, 4])
  // Cannons
  board[2][1] = createPiece(PieceType.CANNON, PieceColor.BLACK, [2, 1])
  board[2][7] = createPiece(PieceType.CANNON, PieceColor.BLACK, [2, 7])
  // Pawns
  for (let i = 0; i < 9; i += 2) {
    board[3][i] = createPiece(PieceType.PAWN, PieceColor.BLACK, [3, i])
  }

  return board
}

export function isValidMove(
  piece: Piece,
  to: [number, number],
  board: (Piece | null)[][],
): boolean {
  const [fromRow, fromCol] = piece.position
  const [toRow, toCol] = to
  const targetPiece = board[toRow][toCol]

  // Cannot capture own piece
  if (targetPiece && targetPiece.color === piece.color) return false

  const rowDiff = Math.abs(toRow - fromRow)
  const colDiff = Math.abs(toCol - fromCol)

  switch (piece.type) {
    case PieceType.KING:
      // Palace: rows 0-2 (Black) or 7-9 (Red), cols 3-5
      const inPalace =
        toCol >= 3 &&
        toCol <= 5 &&
        (piece.color === PieceColor.BLACK ? toRow >= 0 && toRow <= 2 : toRow >= 7 && toRow <= 9)
      if (!inPalace) return false
      return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)

    case PieceType.ADVISOR:
      const inAdvisorPalace =
        toCol >= 3 &&
        toCol <= 5 &&
        (piece.color === PieceColor.BLACK ? toRow >= 0 && toRow <= 2 : toRow >= 7 && toRow <= 9)
      if (!inAdvisorPalace) return false
      return rowDiff === 1 && colDiff === 1

    case PieceType.ELEPHANT:
      if (piece.color === PieceColor.BLACK && toRow > 4) return false
      if (piece.color === PieceColor.RED && toRow < 5) return false
      if (rowDiff === 2 && colDiff === 2) {
        // Eye of elephant
        const eyeRow = (fromRow + toRow) / 2
        const eyeCol = (fromCol + toCol) / 2
        return board[eyeRow][eyeCol] === null
      }
      return false

    case PieceType.HORSE:
      if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
        // Leg of horse
        let blockRow = fromRow
        let blockCol = fromCol
        if (rowDiff === 2) {
          blockRow = (fromRow + toRow) / 2
        } else {
          blockCol = (fromCol + toCol) / 2
        }
        return board[blockRow][blockCol] === null
      }
      return false

    case PieceType.ROOK:
      if (fromRow !== toRow && fromCol !== toCol) return false
      return countPiecesBetween(fromRow, fromCol, toRow, toCol, board) === 0

    case PieceType.CANNON:
      if (fromRow !== toRow && fromCol !== toCol) return false
      const count = countPiecesBetween(fromRow, fromCol, toRow, toCol, board)
      if (!targetPiece) return count === 0
      return count === 1

    case PieceType.PAWN:
      const isForward = piece.color === PieceColor.BLACK ? toRow > fromRow : toRow < fromRow
      if (!isForward && rowDiff !== 0) return false
      if (rowDiff === 1 && colDiff === 0) return true
      // Crossed river
      const crossedRiver = piece.color === PieceColor.BLACK ? fromRow >= 5 : fromRow <= 4
      if (crossedRiver && rowDiff === 0 && colDiff === 1) return true
      return false

    default:
      return false
  }
}

function countPiecesBetween(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
  board: (Piece | null)[][],
): number {
  let count = 0
  if (r1 === r2) {
    const min = Math.min(c1, c2)
    const max = Math.max(c1, c2)
    for (let c = min + 1; c < max; c++) {
      if (board[r1][c]) count++
    }
  } else {
    const min = Math.min(r1, r2)
    const max = Math.max(r1, r2)
    for (let r = min + 1; r < max; r++) {
      if (board[r][c1]) count++
    }
  }
  return count
}

export function isKingFacing(board: (Piece | null)[][]): boolean {
  let redKing: [number, number] | null = null
  let blackKing: [number, number] | null = null

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c]
      if (p?.type === PieceType.KING) {
        if (p.color === PieceColor.RED) redKing = [r, c]
        else blackKing = [r, c]
      }
    }
  }

  if (redKing && blackKing && redKing[1] === blackKing[1]) {
    const col = redKing[1]
    const minRow = Math.min(redKing[0], blackKing[0])
    const maxRow = Math.max(redKing[0], blackKing[0])
    for (let r = minRow + 1; r < maxRow; r++) {
      if (board[r][col]) return false
    }
    return true // Facing each other directly
  }
  return false
}

export function isCheck(color: PieceColor, board: (Piece | null)[][]): boolean {
  let kingPos: [number, number] | null = null
  // Find king
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c]
      if (p?.type === PieceType.KING && p.color === color) {
        kingPos = [r, c]
        break
      }
    }
    if (kingPos) break
  }

  if (!kingPos) return false

  // Check if any opponent piece can move to kingPos
  const opponentColor = color === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const p = board[r][c]
      if (p && p.color === opponentColor) {
        if (isValidMove(p, kingPos, board)) {
          return true
        }
      }
    }
  }

  return false
}
