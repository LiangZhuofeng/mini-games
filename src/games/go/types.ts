export const Player = {
  BLACK: 'black',
  WHITE: 'white',
} as const

export type Player = (typeof Player)[keyof typeof Player]

export interface Move {
  row: number
  col: number
  player: Player
}

export interface GoState {
  board: (Player | null)[][]
  turn: Player
  history: Move[]
  capturedBlack: number
  capturedWhite: number
  lastMove: Move | null
}
