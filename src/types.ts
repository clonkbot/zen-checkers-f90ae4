export interface Position {
  row: number
  col: number
}

export interface Piece {
  id: string
  color: 'red' | 'black'
  position: Position
  isKing: boolean
}

export interface GameState {
  pieces: Piece[]
  currentTurn: 'red' | 'black'
  selectedPiece: string | null
  validMoves: Position[]
  capturedRed: number
  capturedBlack: number
}
