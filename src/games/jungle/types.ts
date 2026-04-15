export const Player = {
  RED: 'red',
  BLUE: 'blue',
} as const

export type Player = (typeof Player)[keyof typeof Player]

export const PieceType = {
  ELEPHANT: 8,
  LION: 7,
  TIGER: 6,
  LEOPARD: 5,
  WOLF: 4,
  DOG: 3,
  CAT: 2,
  RAT: 1,
} as const

export type PieceType = (typeof PieceType)[keyof typeof PieceType]

export interface Piece {
  id: string
  type: PieceType
  player: Player
  position: [number, number]
}

export interface JungleState {
  board: (Piece | null)[][]
  turn: Player
  selectedPiece: Piece | null
  winner: Player | null
}
