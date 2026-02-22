import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { GameState } from '../types'
import CheckerPiece from './CheckerPiece'

interface CheckersBoardProps {
  gameState: GameState
  onPieceClick: (pieceId: string) => void
  onSquareClick: (row: number, col: number) => void
}

function BoardSquare({
  row,
  col,
  isDark,
  isValidMove,
  isSelected,
  onClick
}: {
  row: number
  col: number
  isDark: boolean
  isValidMove: boolean
  isSelected: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (meshRef.current) {
      const targetY = hovered && isValidMove ? 0.08 : 0.05
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        delta * 10
      )
    }
  })

  const x = (col - 3.5) * 0.6
  const z = (row - 3.5) * 0.6

  const lightWood = '#E8DCC4'
  const darkWood = '#5C4033'
  const validMoveColor = '#C9A227'

  let color = isDark ? darkWood : lightWood
  if (isValidMove) {
    color = hovered ? '#DAB82F' : validMoveColor
  }

  return (
    <RoundedBox
      ref={meshRef}
      args={[0.58, 0.1, 0.58]}
      radius={0.02}
      smoothness={4}
      position={[x, 0.05, z]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={isDark ? 0.7 : 0.5}
        metalness={0.1}
      />
    </RoundedBox>
  )
}

export default function CheckersBoard({
  gameState,
  onPieceClick,
  onSquareClick
}: CheckersBoardProps) {
  const boardRef = useRef<THREE.Group>(null!)

  // Create board squares
  const squares = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isDark = (row + col) % 2 === 1
      const isValidMove = gameState.validMoves.some(
        move => move.row === row && move.col === col
      )

      squares.push(
        <BoardSquare
          key={`${row}-${col}`}
          row={row}
          col={col}
          isDark={isDark}
          isValidMove={isValidMove}
          isSelected={false}
          onClick={() => onSquareClick(row, col)}
        />
      )
    }
  }

  return (
    <group ref={boardRef}>
      {/* Board base/frame */}
      <RoundedBox
        args={[5.2, 0.2, 5.2]}
        radius={0.08}
        smoothness={4}
        position={[0, -0.1, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#3D2B1F"
          roughness={0.6}
          metalness={0.15}
        />
      </RoundedBox>

      {/* Inner board edge - brass accent */}
      <RoundedBox
        args={[4.95, 0.08, 4.95]}
        radius={0.04}
        smoothness={4}
        position={[0, 0.01, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#C9A227"
          roughness={0.3}
          metalness={0.7}
        />
      </RoundedBox>

      {/* Board squares */}
      {squares}

      {/* Pieces */}
      {gameState.pieces.map(piece => (
        <CheckerPiece
          key={piece.id}
          piece={piece}
          isSelected={gameState.selectedPiece === piece.id}
          isCurrentTurn={gameState.currentTurn === piece.color}
          onClick={() => onPieceClick(piece.id)}
        />
      ))}

      {/* Corner decorations */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
        <mesh
          key={i}
          position={[x * 2.3, 0.01, z * 2.3]}
          rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        >
          <circleGeometry args={[0.12, 6]} />
          <meshStandardMaterial
            color="#C9A227"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}
