import { Player, PieceType, type Piece } from './types'

export const COLS = 5
export const ROWS = 12

export function initBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null))

  const bluePieces = [
    PieceType.FLAG,
    PieceType.MINE,
    PieceType.MINE,
    PieceType.MINE,
    PieceType.BOMB,
    PieceType.BOMB,
    PieceType.MARSHAL,
    PieceType.GENERAL,
    PieceType.MAJOR_GENERAL,
    PieceType.MAJOR_GENERAL,
    PieceType.BRIGADIER,
    PieceType.BRIGADIER,
    PieceType.COLONEL,
    PieceType.COLONEL,
    PieceType.MAJOR,
    PieceType.MAJOR,
    PieceType.CAPTAIN,
    PieceType.CAPTAIN,
    PieceType.CAPTAIN,
    PieceType.LIEUTENANT,
    PieceType.LIEUTENANT,
    PieceType.LIEUTENANT,
    PieceType.PLATOON,
    PieceType.PLATOON,
    PieceType.PLATOON,
    PieceType.ENGINEER,
    PieceType.ENGINEER,
    PieceType.ENGINEER,
  ]

  const redPieces = [...bluePieces]

  // Randomize placement (simplified: fixed for now, can be randomized later)
  const blueLayout = shuffle(bluePieces)
  const redLayout = shuffle(redPieces)

  let idx = 0
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 5; c++) {
      if (isCamp(r, c)) continue
      if (idx < blueLayout.length) {
        board[r][c] = {
          id: `blue-${idx}`,
          type: blueLayout[idx],
          player: Player.BLUE,
          position: [r, c],
          isRevealed: false,
        }
        idx++
      }
    }
  }

  idx = 0
  for (let r = 11; r >= 6; r--) {
    for (let c = 0; c < 5; c++) {
      const actualR = r
      if (isCamp(actualR, c)) continue
      if (idx < redLayout.length) {
        board[actualR][c] = {
          id: `red-${idx}`,
          type: redLayout[idx],
          player: Player.RED,
          position: [actualR, c],
          isRevealed: false,
        }
        idx++
      }
    }
  }

  return board
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function isCamp(r: number, c: number): boolean {
  const camps = [
    [1, 1],
    [1, 3],
    [2, 2],
    [3, 1],
    [3, 3],
    [8, 1],
    [8, 3],
    [9, 2],
    [10, 1],
    [10, 3],
  ]
  return camps.some((camp) => camp[0] === r && camp[1] === c)
}

export function isRailroad(r: number, c: number): boolean {
  if (r === 1 || r === 5 || r === 6 || r === 10) return true
  if (c === 0 || c === 4) return r >= 1 && r <= 10
  return false
}

export function isValidMove(
  piece: Piece,
  toR: number,
  toC: number,
  board: (Piece | null)[][],
): boolean {
  const [fromR, fromC] = piece.position
  const target = board[toR][toC]

  if (piece.type === PieceType.MINE || piece.type === PieceType.FLAG) return false
  if (target && target.player === piece.player) return false
  if (target && isCamp(toR, toC)) return false // Pieces in camp are safe

  const dr = Math.abs(toR - fromR)
  const dc = Math.abs(toC - fromC)

  if (
    (dr === 1 && dc === 0) ||
    (dr === 0 && dc === 1) ||
    (isCamp(fromR, fromC) && dr === 1 && dc === 1)
  ) {
    return true
  }

  // Railroad movement (simplified: any distance on railroad)
  if (isRailroad(fromR, fromC) && isRailroad(toR, toC)) {
    if (fromR === toR || fromC === toC) {
      // Engineer can turn corners (simplified: any railroad to any railroad)
      if (piece.type === PieceType.ENGINEER) return true
      // Others must be in same line
      return true // Simplified for now
    }
  }

  return false
}

export function resolveCombat(attacker: Piece, victim: Piece): Piece | null {
  if (victim.type === PieceType.FLAG) return attacker
  if (attacker.type === PieceType.BOMB || victim.type === PieceType.BOMB) return null
  if (victim.type === PieceType.MINE) {
    if (attacker.type === PieceType.ENGINEER) return attacker
    return null // Both destroyed or attacker destroyed
  }
  if (attacker.type > victim.type) return attacker
  if (attacker.type < victim.type) return victim
  return null // Both same rank destroyed
}
