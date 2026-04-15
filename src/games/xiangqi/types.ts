export const PieceColor = {
  RED: 'red',
  BLACK: 'black',
} as const

export type PieceColor = (typeof PieceColor)[keyof typeof PieceColor]

export const PieceType = {
  KING: 'king',
  ADVISOR: 'advisor',
  ELEPHANT: 'elephant',
  HORSE: 'horse',
  ROOK: 'rook',
  CANNON: 'cannon',
  PAWN: 'pawn',
} as const

export type PieceType = (typeof PieceType)[keyof typeof PieceType]

export interface Piece {
  id: string
  type: PieceType
  color: PieceColor
  position: [number, number] // [row, col], 0-indexed, row 0-9, col 0-8
}

export interface Move {
  from: [number, number]
  to: [number, number]
  piece: Piece
  capturedPiece?: Piece
}

export interface GameState {
  board: (Piece | null)[][]
  turn: PieceColor
  selectedPiece: Piece | null
  history: Move[]
  winner: PieceColor | null
}
