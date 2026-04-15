export const Player = {
  RED: 'red',
  BLUE: 'blue',
} as const

export type Player = (typeof Player)[keyof typeof Player]

export const PieceType = {
  MARSHAL: 9,
  GENERAL: 8,
  MAJOR_GENERAL: 7,
  BRIGADIER: 6,
  COLONEL: 5,
  MAJOR: 4,
  CAPTAIN: 3,
  LIEUTENANT: 2,
  PLATOON: 1,
  ENGINEER: 0,
  MINE: -1,
  BOMB: -2,
  FLAG: -3,
} as const

export type PieceType = (typeof PieceType)[keyof typeof PieceType]

export interface Piece {
  id: string
  type: PieceType
  player: Player
  position: [number, number]
  isRevealed: boolean
}

export interface LuzhanqiState {
  board: (Piece | null)[][]
  turn: Player
  selectedPiece: Piece | null
  winner: Player | null
}
