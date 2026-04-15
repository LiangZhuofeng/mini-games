import { Player, PieceType, type Piece } from './types'

export const COLS = 7
export const ROWS = 9

export function initBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null))

  const setup = [
    { type: PieceType.LION, pos: [0, 0], player: Player.BLUE },
    { type: PieceType.TIGER, pos: [0, 6], player: Player.BLUE },
    { type: PieceType.DOG, pos: [1, 1], player: Player.BLUE },
    { type: PieceType.CAT, pos: [1, 5], player: Player.BLUE },
    { type: PieceType.RAT, pos: [2, 0], player: Player.BLUE },
    { type: PieceType.LEOPARD, pos: [2, 2], player: Player.BLUE },
    { type: PieceType.WOLF, pos: [2, 4], player: Player.BLUE },
    { type: PieceType.ELEPHANT, pos: [2, 6], player: Player.BLUE },

    { type: PieceType.LION, pos: [8, 6], player: Player.RED },
    { type: PieceType.TIGER, pos: [8, 0], player: Player.RED },
    { type: PieceType.DOG, pos: [7, 5], player: Player.RED },
    { type: PieceType.CAT, pos: [7, 1], player: Player.RED },
    { type: PieceType.RAT, pos: [6, 6], player: Player.RED },
    { type: PieceType.LEOPARD, pos: [6, 4], player: Player.RED },
    { type: PieceType.WOLF, pos: [6, 2], player: Player.RED },
    { type: PieceType.ELEPHANT, pos: [6, 0], player: Player.RED },
  ]

  setup.forEach((p) => {
    board[p.pos[0]][p.pos[1]] = {
      id: `${p.player}-${p.type}`,
      type: p.type,
      player: p.player,
      position: [p.pos[0], p.pos[1]] as [number, number],
    }
  })

  return board
}

export function isRiver(r: number, c: number): boolean {
  return r >= 3 && r <= 5 && ((c >= 1 && c <= 2) || (c >= 4 && c <= 5))
}

export function isTrap(r: number, c: number, _player: Player): boolean {
  const traps = [
    [0, 2],
    [0, 4],
    [1, 3], // Blue traps
    [8, 2],
    [8, 4],
    [7, 3], // Red traps
  ]
  return traps.some((t) => t[0] === r && t[1] === c)
}

export function isDen(r: number, c: number, player: Player): boolean {
  if (player === Player.BLUE) return r === 8 && c === 3
  return r === 0 && c === 3
}

export function isValidMove(
  piece: Piece,
  toR: number,
  toC: number,
  board: (Piece | null)[][],
): boolean {
  const [fromR, fromC] = piece.position
  const target = board[toR][toC]

  // Cannot move to own den
  if (piece.player === Player.BLUE && toR === 0 && toC === 3) return false
  if (piece.player === Player.RED && toR === 8 && toC === 3) return false

  // Cannot capture own piece
  if (target && target.player === piece.player) return false

  const dr = Math.abs(toR - fromR)
  const dc = Math.abs(toC - fromC)

  // Normal movement
  if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
    // Rat in river cannot capture elephant on land
    if (isRiver(fromR, fromC) && !isRiver(toR, toC)) {
      if (target && target.type === PieceType.ELEPHANT) return false
    }
    // Only Rat can enter river
    if (isRiver(toR, toC) && piece.type !== PieceType.RAT) return false

    // Check capture
    if (target) return canCapture(piece, target, fromR, fromC, toR, toC)
    return true
  }

  // Lion/Tiger jump river
  if (
    (piece.type === PieceType.LION || piece.type === PieceType.TIGER) &&
    ((dr === 3 && dc === 0) || (dr === 0 && dc === 2))
  ) {
    // Check if jumping over river
    if (dr === 3) {
      if (!isRiver(fromR + 1, fromC) || !isRiver(fromR + 2, fromC)) return false
      // Check for Rat in river blocking
      if (board[fromR + 1][fromC] || board[fromR + 2][fromC]) return false
    } else {
      if (!isRiver(fromR, fromC + (toC > fromC ? 1 : -1))) return false
      if (board[fromR][fromC + (toC > fromC ? 1 : -1)]) return false
    }
    if (target) return canCapture(piece, target, fromR, fromC, toR, toC)
    return true
  }

  return false
}

function canCapture(
  attacker: Piece,
  victim: Piece,
  fromR: number,
  fromC: number,
  toR: number,
  toC: number,
): boolean {
  // Victim in trap can be captured by anyone
  if (isTrap(toR, toC, victim.player === Player.BLUE ? Player.RED : Player.BLUE)) return true

  // Rat vs Elephant
  if (attacker.type === PieceType.RAT && victim.type === PieceType.ELEPHANT) {
    // Rat in river cannot capture Elephant on land
    return !(isRiver(fromR, fromC) && !isRiver(toR, toC))
  }
  if (attacker.type === PieceType.ELEPHANT && victim.type === PieceType.RAT) return false

  // Rank comparison
  return attacker.type >= victim.type
}
