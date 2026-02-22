import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import { Suspense, useState, useCallback } from 'react'
import CheckersBoard from './components/CheckersBoard'
import GameUI from './components/GameUI'
import { GameState, Position, Piece } from './types'

const initialPieces: Piece[] = []

// Initialize black pieces (top of board)
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 8; col++) {
    if ((row + col) % 2 === 1) {
      initialPieces.push({
        id: `black-${row}-${col}`,
        color: 'black',
        position: { row, col },
        isKing: false
      })
    }
  }
}

// Initialize red pieces (bottom of board)
for (let row = 5; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    if ((row + col) % 2 === 1) {
      initialPieces.push({
        id: `red-${row}-${col}`,
        color: 'red',
        position: { row, col },
        isKing: false
      })
    }
  }
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    pieces: initialPieces,
    currentTurn: 'red',
    selectedPiece: null,
    validMoves: [],
    capturedRed: 0,
    capturedBlack: 0
  })

  const getValidMoves = useCallback((piece: Piece, pieces: Piece[]): Position[] => {
    const moves: Position[] = []
    const directions = piece.color === 'red' ? [-1] : [1]
    const kingDirections = piece.isKing ? [-1, 1] : directions

    for (const rowDir of kingDirections) {
      for (const colDir of [-1, 1]) {
        const newRow = piece.position.row + rowDir
        const newCol = piece.position.col + colDir

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const occupyingPiece = pieces.find(
            p => p.position.row === newRow && p.position.col === newCol
          )

          if (!occupyingPiece) {
            moves.push({ row: newRow, col: newCol })
          } else if (occupyingPiece.color !== piece.color) {
            // Check for jump
            const jumpRow = newRow + rowDir
            const jumpCol = newCol + colDir
            if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
              const jumpOccupied = pieces.find(
                p => p.position.row === jumpRow && p.position.col === jumpCol
              )
              if (!jumpOccupied) {
                moves.push({ row: jumpRow, col: jumpCol })
              }
            }
          }
        }
      }
    }

    return moves
  }, [])

  const handlePieceClick = useCallback((pieceId: string) => {
    const piece = gameState.pieces.find(p => p.id === pieceId)
    if (!piece || piece.color !== gameState.currentTurn) return

    const validMoves = getValidMoves(piece, gameState.pieces)
    setGameState(prev => ({
      ...prev,
      selectedPiece: pieceId,
      validMoves
    }))
  }, [gameState.pieces, gameState.currentTurn, getValidMoves])

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (!gameState.selectedPiece) return

    const isValidMove = gameState.validMoves.some(
      move => move.row === row && move.col === col
    )

    if (!isValidMove) {
      setGameState(prev => ({
        ...prev,
        selectedPiece: null,
        validMoves: []
      }))
      return
    }

    const piece = gameState.pieces.find(p => p.id === gameState.selectedPiece)
    if (!piece) return

    const rowDiff = Math.abs(row - piece.position.row)
    let newPieces = [...gameState.pieces]
    let capturedRed = gameState.capturedRed
    let capturedBlack = gameState.capturedBlack

    // Check if this is a jump (capture)
    if (rowDiff === 2) {
      const capturedRow = (piece.position.row + row) / 2
      const capturedCol = (piece.position.col + col) / 2
      const capturedPiece = newPieces.find(
        p => p.position.row === capturedRow && p.position.col === capturedCol
      )
      if (capturedPiece) {
        newPieces = newPieces.filter(p => p.id !== capturedPiece.id)
        if (capturedPiece.color === 'red') {
          capturedRed++
        } else {
          capturedBlack++
        }
      }
    }

    // Move the piece
    const pieceIndex = newPieces.findIndex(p => p.id === gameState.selectedPiece)
    const isKing = piece.isKing ||
      (piece.color === 'red' && row === 0) ||
      (piece.color === 'black' && row === 7)

    newPieces[pieceIndex] = {
      ...newPieces[pieceIndex],
      position: { row, col },
      isKing
    }

    setGameState({
      pieces: newPieces,
      currentTurn: gameState.currentTurn === 'red' ? 'black' : 'red',
      selectedPiece: null,
      validMoves: [],
      capturedRed,
      capturedBlack
    })
  }, [gameState])

  const resetGame = useCallback(() => {
    setGameState({
      pieces: initialPieces,
      currentTurn: 'red',
      selectedPiece: null,
      validMoves: [],
      capturedRed: 0,
      capturedBlack: 0
    })
  }, [])

  return (
    <div className="w-screen h-screen bg-[#F5F1EB] overflow-hidden relative">
      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 8], fov: 45 }}
        className="touch-none"
      >
        <color attach="background" args={['#F5F1EB']} />
        <fog attach="fog" args={['#F5F1EB', 15, 30]} />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-5, 8, -5]} intensity={0.3} color="#FFF5E6" />

        <Suspense fallback={null}>
          <Float
            speed={1}
            rotationIntensity={0}
            floatIntensity={0.2}
            floatingRange={[-0.05, 0.05]}
          >
            <CheckersBoard
              gameState={gameState}
              onPieceClick={handlePieceClick}
              onSquareClick={handleSquareClick}
            />
          </Float>

          <ContactShadows
            position={[0, -0.49, 0]}
            opacity={0.4}
            scale={15}
            blur={2.5}
            far={4}
          />

          <Environment preset="apartment" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={8}
          maxDistance={18}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Game UI Overlay */}
      <GameUI
        gameState={gameState}
        onReset={resetGame}
      />

      {/* Footer */}
      <footer className="absolute bottom-3 left-0 right-0 text-center">
        <p className="text-[10px] md:text-xs tracking-wider text-[#8B7355]/50 font-light">
          Requested by @s1s21s21 · Built by @clonkbot
        </p>
      </footer>
    </div>
  )
}

export default App
